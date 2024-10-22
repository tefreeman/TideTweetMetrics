import numpy as np
from backend.metric_system.metric import MetricGenerator, Metric, DependentMetric
from backend.metric_system.helpers.profile.profile_with_tweet_properties import (
    ProfileWithTweetProperties,
)
from backend.metric_system.helpers.profile.tweet_analytics_helper import (
    TweetAnalyticsHelper,
)
from backend.metric_system.helpers.key_map import create_key, GLOBAL_PROFILE_NAME
from itertools import product
import logging


class PearsonCorrelationProfileStatGenerator(MetricGenerator):
    """
    Generates Pearson correlation statistics between pairs of tweet properties for a given profile.

    Attributes:
        prop_list (list): List of tweet properties to calculate correlations for.

    Methods:
        __init__(): Initializes the PearsonCorrelationProfileStatGenerator class.
        generate_metrics(stat_helper): Generates the Pearson correlation metrics for the given profile.
        gen_pearson_correlations_for_profile(profile_plus): Calculates the Pearson correlation coefficients for the given profile.

    """

    def __init__(self) -> None:
        """
        Initializes the PearsonCorrelationProfileStatGenerator class.

        """
        self.prop_list = [
            "tweet_likes"
        ]  # add properties from the  ProfileWithTweetProperties Class
        # Generate output names for Pearson correlation between all pairs of properties
        expected_metric_names = [
            create_key("pearson", prop1, "vs", prop2)
            for prop1, prop2 in product(
                self.prop_list, ProfileWithTweetProperties.get_properties_list()[1:]
            )
        ]

        # Calls the __init__ method of the MetricGenerator class
        super().__init__(expected_metric_names)

    def generate_metrics(self, stat_helper: TweetAnalyticsHelper) -> list[Metric]:
        """
        Generates the Pearson correlation metrics for the given profile.

        Args:
            stat_helper (TweetAnalyticsHelper): Helper class for accessing tweet analytics data.
                Used here to get the profile data via "stat_helper.get_profile(GLOBAL_PROFILE_NAME)".
                GLOBAL_PROFILE_NAME is defined in key_map.py.

        Returns:
            list[Metric]: List of generated Pearson correlation metrics.

        """
        return self.gen_pearson_correlations_for_profile(
            stat_helper.get_profile(GLOBAL_PROFILE_NAME)
        )

    def gen_pearson_correlations_for_profile(
        self, profile_plus: ProfileWithTweetProperties
    ) -> list[Metric]:
        """
        Calculates the Pearson correlation coefficients for the given profile.

        Args:
            profile_plus (ProfileWithTweetProperties): Profile with tweet properties.

        Returns:
            list[Metric]: List of generated Pearson correlation metrics.

        """
        metrics = []

        for prop1, prop2 in product(
            self.prop_list, ProfileWithTweetProperties.get_properties_list()[1:]
        ):
            metric_name = create_key("pearson", prop1, "vs", prop2)
            arr1 = profile_plus.get_tweet_property(prop1)
            arr2 = profile_plus.get_tweet_property(prop2)

            if len(arr1) > 0 and len(arr2) > 0:
                # Ensure arrays are of the same length
                if len(arr1) != len(arr2):
                    logging.warning(
                        f"Comparison {metric_name} does not have properties with arrays of equal lengths. Shortening one to make lengths equal"
                    )
                    min_length = min(len(arr1), len(arr2))
                    arr1 = arr1[:min_length]
                    arr2 = arr2[:min_length]

                if (
                    np.std(arr1) != 0 and np.std(arr2) != 0
                ):  # Avoid division by zero in correlation
                    correlation_matrix = np.corrcoef(arr1, arr2)
                    correlation = correlation_matrix[
                        0, 1
                    ]  # Get the Pearson correlation coefficient
                    logging.debug(
                        f"{metric_name} has correlation {correlation}. Creating and setting metric"
                    )
                    metric = Metric(profile_plus.get_username(), metric_name)
                    metric.set_data(correlation)
                    metrics.append(metric)
                    continue

            # If the arrays are empty or have zero standard deviation, set the correlation to 0
            logging.warning(
                f"arrays are either empty or have 0 standard deviation. Correlation is being set to 0 and flagged as an error"
            )
            metric = Metric(profile_plus.get_username(), metric_name)
            metric.flag_as_error()
            metrics.append(metric)
        return metrics
