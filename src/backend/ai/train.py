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
from ai_config import SCALER_SAVE_DIR, MODEL_SAVE_DIR, TWEETS_FILE_PATH, PROFILES_FILE_PATH, SCALERS_CONFIG
from sklearn.preprocessing import RobustScaler
# Bert model class with additional features
# This class is a modified version of the BertForSequenceClassification class
# that includes additional features in the input and the classifier layer.
# May need to rework this if we have time for better analysis
class BertForSequenceClassificationWithFeatures(BertPreTrainedModel):
    def __init__(self, config, num_additional_features=11):
        super().__init__(config)
        self.bert = BertModel(config)

        total_input_size = config.hidden_size + num_additional_features
        self.dropout = nn.Dropout(config.hidden_dropout_prob)
        self.classifier = nn.Linear(total_input_size, 1)  # Change the output size to 1

    def forward(self, input_ids, attention_mask=None, token_type_ids=None, position_ids=None, head_mask=None, inputs_embeds=None, additional_features=None):
        if additional_features is None:
            raise ValueError("additional_features must be provided to the CustomBertModel.")
        outputs = self.bert(input_ids,
                            attention_mask=attention_mask,
                            token_type_ids=token_type_ids,
                            position_ids=position_ids,
                            head_mask=head_mask,
                            inputs_embeds=inputs_embeds)
        pooled_output = outputs[1]
        pooled_output = torch.cat((pooled_output, additional_features), 1)
        pooled_output = self.dropout(pooled_output)
        logits = self.classifier(pooled_output)
        return logits.squeeze()  # Remove the extra dimension


def save_scaler(scaler_name, scaler_object):
    """
    Saves the scaler object based on the scaler name according to the predefined paths.
    """
    scaler_file_name = SCALERS_CONFIG.get(scaler_name)
    if scaler_file_name:
        scaler_path = os.path.join(SCALER_SAVE_DIR, scaler_file_name)
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
        scaler_path = os.path.join(SCALER_SAVE_DIR, scaler_file_name)
        if os.path.exists(scaler_path):
            return joblib.load(scaler_path)
        else:
            print(f"Scaler file {scaler_path} not found.")
    else:
        print(f"Scaler name '{scaler_name}' not found in SCALERS_CONFIG.")
    return None



