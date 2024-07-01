import pandas as pd
from transformers import BertTokenizerFast, BertForSequenceClassification
from torch.utils.data import DataLoader, TensorDataset
import torch
from datetime import datetime
import joblib
from ai_config import SCALER_SAVE_DIR, MODEL_SAVE_DIR, TWEETS_FILE_PATH, PROFILES_FILE_PATH, SCALERS_CONFIG
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import pandas as pd
import numpy as np
import re
from torch.utils.data import DataLoader, TensorDataset
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from transformers import BertTokenizerFast
from textblob import TextBlob
from datetime import datetime
torch.cuda.empty_cache()
import joblib
from ai_config import SCALER_SAVE_DIR, MODEL_SAVE_DIR, TWEETS_FILE_PATH, PROFILES_FILE_PATH, SCALERS_CONFIG
from backend.config import Config
from backend.ai.train import BertForSequenceClassificationWithFeatures
from common import get_last_tweets_like_average, get_followers_count
from openai import OpenAI

app = FastAPI()

class Tweet(BaseModel):
    text: str
    author_id: str
    created_at: str
    mentions: List[str] = []
    photo_count: int
    video_count: int
    
class TweetList(BaseModel):
    tweets: List[Tweet]

def get_hashtag_count(tweet_text):
    return len(re.findall(r'#[a-z0-9_]+', tweet_text))
    
def get_url_count(tweet_text):
    return len(re.findall(r'https?://[^\s]+', tweet_text))


@app.on_event("startup")
def load_model_and_scalers():
    global model, like_count_scaler, mm_features_scaler, r_features_scaler, tokenizer, avg_last_10_likes_for_profiles, twitter_profiles, gpt_client
    model_path = MODEL_SAVE_DIR + 'epoch_41'
    like_count_scaler_path = SCALER_SAVE_DIR + SCALERS_CONFIG.get('like_count')
    mm_features_scaler_path = SCALER_SAVE_DIR + SCALERS_CONFIG.get('mm_features')
    r_features_scaler_path = SCALER_SAVE_DIR + SCALERS_CONFIG.get('r_features')

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    model = load_model(model_path).to(device)
    like_count_scaler, mm_features_scaler, r_features_scaler = load_scalers(like_count_scaler_path, mm_features_scaler_path, r_features_scaler_path)
    tokenizer = BertTokenizerFast.from_pretrained('bert-base-uncased')

    avg_last_10_likes_for_profiles = get_last_tweets_like_average(10)
    twitter_profiles = get_followers_count()
    
    Config.init()
    gpt_client = OpenAI(organization=Config.get_gpt_org_id(), project=Config.get_gpt_project_id(), api_key=Config.get_gpt_api_key())
                        
def preprocess_and_tokenize(tweet_list):

    # Collect averages, text clean, sentiment etc.


    tweets = [{
        'text': tweet.text,
        'created_at': datetime.strptime(tweet.created_at, '%Y-%m-%dT%H:%M:%S.%fZ'),
        'author_id': tweet.author_id,
        'followers_count': twitter_profiles.get(tweet.author_id, 0),
        'hashtag_count': get_hashtag_count(tweet.text),
        'mention_count': len(tweet.mentions),
        'url_count': get_url_count(tweet.text),
        'photo_count': tweet.photo_count, 
        'video_count': tweet.video_count,
        'avg_last_10_likes': avg_last_10_likes_for_profiles.get(tweet.author_id, 0)
    } for tweet in tweet_list]

    print(tweets)

    df = pd.DataFrame(tweets)
    df['text'] = df['text'].apply(lambda x: ' '.join(re.sub("(https?://[^\s]+)", " ", x).split()))
    df['sentiment'] = df['text'].apply(lambda x: TextBlob(x).sentiment.polarity)
    df['text_length'] = df['text'].apply(len)
    df['day_of_week'] = df['created_at'].apply(lambda x: x.weekday())
    df['hour_of_day'] = df['created_at'].apply(lambda x: x.hour)

    encoded_texts = encode_texts(df['text'].tolist())
    mm_scale_columns = ['hashtag_count', 'mention_count', 'url_count', 'photo_count', 'video_count', 'text_length']
    r_scale_columns = ['followers_count', 'avg_last_10_likes']

    mm_features_scaler.fit_transform(df[mm_scale_columns])
    r_features_scaler.fit_transform(df[r_scale_columns])

    features_tensor = torch.tensor(df[['followers_count', 'hashtag_count', 'mention_count', 'url_count', 'photo_count', 'video_count', 'sentiment', 'text_length', 'day_of_week', 'hour_of_day', 'avg_last_10_likes']].values, dtype=torch.float)
    return encoded_texts, features_tensor

def encode_texts(texts):
    return tokenizer(texts, padding=True, truncation=True, return_tensors='pt')

@app.post("/predict")
def predict(tweet_list: TweetList):
    return predict_likes(tweet_list)


def load_model(model_path):
    model = BertForSequenceClassificationWithFeatures.from_pretrained(model_path)
    model.eval()  # Set the model to evaluation mode
    return model

def load_scalers(like_count_scaler_path, mm_features_scaler_path, r_features_scaler_path):
    like_count_scaler = joblib.load(like_count_scaler_path)
    mm_features_scaler = joblib.load(mm_features_scaler_path)
    r_features_scaler = joblib.load(r_features_scaler_path)
    return like_count_scaler, mm_features_scaler, r_features_scaler


def generate_tweets(tweet: Tweet):
    # Define the prompt
    prompt = (
        "Rewrite the following tweet five times to make it more engaging and likely to receive more likes. "
        "Respond with only the rewritten tweet and no additional text. "
        "Respond with only the tweets separated by newline characters. "
        "Do not include any additional text or descriptions. "
        f"{tweet.text}"
    )

    # Request to OpenAI API
    response = gpt_client.chat.completions.create(
    model="gpt-4",
    messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt},
        ]
    )


    tweets = response.choices[0].message.content.split('\n')

    
    # filter out empty strings
    tweets = list(filter(None, tweets))
    tweets = list(filter(lambda x: len(x) > 0, tweets))

    return tweets

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

@app.post("/optimize_tweet")
def optimize_tweet(tweet: Tweet):
    input_tweet = Tweet(text=tweet.text, author_id=tweet.author_id, created_at=tweet.created_at, mentions=tweet.mentions, photo_count=tweet.photo_count, video_count=tweet.video_count)
    new_tweets = generate_tweets(input_tweet)

    tweet_list = []
    tweet_list.append(input_tweet)
    for new_tweet in new_tweets:
        tweet_list.append(Tweet(text=new_tweet, author_id=tweet.author_id, created_at=tweet.created_at,
                                 mentions=tweet.mentions, photo_count=tweet.photo_count, video_count=tweet.video_count))

    return predict_likes(tweet_list)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
