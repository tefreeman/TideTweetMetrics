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

class BertForSequenceClassificationWithFeatures(BertPreTrainedModel):
    def __init__(self, config, num_additional_features=11):
        super().__init__(config)
        self.bert = BertModel(config)
        # Here, we include the size for additional features
        total_input_size = config.hidden_size + num_additional_features
        
        self.dropout = nn.Dropout(config.hidden_dropout_prob)
        # Adjust the classifier to account for BERT output + additional features
        self.classifier = nn.Linear(total_input_size, config.num_labels)

    def forward(self, input_ids, attention_mask=None, token_type_ids=None, position_ids=None, head_mask=None, inputs_embeds=None, additional_features=None):
        outputs = self.bert(input_ids,
                            attention_mask=attention_mask,
                            token_type_ids=token_type_ids,
                            position_ids=position_ids,
                            head_mask=head_mask,
                            inputs_embeds=inputs_embeds)

        pooled_output = outputs[1] 
        if additional_features is not None:
            pooled_output = torch.cat((pooled_output, additional_features), 1)
        pooled_output = self.dropout(pooled_output)
        logits = self.classifier(pooled_output)

        return logits


# Hyperparams optimzation
def evaluate_model(model, val_loader, loss_fn, device):
    model.eval()  # Set the model to evaluation mode
    total_val_loss = 0
    predictions, true_labels = [], []

    with torch.no_grad():  # No need to calculate gradients for validation
        for batch in val_loader:
            b_input_ids, b_input_mask, b_features, b_labels = [item.to(device) for item in batch]

            with autocast():
                logits = model(b_input_ids, attention_mask=b_input_mask, additional_features=b_features).squeeze()
                loss = loss_fn(logits, b_labels.float())
            
            total_val_loss += loss.item()
            # Move logits and labels to CPU
            predictions.append(logits.detach().cpu().numpy())
            true_labels.append(b_labels.detach().cpu().numpy())

    avg_val_loss = total_val_loss / len(val_loader)
    # Concatenate all predictions and true labels
    predictions = np.concatenate(predictions, axis=0)
    true_labels = np.concatenate(true_labels, axis=0)

    return avg_val_loss, predictions, true_labels

# Define a base directory for scaler files
SCALERS_DIR = 'D:\\TideTweetMetrics\\backend\\ai\\model_save'
SCALERS_CONFIG = {
    'like_count': 'like_count_scaler.save',
    'features': 'feature_scaler.save',
}
def save_scaler(scaler_name, scaler_object):
    """
    Saves the scaler object based on the scaler name according to the predefined paths.
    """
    scaler_file_name = SCALERS_CONFIG.get(scaler_name)
    if scaler_file_name:
        scaler_path = os.path.join(SCALERS_DIR, scaler_file_name)
        joblib.dump(scaler_object, scaler_path)
        print(f"Scaler {scaler_name} saved to {scaler_path}")
    else:
        print(f"Scaler name '{scaler_name}' not found in SCALERS_CONFIG.")

def load_scaler(scaler_name):
    """
    Loads and returns the scaler object based on the scaler name.
    """
    scaler_file_name = SCALERS_CONFIG.get(scaler_name)
    if scaler_file_name:
        scaler_path = os.path.join(SCALERS_DIR, scaler_file_name)
        if os.path.exists(scaler_path):
            return joblib.load(scaler_path)
        else:
            print(f"Scaler file {scaler_path} not found.")
    else:
        print(f"Scaler name '{scaler_name}' not found in SCALERS_CONFIG.")
    return None


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
like_count_scaler = MinMaxScaler()
train['like_count_scaled'] = like_count_scaler.fit_transform(train[['like_count']])

# Transform validation and test sets
validate['like_count_scaled'] = like_count_scaler.transform(validate[['like_count']])
test['like_count_scaled'] = like_count_scaler.transform(test[['like_count']])


        # Saving the scaler object
joblib.dump(like_count_scaler, 'D:\\TideTweetMetrics\\backend\\ai\\model_save\\like_count_scaler.save')

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
scaler = MinMaxScaler()

# Define the columns to be scaled
scale_columns = ['followers_count', 'hashtag_count', 'mention_count', 'url_count', 'photo_count', 'video_count', 'text_length', 'avg_last_10_likes']

# Fit the scaler on the training data and transform the data
train[scale_columns] = scaler.fit_transform(train[scale_columns])
validate[scale_columns] = scaler.transform(validate[scale_columns])
test[scale_columns] = scaler.transform(test[scale_columns])

