from backend.encoders.tweet_encoder import Tweet
from backend.encoders.profile_encoder import Profile
from backend.encoders.metric_encoder import MetricEncoder
from backend.metric_system.helpers.profile.tweet_analytics_helper import TweetAnalyticsHelper
from backend.metric_system.compiler.metric_container import MetricContainer

# All needed logging for this file is covered by raised exceptions


from abc import ABC, abstractmethod

# General class for metrics not requiring computation
class Metric(ABC):
    def __init__(self, owner: str, metric_name: str):
        self.metric_encoder: MetricEncoder = MetricEncoder()
        self._owner = owner
        self._metric_name = metric_name
        self._error = False
        
    def get_metric_name(self) -> str:
        return self._metric_name
    
    def get_owner(self) -> str:
        return self._owner

    def get_data(self):
        return self.metric_encoder.get_dataset()
    
    def set_data(self, data):
        return self.metric_encoder.set_dataset(data)

    def is_error(self) -> bool:
        return self._error
    
    def flag_as_error(self):
        self._error = True
    
# Metrics that need to be computed
# These metrics can be computed from the data in the tweet
# or from the data in the stat helper

class ComputableMetric(Metric, ABC):
    @abstractmethod
    def final_update(self, stat_helper: TweetAnalyticsHelper):
        raise Exception("Method not implemented")

class OverTweetMetric(ComputableMetric):
    @abstractmethod
    def tweet_update(self, tweet: Tweet):
        raise Exception("Method not implemented")
    
class DependentMetric:
    def __init__(self) -> None:
        self._depends_on: set[str] = set()
        self._pre_computed_metrics: MetricContainer = None
        
    def set_metric_container(self, metric_container: MetricContainer):
        self._pre_computed_metrics = metric_container
        
    def add_dependency(self, metric_name: str):
        self._depends_on.add(metric_name)
    
    def add_dependencies(self, metric_names: set[str]):
        self._depends_on.update(metric_names)
        
    def is_a_dependency(self, metric_name: str) -> bool:
        return metric_name in self._depends_on
    
    def get_dependencies(self) -> set[str]:
        return self._depends_on

    def get_metric(self, metric_name: str) -> dict[str, Metric]:
        if metric_name not in self._depends_on:
            raise Exception(f"Metric {metric_name} not in dependencies")
        
        return self._pre_computed_metrics.get_metric(metric_name)
    
    
# For creating many metrics at once
class MetricGenerator:
    def __init__(self, stat_names_out: list[str]) -> None:
        self._stat_names_out = set(stat_names_out)
        
    def get_created_stat_names(self) -> set[str]:
        return self._stat_names_out
    
    def generate_and_validate(self, stat_helper: TweetAnalyticsHelper) -> list[Metric]:
        metrics: list[Metric] = self.generate_metrics(stat_helper)
        metric_names = set([metric.get_metric_name() for metric in metrics])
        
        if metric_names != self._stat_names_out:
            raise Exception(f"Generated metrics do not match expected metrics output: {metric_names} != {self._stat_names_out}")
        
        return metrics
    
    @abstractmethod
    def generate_metrics(self, stat_helper: TweetAnalyticsHelper) -> list[Metric]:
        pass
    


