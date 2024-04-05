from backend.encoders.tweet_encoder import Tweet
from backend.encoders.profile_encoder import Profile
from backend.encoders.metric_encoder import MetricEncoder
from backend.metric_system.helpers.profile.tweet_analytics_helper import TweetAnalyticsHelper
from backend.metric_system.metric_container import MetricContainer

class MetricDependency:
    def __init__(self) -> None:
        self._depends_on: list[str] = []
        
    def add_dependency(self, metric_name: str):
        self._depends_on.append(metric_name)
        
    def get_dependencies(self) -> list[str]:
        return self._depends_on


# General class for metrics not requiring computation
class Metric:
    def __init__(self, owner: str, metric_name: str):
        self.metric_encoder: MetricEncoder = MetricEncoder()
        self._owner = owner
        self._metric_name = metric_name
        
    def get_metric_name(self) -> str:
        return self._metric_name
    
    def get_owner(self) -> str:
        return self._owner

    def get_data(self):
        return self.metric_encoder.get_dataset()
    
    def set_data(self):
        return self.metric_encoder.set_dataset()

    
# Metrics that need to be computed
# These metrics can be computed from the data in the tweet
# or from the data in the stat helper
class ComputableMetric(Metric):
    def __init__(self, owner: str, metric_name: str, do_update_over_tweet: bool = False):
        super().__init__(owner, metric_name)
        self.metric_dependency: MetricDependency = MetricDependency()
        self.do_update_over_tweet = do_update_over_tweet
        
    def update_over_tweet(self, tweet: Tweet):
        raise Exception("Method not implemented")
    
    def final_update(self, stat_helper: TweetAnalyticsHelper, previous_metrics: dict[str, Metric]):
        raise Exception("Method not implemented")


# For creating many metrics at once
class MetricGenerator:
    def __init__(self):
        self._metric_dependency: MetricDependency = MetricDependency()
        self._previous_metrics: MetricContainer = None
    
    def set_previous_metrics(self, metric_container: MetricContainer):
        self._previous_metrics = metric_container
        
    def add_dependency(self, metric_name: str):
        self._metric_dependency.add_dependency(metric_name)
        
    def add_dependencies(self, metric_names: list[str]):
        for metric_name in metric_names:
            self.add_dependency(metric_name)
            
    def get_previous_metric(self, metric_name: str) -> Metric:
        if metric_name not in self._metric_dependency.get_dependencies():
            raise Exception(f"Metric {metric_name} not in dependencies")
        
        return self._previous_metrics.get_metric(metric_name)
    
        
    def generate_metrics(self, stat_helper: TweetAnalyticsHelper) -> list[Metric]:
        pass
    


