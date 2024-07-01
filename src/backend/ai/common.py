import json
import numpy as np
from ai_config import SCALER_SAVE_DIR, MODEL_SAVE_DIR, TWEETS_FILE_PATH, PROFILES_FILE_PATH, SCALERS_CONFIG


def get_followers_count() -> dict:
    with open(PROFILES_FILE_PATH, 'r', encoding='utf-8') as file:
        profiles = json.load(file)

    profile_dict = {}
    for profile in profiles:
        profile_dict[profile['username']] = profile['public_metrics']['followers_count']

    return profile_dict


def get_tweets() -> list:
    with open(TWEETS_FILE_PATH, 'r', encoding='utf-8') as file:
        tweets = json.load(file)
    
    return tweets


def get_last_tweets_like_average(tweet_count: int) -> dict:
    tweets = get_tweets()
    author_likes_avg = {}
    author_tweets = {}

    # Group tweets by author
    for tweet in tweets:
        author_id = tweet['data']['author_id']
        author_tweets.setdefault(author_id, []).append(tweet)

    # Calculate average likes for each author
    for author_id, tweets in author_tweets.items():
        # Sort tweets by creation date in descending order
        tweets.sort(key=lambda x: x['data']['created_at']['$date'], reverse=True)
        # Get the latest 'tweet_count' tweets
        recent_tweets = tweets[:tweet_count]
        # Calculate average likes
        avg_likes = np.mean([tweet['data']['public_metrics']['like_count'] for tweet in recent_tweets])
        # Store average likes in the dictionary
        author_likes_avg[author_id] = avg_likes

    return author_likes_avg