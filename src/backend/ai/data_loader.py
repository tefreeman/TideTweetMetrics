from datetime import datetime
import re
from textblob import TextBlob
from ai_config import SCALER_SAVE_DIR, MODEL_SAVE_DIR, TWEETS_FILE_PATH, PROFILES_FILE_PATH, SCALERS_CONFIG
import json
import pandas as pd
from transformers import BertTokenizerFast


class DataTransformer:
    def __init__(self):
        self.profiles = self._get_profiles()
        self.tweets = self._get_tweets()

        self.profile_map = {profile['username']: profile for profile in self.profiles}
        self.tweet_map = self._build_tweet_map()

        self._sort_tweets_in_map_by_date()

        self.tokenizer = BertTokenizerFast.from_pretrained('bert-base-uncased')



    
    def _get_tweets(self) -> list:
        with open(TWEETS_FILE_PATH, 'r', encoding='utf-8') as file:
            tweets = json.load(file)
        
        return tweets

    def _get_profiles(self) -> dict:
        with open(PROFILES_FILE_PATH, 'r', encoding='utf-8') as file:
            profiles = json.load(file)  

        return profiles
    
    def _sort_tweets_in_map_by_date(self):
        for author_id, tweets in self.tweet_map.items():
            self.tweet_map[author_id] = sorted(tweets, key=lambda x: x['data']['created_at']['$date'])


    def _build_tweet_map(self):
        tweet_map = {}
        profile_map = {}
        
        for tweet in self.tweets:

            author_id = tweet['data']['author_id']
            if author_id not in self.profile_map:
                continue

            if author_id == "uoregon":
                continue

            if author_id not in tweet_map:
                tweet_map[author_id] = []
            
            tweet_map[author_id].append(tweet)

        return tweet_map
    

    def get_latest_avg_n_last_likes(self, n, author_id):
        tweets = self.tweet_map.get(author_id, [])
        if not tweets:
            return 0  

        num_tweets = len(tweets)
        likes = [tweet['data']['public_metrics']['like_count'] for tweet in tweets]
        
        if num_tweets < n:
            avg_likes = sum(likes) / num_tweets if num_tweets != 0 else 0 
        else:
            avg_likes = sum(likes[-n:]) / n
        
        return avg_likes
    def append_avg_n_last_likes(self, n):
        self.last_n_likes_str = 'avg_last_' + str(n) + '_likes'

        for author_id, tweets in self.tweet_map.items():
            likes = [tweet['data']['public_metrics']['like_count'] for tweet in tweets]
            for i, tweet in enumerate(tweets):
                if i < n:
                    # Use as many previous tweets as possible
                    avg_likes = sum(likes[:i]) / i if i != 0 else 0 
                else:
                    # Calculate average of the last `n` tweets before the current tweet
                    avg_likes = sum(likes[i - n:i]) / n
                
                tweet['data'][self.last_n_likes_str] = avg_likes
        

    def clean_df(self, df):
        df['text'] = df['text'].apply(lambda x: ' '.join(re.sub("(https?://[^\s]+)", " ", x).split()))
        df['sentiment'] = df['text'].apply(lambda x: TextBlob(x).sentiment.polarity)
        df['text_length'] = df['text'].apply(len)
        
        df['created_at'] = df['created_at'].apply(lambda x: datetime.strptime(x, '%Y-%m-%dT%H:%M:%S.%fZ'))
        df['day_of_week'] = df['created_at'].apply(lambda x: x.weekday())
        df['hour_of_day'] = df['created_at'].apply(lambda x: x.hour)


    def encode_texts(self, texts):
        return self.tokenizer(texts, padding=True, truncation=True, return_tensors='pt')


    def transform_all_to_df(self):
        # Transform the tweet map to a pandas DataFrame
        tweets_list = []
        for author_id, tweets in self.tweet_map.items():
            for tweet in tweets:
                if tweet['data'][self.last_n_likes_str] == 0:
                    divide_by = tweet['data']['public_metrics']['like_count']
                else:
                    divide_by = tweet['data'][self.last_n_likes_str]
                if divide_by == 0:
                    divide_by = 1
                print(divide_by)
                tweets_list.append({
                    'text': tweet['data']['text'],
                    'like_count': tweet['data']['public_metrics']['like_count'] / divide_by,
                    'created_at': tweet['data']['created_at']['$date'],
                    'author_id': tweet['data']['author_id'],
                    'followers_count': self.profile_map[author_id]['public_metrics']['followers_count'],
                    'hashtag_count': len(tweet['data']['entities']['hashtags']),
                    'mention_count': len(tweet['data']['entities']['mentions']),
                    'url_count': len(tweet['data']['entities']['urls']),
                    'photo_count': len(tweet['data']['attachments']['photos']),
                    'video_count': len(tweet['data']['attachments']['videos']),
                    self.last_n_likes_str: tweet['data'][self.last_n_likes_str],  # Add the avg likes
                })
        
        df = pd.DataFrame(tweets_list)
        self.clean_df(df)
        return df
    
    def transform_server_tweet_to_df(self, tweets, last_n_likes = 10):
        last_n_likes_str = 'avg_last_' + str(last_n_likes) + '_likes'

        tweets_list = []
        for tweet in tweets:
            tweets_list.append({
                'text': tweet['data']['text'],
                'like_count': tweet['data']['public_metrics']['like_count'],
                'created_at': tweet['data']['created_at']['$date'],
                'author_id': tweet['data']['author_id'],
                'followers_count': self.profile_map[tweet['data']['author_id']]['public_metrics']['followers_count'],
                'hashtag_count': len(tweet['data']['entities']['hashtags']),
                'mention_count': len(tweet['data']['entities']['mentions']),
                'url_count': len(tweet['data']['entities']['urls']),
                'photo_count': len(tweet['data']['attachments']['photos']),
                'video_count': len(tweet['data']['attachments']['videos']),
                last_n_likes_str: self.get_latest_avg_n_last_likes(last_n_likes, tweet['data']['author_id']),  # Add the avg likes
            })
        
        df = pd.DataFrame(tweets_list)
        self.clean_df(df)
        return df

