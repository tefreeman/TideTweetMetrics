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
torch.cuda.empty_cache()
import os
import joblib

from start import BertForSequenceClassificationWithFeatures
# Assuming these are the definitions for your custom dataset and model
# from your_dataset_module import YourCustomDataset
# from your_model_module import YourModel




def get(like_count_scaler, features_scaler):
    
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
    tweets = tweets[0:1000]
    # Create a DataFrame
    df = pd.DataFrame(tweets)

    # Data cleaning (e.g., removing URLs, special characters)
    df['text'] = df['text'].apply(lambda x: ' '.join(re.sub("(https?://[^\s]+)", " ", x).split()))

    # Calculate sentiment scores
    df['sentiment'] = df['text'].apply(lambda x: TextBlob(x).sentiment.polarity)

    # Calculate text length
    df['text_length'] = df['text'].apply(len)


    # Format the 'created_at' field and extract time-based features
    df['created_at'] = df['created_at'].apply(lambda x: datetime.strptime(x, '%Y-%m-%dT%H:%M:%S.%fZ'))
    df['day_of_week'] = df['created_at'].apply(lambda x: x.weekday())
    df['hour_of_day'] = df['created_at'].apply(lambda x: x.hour)


    # Splitting the dataset into training, validation, and test sets
    train, validate, test = np.split(df.sample(frac=1, random_state=42),
                                    [int(.8*len(df)), int(.9*len(df))])


    # Fit to training data and transform
    train['like_count_scaled'] = like_count_scaler.fit_transform(train[['like_count']])

    # Transform validation and test sets
    validate['like_count_scaled'] = like_count_scaler.transform(validate[['like_count']])
    test['like_count_scaled'] = like_count_scaler.transform(test[['like_count']])


    # Loading the scaler object
    #like_count_scaler = joblib.load('D:\\TideTweetMetrics\\backend\\ai\\model_save\\like_count_scaler.save')

    # Tokenization and Encoding
    tokenizer = BertTokenizerFast.from_pretrained('bert-base-uncased')

    def encode_texts(texts):
        return tokenizer(texts, padding=True, truncation=True, return_tensors='pt')

    train_encodings = encode_texts(train['text'].tolist())
    validate_encodings = encode_texts(validate['text'].tolist())
    test_encodings = encode_texts(test['text'].tolist())

    # Then, when converting to tensors, use the scaled column
    train_labels = torch.tensor(train['like_count_scaled'].values)
    validate_labels = torch.tensor(validate['like_count_scaled'].values)
    test_labels = torch.tensor(test['like_count_scaled'].values)


    # Create a MinMaxScaler object
    features_scaler = MinMaxScaler()

    # Define the columns to be scaled
    scale_columns = ['followers_count', 'hashtag_count', 'mention_count', 'url_count', 'photo_count', 'video_count', 'text_length', 'avg_last_10_likes']

    # Fit the scaler on the training data and transform the data
    train[scale_columns] = features_scaler.fit_transform(train[scale_columns])
    validate[scale_columns] = features_scaler.transform(validate[scale_columns])
    test[scale_columns] = features_scaler.transform(test[scale_columns])


    # Create additional feature tensors with scaled features
    train_features = torch.tensor(train[['followers_count', 'hashtag_count', 'mention_count', 'url_count', 'photo_count', 'video_count', 'sentiment', 'text_length', 'day_of_week', 'hour_of_day', 'avg_last_10_likes']].values, dtype=torch.float)
    validate_features = torch.tensor(validate[['followers_count', 'hashtag_count', 'mention_count', 'url_count', 'photo_count', 'video_count', 'sentiment', 'text_length', 'day_of_week', 'hour_of_day', 'avg_last_10_likes']].values, dtype=torch.float)
    test_features = torch.tensor(test[['followers_count', 'hashtag_count', 'mention_count', 'url_count', 'photo_count', 'video_count', 'sentiment', 'text_length', 'day_of_week', 'hour_of_day', 'avg_last_10_likes']].values, dtype=torch.float)

    # Create TensorDatasets
    train_dataset = TensorDataset(train_encodings['input_ids'], train_encodings['attention_mask'], train_features, train_labels)
    validate_dataset = TensorDataset(validate_encodings['input_ids'], validate_encodings['attention_mask'], validate_features, validate_labels)
    test_dataset  = TensorDataset(test_encodings['input_ids'], test_encodings['attention_mask'], test_features, test_labels)


    return train_dataset, validate_dataset, test_dataset

def load_model(model_path):
    
    model = BertForSequenceClassificationWithFeatures.from_pretrained(model_path)
    model.eval()  # Set the model to evaluation mode
    return model

def load_scalers(like_count_scaler_path, features_scaler_path):
    like_count_scaler = joblib.load(like_count_scaler_path)
    features_scaler = joblib.load(features_scaler_path)
    return like_count_scaler, features_scaler

def evaluate_model(model, dataloader, device):
    predictions, true_labels = [], []
    model.eval()  # Ensure the model is in evaluation mode
    with torch.no_grad():
        for batch in dataloader:
            # Assuming the `batch` consists of 4 elements: input_ids, attention_mask, additional_features, and labels
            # and is unpacked accordingly
            input_ids, attention_mask, additional_features, labels = [t.to(device) for t in batch]

            outputs = model(input_ids=input_ids,
                            attention_mask=attention_mask,
                            additional_features=additional_features)  # Corrected line

            logits = outputs

            # Move logits and labels to CPU for further computation
            predictions.extend(logits.detach().cpu().numpy())
            true_labels.extend(labels.detach().cpu().numpy())

    print(f"Predictions shape: {np.array(predictions).shape}")
    print(f"True labels shape: {np.array(true_labels).shape}")

    return np.array(predictions), np.array(true_labels)

def compute_unscaled_metrics(predictions_scaled, true_labels_scaled, like_count_scaler):
    predictions_unscaled = like_count_scaler.inverse_transform(predictions_scaled.reshape(-1, 1)).flatten()
    true_labels_unscaled = like_count_scaler.inverse_transform(true_labels_scaled.reshape(-1, 1)).flatten()
    mse = mean_squared_error(true_labels_unscaled, predictions_unscaled)
    mae = mean_absolute_error(true_labels_unscaled, predictions_unscaled)
    return mse, mae

if __name__ == "__main__":
    # Adjust the paths accordingly
    model_path = 'D:\\TideTweetMetrics\\backend\\ai\\model_save\\epoch_13'
    like_count_scaler_path = 'D:\TideTweetMetrics\\backend\\ai\model_save\like_count_scaler.save'
    features_scaler_path = 'D:\TideTweetMetrics\\backend\\ai\model_save\\feature_scaler.save'

    # Device configuration
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    # Load the model, scalers, and test dataset
    model = load_model(model_path).to(device)
    like_count_scaler, features_scaler = load_scalers(like_count_scaler_path, features_scaler_path)

    _, _, test_dataset = get(like_count_scaler, features_scaler)  # Add correct transform if needed

    test_dataloader = DataLoader(test_dataset, batch_size=64, shuffle=False)

    # Evaluate the model to get scaled predictions
    predictions_scaled, true_labels_scaled = evaluate_model(model, test_dataloader, device)

    # Compute MSE and MAE using unscaled predictions and labels
    mse, mae = compute_unscaled_metrics(predictions_scaled, true_labels_scaled, like_count_scaler)
    print(f"Mean Squared Error (Unscaled): {mse}")
    print(f"Mean Absolute Error (Unscaled): {mae}")