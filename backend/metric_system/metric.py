from backend.encoders.tweet_encoder import Tweet
from backend.encoders.profile_encoder import Profile
from backend.encoders.metric_encoder import MetricEncoder
from backend.metric_system.helpers.profile.tweet_analytics_helper import TweetAnalyticsHelper


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
    
    def get_encoder(self):
        return self.metric_encoder

    
# Metrics that need to be computed
# These metrics can be computed from the data in the tweet
# or from the data in the stat helper
class ComputableMetric(Metric):
    def __init__(self, owner: str, metric_name: str, do_update_over_tweet: bool = False):
        super().__init__(owner, metric_name)
        self.do_update_over_tweet = do_update_over_tweet
        
    def update_over_tweet(self, tweet: Tweet):
        raise Exception("Method not implemented")
    
    def final_update(self, stat_helper: TweetAnalyticsHelper, previous_metrics: dict[str, Metric]):
        raise Exception("Method not implemented")


# For creating many metrics at once
class MetricGenerator:
    def generate_metrics(self, stat_helper: TweetAnalyticsHelper, previous_metrics: dict[str, Metric]) -> list[Metric]:
        pass
    


