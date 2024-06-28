from typing import List
from datetime import datetime, timedelta
import numpy as np
import logging

from backend.metric_system.metric import MetricGenerator, Metric
from backend.metric_system.helpers.profile.profile_with_tweet_properties import ProfileWithTweetProperties
from backend.metric_system.helpers.profile.tweet_analytics_helper import TweetAnalyticsHelper
from backend.metric_system.helpers.key_map import create_key

_STAT_NAMES = [
    ("mean", np.mean),
    ("sum", np.sum),
    ("median", np.median),
]

class StandardProfileStatOverWeekGeneratorWeekly(MetricGenerator):
    """
    A class that generates standard profile statistics over time on a weekly basis.
    """

    def __init__(self) -> None:
        """
        Initializes the StandardProfileStatOverWeekGenerator object.
        """
        self.property_list = ["tweet_likes", "tweet_count"]
        expected_metric_names = [
            create_key(prop, stat_name, "weekly")
            for prop in self.property_list
            for stat_name, _ in _STAT_NAMES
        ]
        super().__init__(expected_metric_names)

    def generate_metrics(self, stat_helper: TweetAnalyticsHelper) -> List[Metric]:
        """
        Generates metrics for the profiles based on weekly data.
        """
        return self.gen_standard_stats_for_all_profiles(stat_helper)

    def gen_standard_stats_for_all_profiles(
        self, stat_helper: TweetAnalyticsHelper
    ) -> List[Metric]:
        """
        Generates standard statistics for all profiles on a weekly basis.
        """
        metrics = []
        for profile_plus in stat_helper.get_all_profiles().values():
            metrics += self.gen_standard_stats_for_profile(profile_plus)
        return metrics
    
    def gen_standard_stats_for_profile(self, profile_plus: ProfileWithTweetProperties) -> List[Metric]:
        """
        Generates weekly standard statistics for a profile, including zeros for all time intervals.
        """
        metrics = []

        for tweet_property in self.property_list:
            for stat_name, stat_func in _STAT_NAMES:
                metric = Metric(
                    profile_plus.get_username(),
                    create_key(tweet_property, stat_name, "weekly")
                )

                arr = profile_plus.get_tweet_property(tweet_property)

                if len(arr) == 0:
                    logging.debug(f"Skipping metric for {tweet_property}-{stat_name} due to no data available")
                    continue

                logging.debug(f"Generating metrics for {tweet_property}-{stat_name}-weekly")
                
                latest_date = datetime.now()
                oldest_date = latest_date - timedelta(weeks=260)  # Approx 5 years

                weekly_stats = []
                current_week_start = oldest_date

                while current_week_start < latest_date:
                    current_week_end = current_week_start + timedelta(days=7)
                    start_index, end_index = profile_plus.get_index_between_dates(
                        current_week_start, current_week_end
                    )
                    week_arr = arr[start_index:end_index]

                    # Calculate stat or use zero if no data available
                    if len(week_arr) == 0:
                        avg_value = 0
                    else:
                        avg_value = stat_func(week_arr)

                    weekly_stats.append((int(current_week_start.timestamp()), avg_value))

                    current_week_start += timedelta(days=7)

                metric.set_data(weekly_stats)
                metrics.append(metric)

        return metrics