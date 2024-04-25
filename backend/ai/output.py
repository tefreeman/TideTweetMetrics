import pandas as pd
import json
from transformers import AutoTokenizer
from pathlib import Path
import numpy as np
import re
from torch.utils.data import DataLoader, TensorDataset
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from transformers import BertTokenizerFast, BertForSequenceClassification, AdamW
from torch.cuda.amp import autocast, GradScaler
from textblob import TextBlob
from datetime import datetime
from transformers import BertPreTrainedModel, BertModel
from sklearn.preprocessing import MinMaxScaler
from transformers import get_linear_schedule_with_warmup
import optuna
from torch.optim.lr_scheduler import OneCycleLR
from sklearn.metrics import mean_squared_error, mean_absolute_error
from start import BertForSequenceClassificationWithFeatures
import joblib

# Function to load the model
def load_model(model_dir):
    model_path = Path(model_dir) / 'epoch_13'  # Adjust 'epoch_X' to match your saved model directory
    model = BertForSequenceClassificationWithFeatures.from_pretrained(model_path)
    return model

# Function to load the scaler
def load_scaler(model_dir):
    scaler_path = Path(model_dir) / 'like_count_scaler.save'
    scaler = joblib.load(scaler_path)
    return scaler

# Function to prepare your data - this will need to be adjusted based on your actual data structure
def prepare_data(test_df, scaler):
    # Load the scaler object that was saved in `start.py`
    
    # Assuming the necessary text cleaning and feature preparations are applied as in 'start.py'
    # Text cleaning
    test_df['text'] = test_df['text'].apply(lambda x: ' '.join(re.sub("(https?://[^\s]+)", " ", x).split()))
    
    # Calculate sentiment scores
    test_df['sentiment'] = test_df['text'].apply(lambda x: TextBlob(x).sentiment.polarity)
    
    # Calculate text length AFTER cleaning
    test_df['text_length'] = test_df['text'].apply(len)
    
    # Assuming 'created_at' field exists and is in the same format as in `start.py`
    # Extract day_of_week and hour_of_day from 'created_at' as in 'start.py'
    test_df['created_at'] = pd.to_datetime(test_df['created_at'])
    test_df['day_of_week'] = test_df['created_at'].dt.weekday
    test_df['hour_of_day'] = test_df['created_at'].dt.hour
    
    # Scale numeric features


    scaled_columns = ['followers_count', 'hashtag_count', 'mention_count', 'url_count', 'photo_count', 'video_count', 'text_length', 'avg_last_10_likes']
    test_df[scaled_columns] = scaler.transform(test_df[scaled_columns])
    
    # Tokenization process
    tokenizer = BertTokenizerFast.from_pretrained('bert-base-uncased')
    test_encodings = tokenizer(test_df['text'].tolist(), padding=True, truncation=True, return_tensors='pt')
    
    feature_columns = ['followers_count', 'hashtag_count', 'mention_count', 'url_count', 'photo_count', 'video_count', 'sentiment', 'text_length', 'day_of_week', 'hour_of_day', 'avg_last_10_likes']
    test_features = torch.tensor(test_df[feature_columns].values, dtype=torch.float)
    
    # Preparing labels (conditional)

    if 'like_count' in test_df.columns:
        test_df['like_count_scaled'] = scaler.transform(test_df[['like_count']])

    if 'like_count_scaled' in test_df.columns:
        test_labels = torch.tensor(test_df['like_count_scaled'].values, dtype=torch.float)
        test_dataset = TensorDataset(test_encodings['input_ids'], test_encodings['attention_mask'], test_features, test_labels)
    else:
        test_labels = None 
        test_dataset = TensorDataset(test_encodings['input_ids'], test_encodings['attention_mask'], test_features)
    
    return test_dataset

