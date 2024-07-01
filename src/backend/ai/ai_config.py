#define global variables for AI configuration

BASE_DIR = 'data/ai/'
MODEL_NAME = 'smooth_l1/'
MODEL_SAVE_DIR =  BASE_DIR + 'models/' + MODEL_NAME + 'model_saves/'
SCALER_SAVE_DIR = BASE_DIR + 'models/' + MODEL_NAME + 'scalers/'
SCALERS_CONFIG = {
    'like_count': 'like_count_scaler.save',
    'mm_features': 'mm_feature_scaler.save',
    'r_features': 'r_feature_scaler.save'
}
TWEETS_FILE_PATH = BASE_DIR + 'db/tweets.json'
PROFILES_FILE_PATH = BASE_DIR + 'db/profiles.json'