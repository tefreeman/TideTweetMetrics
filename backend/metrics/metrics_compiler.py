from .metrics import Metric
from config import Config
from pymongo import MongoClient
from backend.encoders.tweet_encoder import Tweet
from backend.encoders.profile_encoder import Profile
from backend.metrics.pre_compiler import TweetDataCompiler


class StatMetricCompiler:
    def __init__(self):
        self.tweet_row_metrics: list[Metric] = []
        self.profile_row_metrics:list[Metric] = []
        self.all_metrics: list[Metric] = []
        
        self.pre_compiler = TweetDataCompiler()
        self.pre_processed_metrics: list[Metric] = []

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
    
    def add_metric(self, metric: Metric):
        self.all_metrics.append(metric)
        
        if metric._update_over_tweets:
            self.tweet_row_metrics.append(metric)
        
        if metric._update_over_profiles:
            self.profile_row_metrics.append(metric)
            

    def add_pre_processed_metric(self, metric: Metric):
        self.pre_processed_metrics.append(metric)
    
    def pre_process(self):
        self.pre_compiler.process()
    
    def get_preprossed_compiler(self) -> TweetDataCompiler:
        return self.pre_compiler
        
    def Process(self):
        
        if len(self.profile_row_metrics) > 0:
            profiles_cursor = self.get_all_profiles_cursor()
            for profile in profiles_cursor:
                profile = Profile(as_json=profile)
                for metric in self.profile_row_metrics:
                    if metric.profile_filter(profile):
                        metric.update_by_profile(profile)
        
        if len(self.tweet_row_metrics) > 0:
            tweets_cursor = self.get_all_tweets_cursor()      
            for tweet in tweets_cursor:
                tweet_obj = Tweet(as_json=tweet)
                for metric in self.tweet_row_metrics:
                    if metric.tweet_filter(tweet_obj):
                        metric.update_by_tweet(tweet_obj)
        
        # Finalize metrics after processing all data
        compiled_metrics = {}
        for metric in self.pre_processed_metrics:
            compiled_metrics[metric.get_name()] = metric.get_encoder()
            
        for metric in self.all_metrics:
            metric.final_update(self.pre_compiler)  # Placeholder for actual stats arguments
            
            compiled_metrics[metric.get_name()] = metric.get_encoder()
        
        return compiled_metrics