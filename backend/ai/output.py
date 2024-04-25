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
from start import BertForSequenceClassificationWithFeatures  # Adjust the import based on your file structure


def load_scaler(name):
    # This function should contain logic to load a scaler based on the name
    # For demonstration, this is a placeholder
    return MinMaxScaler()  # Placeholder, should actually load from file


def load_assets(model_path, tokenizer_path='bert-base-uncased'):
    """
    Load the model and tokenizer from saved paths.
    """
    model = BertForSequenceClassificationWithFeatures.from_pretrained(model_path)
    tokenizer = BertTokenizerFast.from_pretrained(tokenizer_path)
    
    # Your model might also have additional assets like scalers for features, load them here if necessary
    # For demonstration purposes, we will not include scalers. Adjust according to your needs. 

    return model, tokenizer

def preprocess_features(features, feature_names, scalers):
    # Assuming features is a dict where keys match feature_names and scalers
    preprocessed_features = []
    for feature_name in feature_names:
        scaler = scalers[feature_name]
        scaled_feature = scaler.transform([[features[feature_name]]])[0]  # Reshape might be needed
        preprocessed_features.append(scaled_feature)
        
    return preprocessed_features


def transform_input(text, additional_features):
    # Preprocess text
    text = preprocess_text(text)
    
    # Load tokenizer
    tokenizer = BertTokenizerFast.from_pretrained('bert-base-uncased')
    
    # These feature names and loading mechanisms should match those in the training phase
    feature_names = ['followers_count', 'hashtag_count', 'mention_count', 'url_count', 'photo_count', 'video_count', 'text_length', 'avg_last_10_likes']
    scalers = {feature: load_scaler(feature) for feature in feature_names}  # Obviously placeholder
    
    # Preprocess features (scaling, etc.)
    additional_features_processed = preprocess_features(additional_features, feature_names, scalers)
    
    # Tokenization
    inputs = tokenizer(text, padding=True, truncation=True, max_length=512, return_tensors="pt")
    
    return {
        "text": text,
        "additional_features": additional_features_processed,
        "input_ids": inputs["input_ids"],
        "attention_mask": inputs["attention_mask"],
    }


def transform_tweet_to_input(tweet, profile_dict, text_scaler, feature_scaler):
    """
    Transforms a tweet object into the format expected by the predict function.

    :param tweet: A dict containing tweet data.
    :param profile_dict: A dict mapping author_id to followers_count.
    :param text_scaler: Scaler object for text-related features.
    :param feature_scaler: Scaler object for non-text features.
    :return: Dictionary with tokenized text and scaled features suitable for prediction.
    """

    # Extract and preprocess the tweet text
    text = tweet['data']['text']
    text_clean = ' '.join(re.sub("(https?://[^\s]+)", " ", text).split())

    # Calculate sentiment (you may have a specific function for text preprocessing)
    sentiment = TextBlob(text_clean).sentiment.polarity

    # Extract features
    hashtag_count = len(tweet['data']['entities']['hashtags'])
    mention_count = len(tweet['data']['entities']['mentions'])
    url_count = len(tweet['data']['entities']['urls'])
    
    photo_count = 0
    video_count = 0
    if 'attachments' in tweet['data']:
        if 'photos' in tweet['data']['attachments']:
            photo_count = len(tweet['data']['attachments']['photos'])
        if 'videos' in tweet['data']['attachments']:
            video_count = len(tweet['data']['attachments']['videos'])

    followers_count = profile_dict[tweet['data']['author_id']] if tweet['data']['author_id'] in profile_dict else 0

    # The average likes for the last 10 tweets is assumed to be precomputed and available.
    # Replacing with 0 if not present for the sake of example.
    avg_last_10_likes = 0  # A placeholder, will need actual data.

    # Features that should be scaled according to your training phase
    features = np.array([[followers_count, hashtag_count, mention_count, url_count, photo_count, video_count, sentiment]])

    # Scale the features as in the preprocessing phase
    # Note: you would load your scaling model here and apply transform
    scaled_features = feature_scaler.transform(features)

    # Tokenize the text
    tokenizer = BertTokenizerFast.from_pretrained('bert-base-uncased')
    tokens = tokenizer(text_clean, padding=True, truncation=True, max_length=512, return_tensors="pt")

    # Return a combined dict ready for the model input
    return {
        'input_ids': tokens['input_ids'],
        'attention_mask': tokens['attention_mask'],
        'features': torch.tensor(scaled_features, dtype=torch.float)
    }


def preprocess_data(text, tokenizer, additional_features, device='cuda'):
    """
    Preprocess input data (text and additional features) for prediction.
    """
    # Tokenize text inputs
    inputs = tokenizer(text, padding=True, truncation=True, max_length=512, return_tensors="pt")
    input_ids = inputs["input_ids"].to(device)
    attention_mask = inputs["attention_mask"].to(device)
    
    # Convert additional_features to tensor and send to the same device as model
    # Note: You'd pre-process these features similarly to how you did during training
    additional_features_tensor = torch.tensor(additional_features).float().to(device)

    return input_ids, attention_mask, additional_features_tensor

def predict(text, additional_features, model, tokenizer, device='cuda'):
    """
    Predict function to output the model's prediction.
    """
    model.eval()  # Ensure model is in evaluation mode
    
    # Preprocess the input data
    input_ids, attention_mask, additional_features_tensor = preprocess_data(text, tokenizer, additional_features, device)
    
    # Move model to the device
    model = model.to(device)

    with torch.no_grad():
        # Forward pass, get predictions, and apply sigmoid function to get probabilities
        outputs = model(input_ids, attention_mask=attention_mask, additional_features=additional_features_tensor)
        predictions = torch.sigmoid(outputs.logits).squeeze()
        
    return predictions.cpu().numpy()

# Example usage
model_path = "D:\\TideTweetMetrics\\backend\\ai\\model_save\\epoch_13"


# Assuming you have a single text input and its corresponding additional_features
text = "Example text for prediction"
additional_features = [0.5] * 7  # Assuming 7 additional features, adjust based on your model

model, tokenizer = load_assets(model_path)
prediction = predict([text], additional_features, model, tokenizer)

print("Prediction:", prediction)
