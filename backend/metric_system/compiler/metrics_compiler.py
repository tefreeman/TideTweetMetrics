from ..metric import Metric, ComputableMetric, MetricGenerator, OverTweetMetric, DependentMetric
from backend.config import Config
from pymongo import MongoClient
from backend.encoders.tweet_encoder import Tweet
from backend.metric_system.helpers.profile.tweet_analytics_helper import TweetAnalyticsHelper
import json
from backend.metric_system.compiler.np_seralizer import numpy_json_serializer
from backend.metric_system.compiler.metric_container import MetricContainer
import logging

    
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
                logging.debug("metric is an OverTweetMetric")
                self._over_tweet_metrics.append(metric)
            elif isinstance(metric, ComputableMetric):
                self._unprocessed_metrics.append(metric)
                logging.debug("metric is a ComputableMetric")
            else:
                self._processed_metrics.add_metric(metric)
                logging.debug("metric is neither a ComputableMetric, OverTweetMetric, or MetricGenerator")
        elif isinstance(metric, MetricGenerator):
            self._unprocessed_metrics.append(metric)
            logging.debug("metric is a MetricGenerator")
        else:    
            raise TypeError("Invalid metric type")
    
    def add_metrics(self, metrics: list[Metric | ComputableMetric]):
        for metric in metrics:
            logging.debug(f"Adding {metric.get_metric_name()}")
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
        logging.info("Processing tweets")
        self._process_tweets()
        
        logging.info("Ordering metrics with topological sort")
        ordered_metrics: list[Metric] = self.topological_sort(self._unprocessed_metrics)
        

        for metric in ordered_metrics:
            if isinstance(metric, DependentMetric):
                logging.debug("Handing a DependentMetric")
                metric.set_metric_container(self._processed_metrics)
                
            if isinstance(metric, MetricGenerator):
                logging.debug("Handling a MetricGenerator")
                metrics = metric.generate_and_validate(self._tweet_analytics_helper)
                for metric in metrics:
                    self._processed_metrics.add_metric(metric)
                    
            elif isinstance(metric, ComputableMetric):
                logging.debug("Handling a ComputableMetric")
                metric.final_update(self._tweet_analytics_helper) 
                self._processed_metrics.add_metric(metric)
            
          
    def topological_sort(self, metrics: list[Metric]) -> list[Metric | MetricGenerator]:
        # Create a mapping from each metric name/alias to the Metric object
        name_to_metric = {}
        
        logging.info("creating map from each metric name to its metric object")
        for metric in metrics:
            
            if isinstance(metric, Metric):
                name_to_metric[metric.get_metric_name()] = metric
                
            elif isinstance(metric, MetricGenerator):
                for name in metric.get_created_stat_names():
                    name_to_metric[name] = metric

        visited = set()
        result = []

        def visit(metric: Metric):
            logging.debug(f"Visiting {metric.get_metric_name}")
            if metric in visited:
                logging.debug(f"{metric.get_metric_name} already visited")
                return
            visited.add(metric)
            
            if isinstance(metric, DependentMetric):
                for dep_name in metric.get_dependencies():
                    if dep_name in name_to_metric:
                        visit(name_to_metric[dep_name])
            logging.debug(f"Adding {metric.get_metric_name}")
            result.append(metric)

        logging.info("Visiting each metric")
        for metric in metrics:
            visit(metric)

        return result
  
    def to_json(self):
        self._processed_metrics.remove_error_metrics()
        for owner_metrics in self._processed_metrics.get_metrics().values():
            for owner, metric in owner_metrics.items():
                owner_metrics[owner] = metric.get_data()
            
        return json.dumps(self._processed_metrics.get_metrics(), default=numpy_json_serializer)