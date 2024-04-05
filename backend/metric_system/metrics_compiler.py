from .metric import Metric, ComputableMetric, MetricGenerator
from backend.config import Config
from pymongo import MongoClient
from backend.encoders.tweet_encoder import Tweet
from backend.encoders.profile_encoder import Profile
from backend.metric_system.helpers.profile.tweet_analytics_helper import TweetAnalyticsHelper
import json
from backend.metric_system.np_seralizer import numpy_json_serializer
from backend.metric_system.metric_container import MetricContainer

    
class StatMetricCompiler:
    def __init__(self, debug_mode=False) -> None:
        self.debug_mode = debug_mode
        
        self._tweet_analytics_helper = TweetAnalyticsHelper(debug_mode)
        self._tweet_analytics_helper.build()
        
        # Metrics that have been computed
        # These metrics are ready to be to.json and send to the frontend
        self._processed_metrics: MetricContainer = MetricContainer()
        
        # Metrics that need to be computed
        self._unprocessed_metrics: list[ComputableMetric] = []
        
        # Metrics that need to be updated over each tweet
        self._update_over_tweet_metrics: list[ComputableMetric] = []
        
        # Metric generators
        self._metric_generators: list[MetricGenerator] = []


    def _connect_to_database(self):
        return MongoClient(
            Config.db_host(),
            port=Config.db_port(),
            username=Config.db_user(),
            password=Config.db_password(),
        )[Config.db_name()]
        
    
    
    
    def add_uncompiled_metric(self, metric: ComputableMetric):        
        if metric.do_update_over_tweet:
            self._update_over_tweet_metrics.append(metric)
    
        self._unprocessed_metrics.append(metric)
        
    def add_metric(self, metric: tuple[Metric | ComputableMetric]):
        if isinstance(metric, ComputableMetric):
            self.add_uncompiled_metric(metric)
        
        elif isinstance(metric, Metric):
            self._processed_metrics.add_metric(metric)
    
    def add_metrics(self, metrics: list[Metric | ComputableMetric]):
        for metric in metrics:
            self.add_metric(metric)
                    
        
    def _process_tweets(self):
        db = self._connect_to_database()
        if self.debug_mode:
            tweets_cursor = db["tweets"].find({}).limit(2000)
        else:
            tweets_cursor = db["tweets"].find({})
            
        for tweet in tweets_cursor:
            tweet = Tweet(as_json=tweet)
            for metric in self._update_over_tweet_metrics:
                metric.update_over_tweet(tweet)
                
                
    def Process(self):
        for metric_generator in self._metric_generators:
            metrics = metric_generator.generate_metrics(self._tweet_analytics_helper, self._processed_metrics)
            self.add_metrics(metrics)
        
        if len(self._update_over_tweet_metrics) > 0:
            self._process_tweets()
            
        for metric in self._unprocessed_metrics:
            metric.final_update(self._tweet_analytics_helper, self._processed_metrics)
            self._processed_metrics.add_metric(metric)
            
            
    def to_json(self):
        for value in self._processed_metrics.get_metrics().values():
            for k, v in value.items():
                value[k] = v.get_data()
                
        return json.dumps(self._processed_metrics, default=numpy_json_serializer)