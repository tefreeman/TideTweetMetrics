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


with open("D:\\TideTweetMetrics\\backend\\ai\\data\\v2_tweets.json", 'r', encoding='utf-8') as file:
    data = json.load(file)
    # Flatten the JSON data into a more convenient format
    tweets = [{
        'id': tweet['data']['id'],
        'text': tweet['data']['text'],
        'like_count': tweet['data']['public_metrics']['like_count'],
        'created_at': tweet['data']['created_at']['$date']
    } for tweet in data]

# Create a DataFrame
df = pd.DataFrame(tweets)

# Data cleaning (e.g., removing URLs, special characters)
df['text'] = df['text'].apply(lambda x: ' '.join(re.sub("(https?://[^\s]+)", " ", x).split()))

# Splitting the dataset into training, validation, and test sets
train, validate, test = np.split(df.sample(frac=1, random_state=42), 
                                 [int(.8*len(df)), int(.9*len(df))])


# Tokenization and Encoding
tokenizer = BertTokenizerFast.from_pretrained('bert-base-uncased')

def encode_texts(texts):
    return tokenizer(texts, padding=True, truncation=True, return_tensors='pt')

train_encodings = encode_texts(train['text'].tolist())
validate_encodings = encode_texts(validate['text'].tolist())
test_encodings = encode_texts(test['text'].tolist())


# Convert Pandas series to tensors
train_labels = torch.tensor(train['like_count'].values)
validate_labels = torch.tensor(validate['like_count'].values)
test_labels = torch.tensor(test['like_count'].values)

# Create TensorDatasets
train_dataset = TensorDataset(train_encodings['input_ids'], train_encodings['attention_mask'], train_labels)
validate_dataset = TensorDataset(validate_encodings['input_ids'], validate_encodings['attention_mask'], validate_labels)
test_dataset = TensorDataset(test_encodings['input_ids'], test_encodings['attention_mask'], test_labels)

# Create DataLoaders with smaller batch sizes
batch_size = 64
train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
validate_loader = DataLoader(validate_dataset, batch_size=batch_size)
test_loader = DataLoader(test_dataset, batch_size=batch_size)

# Load a pre-trained model
# Load a pre-trained model
model = BertForSequenceClassification.from_pretrained('bert-base-uncased', num_labels=1)


# Replace the classifier with a new regression head
model.classifier = nn.Sequential(
    nn.Dropout(0.1),  # assuming the dropout rate from the original BERT
    nn.Linear(model.classifier.in_features, 1)
)

# Define the optimizer
optimizer = AdamW(model.parameters(), lr=1e-5)

# Enable mixed precision training
scaler = GradScaler()

# Loss function
loss_fn = nn.MSELoss()

torch.cuda.empty_cache()

def train_model(model, train_loader, val_loader, optimizer, loss_fn, epochs=5):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)

    for epoch in range(epochs):
        model.train()
        total_train_loss = 0
        for batch in train_loader:
            b_input_ids, b_input_mask, b_labels = batch
            b_input_ids = b_input_ids.to(device)
            b_input_mask = b_input_mask.to(device)
            b_labels = b_labels.to(device)

            with autocast():
                outputs = model(b_input_ids, attention_mask=b_input_mask)
                loss = loss_fn(outputs.logits.squeeze(-1), b_labels.float())

            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()

            optimizer.zero_grad()
            total_train_loss += loss.item()

        avg_train_loss = total_train_loss / len(train_loader)
        print(f'Epoch {epoch + 1}/{epochs} | Train Loss: {avg_train_loss}')

        # Evaluate on the validation set
        model.eval()
        total_eval_loss = 0
        with torch.no_grad():
            for batch in val_loader:
                b_input_ids, b_input_mask, b_labels = batch
                b_input_ids = b_input_ids.to(device)
                b_input_mask = b_input_mask.to(device)
                b_labels = b_labels.to(device)

                outputs = model(b_input_ids, attention_mask=b_input_mask)
                loss = loss_fn(outputs.logits.squeeze(-1), b_labels.float())
                total_eval_loss += loss.item()

        avg_val_loss = total_eval_loss / len(val_loader)
        print(f'Epoch {epoch + 1}/{epochs} | Validation Loss: {avg_val_loss}')

# Define the optimizer


# Call the training function
# Call the training function
train_model(model, train_loader, validate_loader, optimizer, loss_fn)