def get():
    
    with open(PROFILES_FILE_PATH, 'r', encoding='utf-8') as file:
        profiles = json.load(file)

    profile_dict = {}
    for profile in profiles:
        profile_dict[profile['username']] = profile['public_metrics']['followers_count']

    with open(TWEETS_FILE_PATH, 'r', encoding='utf-8') as file:
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

    # Remove tweets from the uoregon account accidentally included
    for i in range(len(tweets)):
        if tweets[i]['author_id'] == 'uoregon':
            tweets[i] = None
    tweets = [tweet for tweet in tweets if tweet is not None]       

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


    tweets = [tweet for tweet in tweets if tweet is not None]
    print(len(tweets))

    # Limit the number of tweets for slow PC's
    # randomly shuffle tweets array
    # np.random.shuffle(tweets)
    # tweets = tweets[0:10000]

    df = pd.DataFrame(tweets)

    # Data cleaning
    df['text'] = df['text'].apply(lambda x: ' '.join(re.sub("(https?://[^\s]+)", " ", x).split()))

    df['sentiment'] = df['text'].apply(lambda x: TextBlob(x).sentiment.polarity)

    df['text_length'] = df['text'].apply(len)


    df['created_at'] = df['created_at'].apply(lambda x: datetime.strptime(x, '%Y-%m-%dT%H:%M:%S.%fZ'))
    df['day_of_week'] = df['created_at'].apply(lambda x: x.weekday())
    df['hour_of_day'] = df['created_at'].apply(lambda x: x.hour)


    # Splitting the dataset into training, validation, and test sets
    train, validate, test = np.split(df.sample(frac=1, random_state=42),
                                    [int(.8*len(df)), int(.9*len(df))])

    # Scaling the like_count column using RobustScaler to handle outliers
    like_count_scaler = RobustScaler()
    train['like_count_scaled'] = like_count_scaler.fit_transform(train[['like_count']])
    validate['like_count_scaled'] = like_count_scaler.transform(validate[['like_count']])
    test['like_count_scaled'] = like_count_scaler.transform(test[['like_count']])

    # Saving the scaler object
    save_scaler('like_count', like_count_scaler)


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


    mm_features_scaler = MinMaxScaler()
    r_features_scaler = MinMaxScaler()

    # Columns to be scaled with MinMaxScaler and RobustScaler
    mm_scale_columns = ['hashtag_count', 'mention_count', 'url_count', 'photo_count', 'video_count', 'text_length']
    r_scale_columns = ['followers_count', 'avg_last_10_likes']

    # Fit the MinMaxScaler on the training data and transform the data
    train_mm_scaled = mm_features_scaler.fit_transform(train[mm_scale_columns])
    validate_mm_scaled = mm_features_scaler.transform(validate[mm_scale_columns])
    test_mm_scaled = mm_features_scaler.transform(test[mm_scale_columns])

    # Fit the RobustScaler on the training data and transform the data
    train_r_scaled = r_features_scaler.fit_transform(train[r_scale_columns])
    validate_r_scaled = r_features_scaler.transform(validate[r_scale_columns])
    test_r_scaled = r_features_scaler.transform(test[r_scale_columns])

    # Combine the scaled features back into the DataFrame
    train_scaled = train.copy()
    train_scaled[mm_scale_columns] = train_mm_scaled
    train_scaled[r_scale_columns] = train_r_scaled

    validate_scaled = validate.copy()
    validate_scaled[mm_scale_columns] = validate_mm_scaled
    validate_scaled[r_scale_columns] = validate_r_scaled

    test_scaled = test.copy()
    test_scaled[mm_scale_columns] = test_mm_scaled
    test_scaled[r_scale_columns] = test_r_scaled

    # Save the scalers
    save_scaler('mm_features', mm_features_scaler)
    save_scaler('r_features', r_features_scaler)

    # Create additional feature tensors with scaled features
    scale_columns = mm_scale_columns + r_scale_columns + ['sentiment', 'day_of_week', 'hour_of_day']
    
    train_features = torch.tensor(train_scaled[scale_columns].values, dtype=torch.float)
    validate_features = torch.tensor(validate_scaled[scale_columns].values, dtype=torch.float)
    test_features = torch.tensor(test_scaled[scale_columns].values, dtype=torch.float)

    # Create TensorDatasets
    train_dataset = TensorDataset(train_encodings['input_ids'], train_encodings['attention_mask'], train_features, train_labels)
    validate_dataset = TensorDataset(validate_encodings['input_ids'], validate_encodings['attention_mask'], validate_features, validate_labels)
    test_dataset = TensorDataset(test_encodings['input_ids'], test_encodings['attention_mask'], test_features, test_labels)

    return train_dataset, validate_dataset, test_dataset



def train_model_with_fixed_params(train_dataset, validate_dataset):

    loss_fn = nn.SmoothL1Loss()
    # loss_fn = nn.MSELoss()
    # Fixed hyperparameters
    #  May need to adjust this
    lr = 1e-5
    batch_size = 56
    dropout_rate = 0.325
    epochs = 200

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
    lr_scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.1, patience=5)

    # Training via trainmodel function
    train_model(model, train_loader, val_loader, optimizer, loss_fn, scaler, lr_scheduler,
                 epochs=epochs, model_save_path=MODEL_SAVE_DIR, dropout_rate=dropout_rate)

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

def train_model(model, train_loader, val_loader, optimizer, loss_fn, scaler, lr_scheduler, epochs=5, model_save_path=MODEL_SAVE_DIR, dropout_rate=0.1):
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
        
        avg_val_loss, predictions, true_labels = evaluate_model(model, val_loader, loss_fn, device)
        
        
        lr_scheduler.step(avg_val_loss)
        
        mse = mean_squared_error(true_labels, predictions)
        mae = mean_absolute_error(true_labels, predictions)
        print(f'Epoch {epoch + 1}/{epochs} | Train Loss: {avg_train_loss:.6f} | Val Loss: {avg_val_loss:.6f} | MSE: {mse} | MAE: {mae}| Time elapsed: {datetime.now() - start_time}')
        if epoch >= 20 and epoch % 10 == 0:

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


if __name__ == '__main__':

    train_dataset, validate_dataset, test_dataset = get()
     
    test_dataset_filepath = MODEL_SAVE_DIR + 'test_dataset.pt'
    torch.save(test_dataset, test_dataset_filepath)

    train_model_with_fixed_params(train_dataset, validate_dataset)