# Create additional feature tensors with scaled features
train_features = torch.tensor(train[['followers_count', 'hashtag_count', 'mention_count', 'url_count', 'photo_count', 'video_count', 'sentiment', 'text_length', 'day_of_week', 'hour_of_day', 'avg_last_10_likes']].values, dtype=torch.float)
validate_features = torch.tensor(validate[['followers_count', 'hashtag_count', 'mention_count', 'url_count', 'photo_count', 'video_count', 'sentiment', 'text_length', 'day_of_week', 'hour_of_day', 'avg_last_10_likes']].values, dtype=torch.float)
test_features = torch.tensor(test[['followers_count', 'hashtag_count', 'mention_count', 'url_count', 'photo_count', 'video_count', 'sentiment', 'text_length', 'day_of_week', 'hour_of_day', 'avg_last_10_likes']].values, dtype=torch.float)

# Create TensorDatasets
train_dataset = TensorDataset(train_encodings['input_ids'], train_encodings['attention_mask'], train_features, train_labels)
validate_dataset = TensorDataset(validate_encodings['input_ids'], validate_encodings['attention_mask'], validate_features, validate_labels)
test_dataset  = TensorDataset(test_encodings['input_ids'], test_encodings['attention_mask'], test_features, test_labels)

# Create DataLoaders with smaller batch sizes
batch_size = 64
train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
validate_loader = DataLoader(validate_dataset, batch_size=batch_size)
test_loader = DataLoader(test_dataset, batch_size=batch_size)

# Load a pre-trained model
model = BertForSequenceClassificationWithFeatures.from_pretrained('bert-base-uncased')

# Replace the classifier with a new regression head
model.classifier = nn.Sequential(
    nn.Dropout(0.1),  # assuming the dropout rate from the original BERT
    nn.Linear(model.classifier.in_features, 1)
)


# Loss function
loss_fn = nn.MSELoss()

def objective(trial):
    # Hyperparameters to optimize
    lr = trial.suggest_loguniform('lr', 1e-6, 1e-4)
    batch_size = trial.suggest_categorical('batch_size', [16, 32, 64])
    dropout_rate = trial.suggest_uniform('dropout_rate', 0.1, 0.5)
    epochs = trial.suggest_int('epochs', 3, 80)  # Optionally optimize the number of epochs

    model = BertForSequenceClassificationWithFeatures.from_pretrained(
        'bert-base-uncased',
        hidden_dropout_prob=dropout_rate  # Adjusting the model's dropout_rate based on optuna's suggestion   
    )
    
    model.classifier = nn.Sequential(
        nn.Dropout(dropout_rate),  # Using suggested dropout rate
        nn.Linear(model.classifier.in_features, 1)
    )

    # Updating the optimizer with the suggested learning rate
    optimizer = AdamW(model.parameters(), lr=lr)
    
    # DataLoaders setup with trial's batch_size suggestion
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(validate_dataset, batch_size=batch_size)  
    scaler = GradScaler()
    lr_scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.1, patience=3, verbose=True)
    train_model(model, train_loader, val_loader, optimizer, loss_fn, scaler, lr_scheduler, epochs=epochs, model_save_path='model_save', dropout_rate=dropout_rate)

    # Evaluation part
    avg_val_loss, _, _ = evaluate_model(model, val_loader, loss_fn, 'cuda')

    return avg_val_loss



def train_model_with_fixed_params():

    # Fixed hyperparameters
    lr = 1e-5
    batch_size = 56
    dropout_rate = 0.4
    epochs = 100

    model = BertForSequenceClassificationWithFeatures.from_pretrained(
        'bert-base-uncased',
        hidden_dropout_prob=dropout_rate  # Fixed dropout_rate
    )
    model.classifier = nn.Sequential(
        nn.Dropout(dropout_rate),  # Fixed dropout rate
        nn.Linear(model.classifier.in_features, 1)
    )

    optimizer = AdamW(model.parameters(), lr=lr)
    
    # DataLoaders setup with fixed batch_size
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(validate_dataset, batch_size=batch_size)

    scaler = GradScaler()
    lr_scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.1, patience=3, verbose=True)

    # Assuming train_model is a function you previously defined for training
    train_model(model, train_loader, val_loader, optimizer, loss_fn, scaler, lr_scheduler, epochs=epochs, model_save_path='D:\\TideTweetMetrics\\backend\\ai\\model_save\\', dropout_rate=dropout_rate)

    # Assuming evaluate_model is a function you previously defined for evaluation
    avg_val_loss, _, _ = evaluate_model(model, val_loader, loss_fn, 'cuda')
    
    return avg_val_loss