def get_dataFrame_from_json():
    with open("D:\\TideTweetMetrics\\backend\\ai\\data\\v2_profiles.json", 'r', encoding='utf-8') as file:
        profiles = json.load(file)

    profile_dict = {}
    for profile in profiles:
        profile_dict[profile['username']] = profile['public_metrics']['followers_count']

    with open("D:\\TideTweetMetrics\\backend\\ai\\data\\v2_tweets.json", 'r', encoding='utf-8') as file:
        data = json.load(file)


    # First, build a dictionary to hold the last 5 likes per author
    author_last_10_likes_avg = {}

    # Initialize author tweets dict for accumulating tweets by author
    author_tweets = {}

    # Accumulate tweets by authors
    for tweet in data:
        author_id = tweet['data']['author_id']
        if author_id not in author_tweets:
            author_tweets[author_id] = []
        author_tweets[author_id].append(tweet)

    # Calculate the average of the last 5 likes for each author
    for author_id, tweets in author_tweets.items():
        # Sort tweets by created_at
        sorted_tweets = sorted(tweets, key=lambda x: x['data']['created_at']['$date'], reverse=True)
        # Take last 5 tweets
        last_5_tweets = sorted_tweets[:10]
        # Calculate average likes
        avg_likes = np.mean([tweet['data']['public_metrics']['like_count'] for tweet in last_5_tweets])
        # Store in dict
        author_last_10_likes_avg[author_id] = avg_likes

    # Then adapt the creation of the tweets list to include the average likes of the last 5 tweets
    tweets = [{
        'text': tweet['data']['text'],
        'like_count': tweet['data']['public_metrics']['like_count'],
        'created_at': tweet['data']['created_at']['$date'],
        'author_id': tweet['data']['author_id'],
        'hashtag_count': len(tweet['data']['entities']['hashtags']),
        'mention_count': len(tweet['data']['entities']['mentions']),
        'url_count': len(tweet['data']['entities']['urls']),
        'photo_count': len(tweet['data']['attachments']['photos']),
        'video_count': len(tweet['data']['attachments']['videos']),
        'avg_last_10_likes': author_last_10_likes_avg.get(tweet['data']['author_id'], 0),  # Add the avg likes
    } for tweet in data]
    # Flatten the JSON data into a more convenient format




    # Add the followers_count field to the tweets
    # if the author_id is in the profile_dict
    # otherwise, set the tweet to None
    for i in range(len(tweets)):
        if tweets[i]['author_id'] in profile_dict:
            tweets[i]['followers_count'] = profile_dict[tweets[i]['author_id']]
            del tweets[i]['author_id']
        else:
            tweets[i] = None

    # Remove None values
    tweets = [tweet for tweet in tweets if tweet is not None]


    # Create a DataFrame
    df = pd.DataFrame(tweets)

    return df

# Main function to evaluate the model
def evaluate_model(model, test_inputs, true_counts):
    # Ensure the model is in evaluation mode
    model.eval()

    # Check if CUDA is available and move the model to GPU
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)
    
    # Move the test_inputs to the same device as the model
    test_inputs = test_inputs.to(device)

    with torch.no_grad():
        outputs = model(test_inputs)
        # Assuming outputs are logits and the operation happens on the GPU
        predicted_counts_scaled = outputs.logits.cpu().numpy()  # Move data back to CPU for numpy operations

    return predicted_counts_scaled, true_counts

if __name__ == '__main__':
    model_dir = 'D:\\TideTweetMetrics\\backend\\ai\\model_save'
    test_data_path = 'path_to_your_test_data.csv'  # Specify the path to your test data

    # Load model and scaler
    model = load_model(model_dir)
    scaler = load_scaler(model_dir)
    
    # Load and prepare your test data
    test_df = get_dataFrame_from_json()
    test_inputs, true_counts = prepare_data(test_df, scaler)

    # Evaluate the model
    predicted_counts_scaled, true_counts = evaluate_model(model, test_inputs, true_counts)

    # Rescale predictions
    predicted_counts = scaler.inverse_transform(predicted_counts_scaled.reshape(-1, 1)).flatten()


    # Calculate MSE and MAE
    mse = mean_squared_error(true_counts, predicted_counts)
    mae = mean_absolute_error(true_counts, predicted_counts)

    print(f"MSE: {mse}")
    print(f"MAE: {mae}")
