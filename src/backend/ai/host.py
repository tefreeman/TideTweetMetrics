import pandas as pd
import json
from transformers import BertTokenizerFast, BertForSequenceClassification
from torch.utils.data import DataLoader, TensorDataset
import torch
from datetime import datetime
import joblib
from ai_config import SCALER_DIR, MODEL_DIR, TWEETS_FILE_PATH, PROFILES_FILE_PATH, SCALERS_CONFIG
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import pandas as pd
import json
from transformers import AutoTokenizer
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
from torch.optim.lr_scheduler import OneCycleLR
from sklearn.metrics import mean_squared_error, mean_absolute_error
torch.cuda.empty_cache()
import os
import joblib
from ai_config import SCALER_DIR, MODEL_DIR, TWEETS_FILE_PATH, PROFILES_FILE_PATH, SCALERS_CONFIG
from backend.ai.train import BertForSequenceClassificationWithFeatures
from common import get_last_tweets_like_average, get_followers_count


app = FastAPI()

class Tweet(BaseModel):
    text: str
    author_id: str
    created_at: str
    entities: dict
    attachments: dict

class TweetList(BaseModel):
    tweets: List[Tweet]


@app.on_event("startup")
def load_model_and_scalers():
    global model, like_count_scaler, features_scaler, tokenizer, avg_last_10_likes_for_profiles, twitter_profiles
    model_path = MODEL_DIR + '/epoch_21'
    like_count_scaler_path = SCALER_DIR + SCALERS_CONFIG.get('like_count')
    features_scaler_path = SCALER_DIR + SCALERS_CONFIG.get('features')

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    model = load_model(model_path).to(device)
    like_count_scaler, features_scaler = load_scalers(like_count_scaler_path, features_scaler_path)
    tokenizer = BertTokenizerFast.from_pretrained('bert-base-uncased')

    avg_last_10_likes_for_profiles = get_last_tweets_like_average(10)
    twitter_profiles = get_followers_count()

def preprocess_and_tokenize(tweet_list):

    # Collect averages, text clean, sentiment etc.
    data = tweet_list.tweets


    tweets = [{
        'text': tweet.text,
        'created_at': datetime.strptime(tweet.created_at, '%Y-%m-%dT%H:%M:%S.%fZ'),
        'author_id': tweet.author_id,
        'followers_count': twitter_profiles.get(tweet.author_id, 0),
        'hashtag_count': len(tweet.entities.get('hashtags', [])),
        'mention_count': len(tweet.entities.get('mentions', [])),
        'url_count': len(tweet.entities.get('urls', [])),
        'photo_count': len(tweet.attachments.get('photos', [])),
        'video_count': len(tweet.attachments.get('videos', [])),
        'avg_last_10_likes': avg_last_10_likes_for_profiles.get(tweet.author_id, 0)
    } for tweet in data]

    print(tweets)

    df = pd.DataFrame(tweets)
    df['text'] = df['text'].apply(lambda x: ' '.join(re.sub("(https?://[^\s]+)", " ", x).split()))
    df['sentiment'] = df['text'].apply(lambda x: TextBlob(x).sentiment.polarity)
    df['text_length'] = df['text'].apply(len)
    df['day_of_week'] = df['created_at'].apply(lambda x: x.weekday())
    df['hour_of_day'] = df['created_at'].apply(lambda x: x.hour)

    encoded_texts = encode_texts(df['text'].tolist())
    scale_columns = ['followers_count', 'hashtag_count', 'mention_count', 'url_count', 'photo_count', 'video_count', 'text_length', 'avg_last_10_likes']
    df[scale_columns] = features_scaler.transform(df[scale_columns])

    features_tensor = torch.tensor(df[['followers_count', 'hashtag_count', 'mention_count', 'url_count', 'photo_count', 'video_count', 'sentiment', 'text_length', 'day_of_week', 'hour_of_day', 'avg_last_10_likes']].values, dtype=torch.float)
    return encoded_texts, features_tensor

def encode_texts(texts):
    return tokenizer(texts, padding=True, truncation=True, return_tensors='pt')

@app.post("/predict")
def predict_likes(tweet_list: TweetList):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    encoded_texts, features_tensor = preprocess_and_tokenize(tweet_list)
    data_loader = DataLoader(TensorDataset(encoded_texts['input_ids'], encoded_texts['attention_mask'], features_tensor), batch_size=64, shuffle=False)

    model.eval()
    predictions = []
    with torch.no_grad():
        for batch in data_loader:
            input_ids, attention_mask, additional_features = [t.to(device) for t in batch]
            outputs = model(input_ids=input_ids, attention_mask=attention_mask, additional_features=additional_features)
            logits = outputs
            predictions.extend(logits.detach().cpu().numpy().flatten())
    
    predictions_unscaled = like_count_scaler.inverse_transform(np.array(predictions).reshape(-1, 1)).flatten()
    return {'predictions': predictions_unscaled.tolist()}

def load_model(model_path):
    model = BertForSequenceClassificationWithFeatures.from_pretrained(model_path)
    model.eval()  # Set the model to evaluation mode
    return model

def load_scalers(like_count_scaler_path, features_scaler_path):
    like_count_scaler = joblib.load(like_count_scaler_path)
    features_scaler = joblib.load(features_scaler_path)
    return like_count_scaler, features_scaler

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

