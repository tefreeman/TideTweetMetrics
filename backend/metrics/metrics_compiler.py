from .metrics import Metric
from config import Config
from pymongo import MongoClient
from encoders.tweet_encoder import Tweet
from encoders.profile_encoder import Profile


class StatMetricCompiler:
    def __init__(self):
        self.tweetRowMetrics: list[Metric] = []
        self.profileRowMetrics:list[Metric] = []
        self.allMetrics: list[Metric] = []
        

    def open_db(self, db_name: str):
        return MongoClient(
            Config.db_host(),
            port=Config.db_port(),
            username=Config.db_user(),
            password=Config.db_password(),
    )[db_name]
        

    def get_all_tweets_cursor(self):
        db = self.open_db(Config.db_name())
        return db['tweets'].find({})

    def get_all_profiles_cursor(self):
        db = self.open_db(Config.db_name())
        return db['profiles'].find({})
    
    def AddMetric(self, metric: Metric):
        self.allMetrics.append(metric)
        
        if metric._update_over_tweets:
            self.tweetRowMetrics.append(metric)
        
        if metric._update_over_profiles:
            self.profileRowMetrics.append(metric)
            

    def Process(self):
        
        profiles_cursor = self.get_all_profiles_cursor()
        for profile in profiles_cursor:
            profile = Profile(as_json=profile)
            for metric in self.profileRowMetrics:
                if metric.ProfileFilter(profile):
                    metric.UpdateByProfile(profile)
        
        tweets_cursor = self.get_all_tweets_cursor()      
        for tweet in tweets_cursor:
            tweet_obj = Tweet(as_json=tweet)
            for metric in self.tweetRowMetrics:
                if metric.tweetFilter(tweet_obj):
                    metric.UpdateByTweet(tweet_obj)
    
        # Finalize metrics after processing all data
        for metric in self.allMetrics:
            metric.FinalUpdate(None, None)  # Placeholder for actual stats arguments
        return [metric.GetEncoder() for metric in self.allMetrics] # update this with toJson method