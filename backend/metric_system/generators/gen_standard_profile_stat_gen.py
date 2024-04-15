from typing import Callable, Any, List, Dict
import numpy as np
from backend.metric_system.metric import MetricGenerator, Metric, DependentMetric
from backend.metric_system.helpers.profile.profile_with_tweet_properties import (
    ProfileWithTweetProperties,
)
from backend.metric_system.helpers.profile.tweet_analytics_helper import (
    TweetAnalyticsHelper,
)
from backend.metric_system.helpers.key_map import create_key
import logging

# Define statistics names along with their corresponding functions.
_STAT_NAMES = [
    ("mean", np.mean),
    ("std", np.std),
    ("min", np.min),
    ("max", np.max),
    ("sum", np.sum),
    ("count", len),
    ("median", np.median),
    ("25th_percentile", lambda x: np.percentile(x, 25)),
    ("75th_percentile", lambda x: np.percentile(x, 75)),
]


class StandardProfileStatGenerator(MetricGenerator):
    """
    Generates standard profile statistics metrics.
    The standard statistics include mean, standard deviation, minimum, maximum, sum, count, median, 25th percentile, and 75th percentile.
    """

    def __init__(self) -> None:
        """Initialize the StandardProfileStatGenerator."""
        property_list = ProfileWithTweetProperties.get_properties_list()
        _expected_names_out = [
            create_key(prop, stat_name)
            for prop in property_list
            for stat_name, _ in _STAT_NAMES
        ]
        super().__init__(_expected_names_out)

    def generate_metrics(self, stat_helper: TweetAnalyticsHelper) -> List[Metric]:
        """Generate metrics for standard profile statistics.

        Args:
            stat_helper (TweetAnalyticsHelper): The helper object containing tweet analytics data.

        Returns:
            List[Metric]: The list of generated metrics.
        """
        return StandardProfileStatGenerator.gen_standard_stats_for_all_profiles(
            stat_helper
        )

    @staticmethod
    def gen_standard_stats_for_all_profiles(
        stat_helper: TweetAnalyticsHelper,
    ) -> List[Metric]:
        """Generate standard statistics metrics for all profiles.

        Args:
            stat_helper (TweetAnalyticsHelper): The helper object containing tweet analytics data.

        Returns:
            List[Metric]: The list of generated metrics.
        """
        metrics = []
        for profile_plus in stat_helper.get_all_profiles().values():
            metrics += StandardProfileStatGenerator.gen_standard_stats_for_profile(
                profile_plus
            )
        return metrics

    @staticmethod
    def gen_standard_stats_for_profile(
        profile_plus: ProfileWithTweetProperties,
    ) -> List[Metric]:
        """Generate standard statistics metrics for a profile.

        Args:
            profile_plus (ProfileWithTweetProperties): The profile object containing tweet properties.
                Taken from "for profile_plus in stat_helper.get_all_profiles().values()" in gen_standard_stats_for_all_profiles().
        Returns:
            List[Metric]: The list of generated metrics.
        """
        metrics = []

        for tweet_property in profile_plus.get_properties_list():
            for stat_name, stat_func in _STAT_NAMES:
                metric = Metric(
                    profile_plus.get_username(), create_key(tweet_property, stat_name)
                )
                np_arr = profile_plus.get_tweet_property(tweet_property)

                if len(np_arr) == 0:
                    logging.debug(
                        f"Skipping metric {tweet_property}-{stat_name} due to no tweet_property"
                    )
                    continue

                metric.set_data(stat_func(np_arr))
                metrics.append(metric)

        return metrics
