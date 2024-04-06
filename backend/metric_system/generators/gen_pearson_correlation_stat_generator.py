import numpy as np
from backend.metric_system.metric import MetricGenerator, Metric, DependentMetric
from backend.metric_system.helpers.profile.profile_with_tweet_properties import ProfileWithTweetProperties
from backend.metric_system.helpers.profile.tweet_analytics_helper import TweetAnalyticsHelper
from itertools import product

class PearsonCorrelationProfileStatGenerator(MetricGenerator):
    def __init__(self) -> None:
        
        self.prop_list = ["tweet_likes"] # add properties from the  ProfileWithTweetProperties Class
        # Generate output names for Pearson correlation between all pairs of properties
        stat_names_out = [f"pearson_{prop1}_vs_{prop2}" for prop1, prop2 in product(self.prop_list, ProfileWithTweetProperties.get_properties_list()[1:])]
        
        
        super().__init__(stat_names_out)
        
    def generate_metrics(self, stat_helper: TweetAnalyticsHelper) -> list[Metric]:
        return self.gen_pearson_correlations_for_profile(stat_helper.get_profile("_global"))
    
    def gen_pearson_correlations_for_profile(self, profile_plus: ProfileWithTweetProperties) -> list[Metric]:
        metrics = []
        prop_list = profile_plus.get_properties_list()
        
        for prop1, prop2 in product(self.prop_list, ProfileWithTweetProperties.get_properties_list()[1:]):
            metric_name = f"pearson_{prop1}_vs_{prop2}"
            arr1 = profile_plus.get_tweet_property(prop1)
            arr2 = profile_plus.get_tweet_property(prop2)
            
            if len(arr1) > 0 and len(arr2) > 0:
                # Ensure arrays are of the same length
                min_length = min(len(arr1), len(arr2))
                arr1 = arr1[:min_length]
                arr2 = arr2[:min_length]
                
                if np.std(arr1) != 0 and np.std(arr2) != 0:  # Avoid division by zero in correlation
                    correlation_matrix = np.corrcoef(arr1, arr2)
                    correlation = correlation_matrix[0, 1]  # Get the Pearson correlation coefficient
                    metric = Metric(profile_plus.get_username(), metric_name)
                    metric.set_data(correlation)
                    metrics.append(metric)
                    
                    continue
            # If the arrays are empty or have zero standard deviation, set the correlation to 0
            metric = Metric(profile_plus.get_username(), metric_name)
            metric.flag_as_error()
            metrics.append(metric)
        return metrics
