from typing import Callable, Any, List, Dict
import numpy as np
from backend.metric_system.metric import MetricGenerator, Metric, DependentMetric
from backend.metric_system.helpers.profile.profile_with_tweet_properties import ProfileWithTweetProperties
from backend.metric_system.helpers.profile.tweet_analytics_helper import TweetAnalyticsHelper
import logging
from datetime import datetime
# Define statistics names along with their corresponding functions.
_STAT_NAMES = [
    ('mean', np.mean),
    ('sum', np.sum),
    ('median', np.median),
]


class StandardProfileStatOverTimeGenerator(MetricGenerator):
    def __init__(self) -> None:
        self.prop_list = ["tweet_likes", "tweet_count"]
        stat_names_out = [f"{prop}-{stat_name}-yearly" for prop in self.prop_list for stat_name, _ in _STAT_NAMES]
        super().__init__(stat_names_out) 
        
    def generate_metrics(self, stat_helper: TweetAnalyticsHelper) -> List[Metric]:
        return self.gen_standard_stats_for_all_profiles(stat_helper)

    def gen_standard_stats_for_all_profiles(self, stat_helper: TweetAnalyticsHelper) -> List[Metric]:
        metrics = []
        for profile_plus in stat_helper.get_all_profiles().values():
            metrics += self.gen_standard_stats_for_profile(profile_plus)
        return metrics

    def gen_standard_stats_for_profile(self, profile_plus: ProfileWithTweetProperties) -> List[Metric]:
        metrics = []
        
        for tweet_property in self.prop_list:
            for stat_name, stat_func in _STAT_NAMES:
                metric = Metric(profile_plus.get_username(), f"{tweet_property}-{stat_name}-yearly")
               
                arr = profile_plus.get_tweet_property(tweet_property)
                
                if len(arr) == 0:
                    logging.debug(f"Skipping metric {tweet_property}-{stat_name} due to no tweet_property")
                    continue
                
                
                
                logging.debug(f"{tweet_property}-{stat_name}-yearly")
                current_year = datetime.now().year
                yearly_stats = []
                
                for year in range(current_year -9, current_year -1):
                    start_date = datetime(year, 1, 1)
                    end_date = datetime(year + 1, 1, 1)
                    start_index, end_index = profile_plus.get_index_between_dates(start_date, end_date)
                    year_arr = arr[start_index:end_index]
                    if len(year_arr) == 0:
                        yearly_stats.append((year, 0))
                    else:
                        yearly_stats.append((year, stat_func(year_arr)))
                
                metric.set_data(yearly_stats)


                metrics.append(metric)
                
    
        return metrics
        
        