def evaluate_model(model, val_loader, loss_fn, device):
    model.eval()  # Set the model to evaluation mode
    total_val_loss = 0
    predictions, true_labels = [], []

    with torch.no_grad():  # No need to calculate gradients for validation
        for batch in val_loader:
            b_input_ids, b_input_mask, b_features, b_labels = [item.to(device) for item in batch]

            with autocast():
                logits = model(b_input_ids, attention_mask=b_input_mask, additional_features=b_features).squeeze()
                # Ensure logits is at least 1D
                if logits.dim() == 0:
                    logits = logits.unsqueeze(0)
                loss = loss_fn(logits, b_labels.float())

            total_val_loss += loss.item()
            # Ensure logits and b_labels are 1D before appending
            predictions.append(logits.detach().cpu().numpy())
            true_labels.append(b_labels.detach().cpu().numpy())

    avg_val_loss = total_val_loss / len(val_loader)
    # Concatenate all predictions and true labels
    predictions = np.concatenate(predictions, axis=0)
    true_labels = np.concatenate(true_labels, axis=0)

    return avg_val_loss, predictions, true_labels

def train_model(model, train_loader, val_loader, optimizer, loss_fn, scaler, lr_scheduler, epochs=5, model_save_path='backend\\ai\\model_save\\', dropout_rate=0.1):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.to(device)
    
    # This dynamically adjusts dropout, which assumes your model class supports this operation.
    model.dropout = nn.Dropout(dropout_rate)  # Adjust dropout dynamically based on input
    
    for epoch in range(epochs):
        start_time = datetime.now()
        model.train()
        total_train_loss = 0

        for batch in train_loader:
            b_input_ids, b_input_mask, b_features, b_labels = [item.to(device) for item in batch]
            
            optimizer.zero_grad()

            with autocast():
                logits = model(b_input_ids, attention_mask=b_input_mask, additional_features=b_features).squeeze()
                
                # Ensure that logits and b_labels have a consistent shape
                if logits.dim() == 0:
                    logits = logits.unsqueeze(0)  # Ensure logits is always at least 1D

                # Ensure b_labels is the correct shape and type, float() is typically for regression tasks
                b_labels = b_labels.float()  # Further modification might be required for classification
                
                loss = loss_fn(logits, b_labels)

            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
            
            total_train_loss += loss.item()

        avg_train_loss = total_train_loss / len(train_loader)
        
        # Repeat similar checks in the evaluation to ensure consistency
        avg_val_loss, predictions, true_labels = evaluate_model(model, val_loader, loss_fn, device)
        
        
        lr_scheduler.step(avg_val_loss)
        
        mse = mean_squared_error(true_labels, predictions)
        mae = mean_absolute_error(true_labels, predictions)
        print(f'Epoch {epoch + 1}/{epochs} | Train Loss: {avg_train_loss:.6f} | Val Loss: {avg_val_loss:.6f} | MSE: {mse} | MAE: {mae}| Time elapsed: {datetime.now() - start_time}')
        if epoch >= 8 and epoch % 4 == 0:
        # Save the model and optimizer state each epoch
            model_save_epoch_path = Path(model_save_path) / f"epoch_{epoch+1}"
            print(model_save_epoch_path.cwd())
            model_save_epoch_path.mkdir(parents=True, exist_ok=True)
            model.save_pretrained(model_save_epoch_path)
            torch.save(optimizer.state_dict(), model_save_epoch_path / 'optimizer_state.pt')
            torch.save(scaler.state_dict(), model_save_epoch_path / 'scaler_state.pt')
            print(f"Model saved to {model_save_epoch_path}")

    # Assuming you have calculated metrics such as accuracy and loss
            with open(model_save_epoch_path / 'performance_metrics.txt', 'a') as f:
                f.write(f"Epoch: {epoch + 1}\n")
                f.write(f"Mean Squared Error: {mse:.6f}\n")
                f.write(f"Mean Absolute Error: {mae:.6f}\n")
                f.write(f"Validation Loss: {avg_val_loss:.6f}\n")

#train_model(model, train_loader, validate_loader, optimizer, loss_fn, scaler, lr_scheduler, epochs=5, model_save_path='D:\\TideTweetMetrics\\backend\\ai\\model_save')
if __name__ == '__main__':
    #study = optuna.create_study(direction='minimize')
    #study.optimize(objective, n_trials=20)  # Adjust n_trials as needed
    train_model_with_fixed_params()


