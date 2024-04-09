from typing import Callable, Any, List, Dict
import numpy as np
from backend.metric_system.metric import MetricGenerator, Metric, DependentMetric
from backend.metric_system.helpers.profile.profile_with_tweet_properties import ProfileWithTweetProperties
from backend.metric_system.helpers.profile.tweet_analytics_helper import TweetAnalyticsHelper
import logging

# Define statistics names along with their corresponding functions.
_STAT_NAMES = [
    ('mean', np.mean),
    ('std', np.std),
    ('min', np.min),
    ('max', np.max),
    ('sum', np.sum),
    ('count', len),
    ('median', np.median),
    ('25th_percentile', lambda x: np.percentile(x, 25)),
    ('75th_percentile', lambda x: np.percentile(x, 75)),
]

class StandardProfileStatGenerator(MetricGenerator):
    def __init__(self) -> None:
        prop_list = ProfileWithTweetProperties.get_properties_list()
        stat_names_out = [f"{prop}-{stat_name}" for prop in prop_list for stat_name, _ in _STAT_NAMES]
        super().__init__(stat_names_out) 
        
    def generate_metrics(self, stat_helper: TweetAnalyticsHelper) -> List[Metric]:
        return StandardProfileStatGenerator.gen_standard_stats_for_all_profiles(stat_helper)
    
    @staticmethod
    def gen_standard_stats_for_all_profiles(stat_helper: TweetAnalyticsHelper) -> List[Metric]:
        metrics = []
        for profile_plus in stat_helper.get_all_profiles().values():
            metrics += StandardProfileStatGenerator.gen_standard_stats_for_profile(profile_plus)
        return metrics

    @staticmethod
    def gen_standard_stats_for_profile(profile_plus: ProfileWithTweetProperties) -> List[Metric]:
        metrics = []
        
        for tweet_property in profile_plus.get_properties_list():
            for stat_name, stat_func in _STAT_NAMES:
                metric = Metric(profile_plus.get_username(), f"{tweet_property}-{stat_name}")
                arr = profile_plus.get_tweet_property(tweet_property)
                
                if len(arr) == 0:
                    logging.debug(f"Skipping metric {tweet_property}-{stat_name} due to no tweet_property")
                    continue
                
                logging.debug(f"Creating metric {tweet_property}-{stat_name}")
                metric.set_data(stat_func(arr))
                metrics.append(metric)
                
    
        return metrics
        
        