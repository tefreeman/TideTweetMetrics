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
from sklearn.preprocessing import MinMaxScaler
from transformers import get_linear_schedule_with_warmup
from torch.optim.lr_scheduler import OneCycleLR
from sklearn.metrics import mean_squared_error, mean_absolute_error
from ai_config import SCALER_SAVE_DIR, MODEL_SAVE_DIR, TWEETS_FILE_PATH, PROFILES_FILE_PATH, SCALERS_CONFIG
from sklearn.preprocessing import RobustScaler
from common import create_directories, save_scaler, load_scaler
from model import EnhancedBertForSequenceRegression
from data_loader import DataTransformer

torch.cuda.empty_cache()

like_count_scaler = None

def get():
    
    global like_count_scaler
    data_loader = DataTransformer()
    data_loader.append_avg_n_last_likes(10)

    df = data_loader.transform_all_to_df()

    # Splitting the dataset into training, validation, and test sets
    train, validate, test = np.split(df.sample(frac=1, random_state=42),
                                    [int(.8*len(df)), int(.9*len(df))])

    # Scaling the like_count column using RobustScaler to handle outliers
    like_count_scaler = MinMaxScaler()


    train['like_count_scaled'] = like_count_scaler.fit_transform(train[['like_count']])
    validate['like_count_scaled'] = like_count_scaler.transform(validate[['like_count']])
    test['like_count_scaled'] = like_count_scaler.transform(test[['like_count']])

    # Saving the scaler object
    save_scaler('like_count', like_count_scaler)

    train_encodings = data_loader.encode_texts(train['text'].tolist())
    validate_encodings =  data_loader.encode_texts(validate['text'].tolist())
    test_encodings =  data_loader.encode_texts(test['text'].tolist())

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

    #loss_fn = nn.SmoothL1Loss()
    loss_fn = nn.MSELoss()
    # Fixed hyperparameters
    #  May need to adjust this
    lr = 1e-5
    batch_size = 64
    dropout_rate = 0.15
    epochs = 200

    model = EnhancedBertForSequenceRegression.from_pretrained(
        'bert-base-uncased',
        hidden_dropout_prob=dropout_rate  # Fixed dropout_rate
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

def inverse_scale(scaled_values, scaler):
    reshaped = scaled_values.reshape(-1, 1)  # Reshape because the scaler expects 2D input
    return scaler.inverse_transform(reshaped).flatten()  # Flatten back to 1D


def evaluate_model(model, val_loader, loss_fn, device, scaler):
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

    unscaled_predictions = inverse_scale(predictions, scaler)
    unscaled_true_labels = inverse_scale(true_labels, scaler)

    return avg_val_loss, predictions, true_labels, unscaled_predictions, unscaled_true_labels

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
        
        avg_val_loss, predictions, true_labels, unscaled_predictions, unscaled_true_labels = evaluate_model(model, val_loader, loss_fn, device, like_count_scaler)


        lr_scheduler.step(avg_val_loss)
        
        mse = mean_squared_error(true_labels, predictions)
        mae = mean_absolute_error(true_labels, predictions)

        unscaled_mse = mean_squared_error(unscaled_true_labels, unscaled_predictions)
        unscaled_mae = mean_absolute_error(unscaled_true_labels, unscaled_predictions)


        print(f'Epoch {epoch + 1}/{epochs} | Train Loss: {avg_train_loss:.6f} | Val Loss: {avg_val_loss:.6f} | MSE: {mse:.6f} | MAE: {mae:.6f} | Unscaled MSE: {unscaled_mse:.6f} | Unscaled MAE: {unscaled_mae:.6f} | Time elapsed: {datetime.now() - start_time}')
        if epoch >= 8 and epoch % 8 == 0:

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
    create_directories()
    train_dataset, validate_dataset, test_dataset = get()
    test_dataset_filepath = MODEL_SAVE_DIR + 'test_dataset.pt'
    torch.save(test_dataset, test_dataset_filepath)

    train_model_with_fixed_params(train_dataset, validate_dataset)




