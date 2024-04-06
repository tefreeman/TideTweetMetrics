from ..metric import Metric, ComputableMetric, MetricGenerator, OverTweetMetric, DependentMetric
from backend.config import Config
from pymongo import MongoClient
from backend.encoders.tweet_encoder import Tweet
from backend.metric_system.helpers.profile.tweet_analytics_helper import TweetAnalyticsHelper
import json
from backend.metric_system.compiler.np_seralizer import numpy_json_serializer
from backend.metric_system.compiler.metric_container import MetricContainer

    
class StatMetricCompiler:
    def __init__(self, debug_mode=False) -> None:
        self.debug_mode = debug_mode
        
        self._tweet_analytics_helper = TweetAnalyticsHelper(debug_mode)
        self._tweet_analytics_helper.build()
        

        self._processed_metrics: MetricContainer = MetricContainer()        
        self._unprocessed_metrics: list[Metric | MetricGenerator] = []
        self._over_tweet_metrics: list[OverTweetMetric] = []


    def _connect_to_database(self):
        return MongoClient(
            Config.db_host(),
            port=Config.db_port(),
            username=Config.db_user(),
            password=Config.db_password(),
        )[Config.db_name()]
        
        
    def add_metric(self, metric: tuple[Metric | ComputableMetric]):
        if isinstance(metric, Metric):
            if isinstance(metric, OverTweetMetric):
                self._over_tweet_metrics.append(metric)
            elif isinstance(metric, ComputableMetric):
                self._unprocessed_metrics.append(metric)
            else:
                self._processed_metrics.add_metric(metric)
        elif isinstance(metric, MetricGenerator):
            self._unprocessed_metrics.append(metric)
        else:    
            raise TypeError("Invalid metric type")
    
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
            for metric in self._over_tweet_metrics:
                metric.tweet_update(tweet)
        
        self._unprocessed_metrics.extend(self._over_tweet_metrics)
                
                
    def process(self):
        self._process_tweets()
        
        ordered_metrics: list[Metric] = self.topological_sort(self._unprocessed_metrics)
        
        
        for metric in ordered_metrics:
            if isinstance(metric, DependentMetric):
                metric.set_metric_container(self._processed_metrics)
                
            if isinstance(metric, MetricGenerator):
                metrics = metric.generate_and_validate(self._tweet_analytics_helper)
                for metric in metrics:
                    self._processed_metrics.add_metric(metric)
                    
            elif isinstance(metric, ComputableMetric):
                metric.final_update(self._tweet_analytics_helper) 
                self._processed_metrics.add_metric(metric)
            
          
    def topological_sort(self, metrics: list[Metric]) -> list[Metric | MetricGenerator]:
        # Create a mapping from each metric name/alias to the Metric object
        name_to_metric = {}
        
        for metric in metrics:
            
            if isinstance(metric, Metric):
                name_to_metric[metric.get_metric_name()] = metric
                
            elif isinstance(metric, MetricGenerator):
                for name in metric.get_created_stat_names():
                    name_to_metric[name] = metric

        visited = set()
        result = []

        def visit(metric: Metric):
            if metric in visited:
                return
            visited.add(metric)
            
            if isinstance(metric, DependentMetric):
                for dep_name in metric.get_dependencies():
                    if dep_name in name_to_metric:
                        visit(name_to_metric[dep_name])
            result.append(metric)

        for metric in metrics:
            visit(metric)

        return result
  
    def to_json(self):
        for value in self._processed_metrics.get_metrics().values():
            for k, v in value.items():
                value[k] = v.get_data()
                
        return json.dumps(self._processed_metrics, default=numpy_json_serializer)