from .metrics import Metric, ComputableMetric, MetricGenerator
from backend.config import Config
from pymongo import MongoClient
from backend.encoders.tweet_encoder import Tweet
from backend.encoders.profile_encoder import Profile
from backend.metrics.profile_stats.profile_tweet_analytics import ProfileTweetAnalytics
import json

class StatMetricCompiler:
    def __init__(self):
        self._profile_tweet_analytics = ProfileTweetAnalytics()
        
        self._finshed_metrics: dict[str, Metric] = {

        }
        
        
        self._uncompiled_metrics: dict[str, ComputableMetric] = {
            
        }
        
        self._update_over_tweet_metrics: list[ComputableMetric] = []
        
        self._metric_generators: list[MetricGenerator] = []


    def _connect_to_database(self):
        return MongoClient(
            Config.db_host(),
            port=Config.db_port(),
            username=Config.db_user(),
            password=Config.db_password(),
        )[Config.db_name()]
        
        
    def add_finshed_metric(self, metric: Metric):
        if metric.get_metric_name() not in self._finshed_metrics:
            self._finshed_metrics[metric.get_metric_name()] = {}
        self._finshed_metrics[metric.get_metric_name()][metric.get_owner()] = metric
    
    def add_uncompiled_metric(self, metric: ComputableMetric):
        if metric.get_metric_name() not in self._uncompiled_metrics:
            self._uncompiled_metrics[metric.get_metric_name()] = {}
        self._uncompiled_metrics[metric.get_metric_name()][metric.get_owner()] = metric
        
        if metric.do_update_over_tweet:
            self._update_over_tweet_metrics.append(metric)
        
    def add_metric(self, metric: tuple[Metric | ComputableMetric]):
        if isinstance(metric, ComputableMetric):
            self.add_uncompiled_metric(metric)
        elif isinstance(metric, Metric):
            self.add_finshed_metric(metric)
    
    
    def add_metrics(self, metrics: list[Metric | ComputableMetric]):
        for metric in metrics:
            self.add_metric(metric)
    
    def add_metric_generator(self, metric_generator: MetricGenerator):
        self._metric_generators.append(metric_generator)
        
        
    def _process_tweets(self):
        db = self._connect_to_database()
        tweets_cursor = db["tweets"].find({})
        for tweet in tweets_cursor:
            tweet = Tweet(as_json=tweet)
            for metric in self._update_over_tweet_metrics:
                metric.update_over_tweet(tweet)
                
                
    def Process(self):
        
        for metric_generator in self._metric_generators:
            metrics = metric_generator.generate_metrics(self._profile_tweet_analytics, self._finshed_metrics)
            self.add_metrics(metrics)
        
        if len(self._update_over_tweet_metrics) > 0:
            self._process_tweets()
            
        for owner_dict in self._uncompiled_metrics.values():
            for metric in owner_dict.values():
                metric.final_update(self._profile_tweet_analytics, self._finshed_metrics)
                self.add_finshed_metric(metric)
            
    def to_json(self):
        return json.dumps(self._finshed_metrics)