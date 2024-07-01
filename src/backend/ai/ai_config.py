#define global variables for AI configuration

BASE_DIR = 'data/ai/'
MODEL_DIR =  BASE_DIR + 'model_save1/'
SCALER_DIR = BASE_DIR + 'scaler_save1/'
SCALERS_CONFIG = {
    'like_count': 'like_count_scaler.save',
    'mm_features': 'mm_feature_scaler.save',
    'r_features': 'r_feature_scaler.save'
}
TWEETS_FILE_PATH = BASE_DIR + '/db/tweets.json'
PROFILES_FILE_PATH = BASE_DIR + '/db/profiles.json'