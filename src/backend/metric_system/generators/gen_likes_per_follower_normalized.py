from backend.metric_system.metric import Metric, MetricGenerator, DependentMetric
from backend.metric_system.helpers.profile.tweet_analytics_helper import TweetAnalyticsHelper

class GenLikesPerFollowerNormalized(MetricGenerator, DependentMetric):
    def __init__(self):
        self.my_metric_name = "likes_per_follower_normalized"
        MetricGenerator.__init__(self, expected_metric_names=[ self.my_metric_name])
        DependentMetric.__init__(self)
        self.add_dependency('likes_per_follower')

    def generate_metrics(self, stat_helper: TweetAnalyticsHelper) -> list[Metric]:

        # Assuming stat_helper has a method to get a metric by name, which is not evident from the provided code
        likes_per_follower_metrics = self.get_metric('likes_per_follower')

        # Perform normalization on the likes_per_follower metric
        normalized_values = self.normalize(likes_per_follower_metrics)

        # Constructing a Metric object with normalized data
        normalized_metrics = self.create_normalized_metric("likes_per_follower_normalized", normalized_values)

        return normalized_metrics

    def normalize(self, metrics: dict[str, Metric]):
        # Assuming metrics is a dict with profile_name as key and Metric object as value
        # Extract all numerical values from the metrics for normalization
        values = [metric.get_data() for metric in metrics.values()]
        min_val = min(values)
        max_val = max(values)
        
        # Applying min-max normalization
        normalized_values = {profile: (metric.get_data() - min_val) / (max_val - min_val)
                            for profile, metric in metrics.items()}
        return normalized_values
    

    def create_normalized_metric(self, name, normalized_data):
        # Assuming normalized_data is a dict mapping profile names to their normalized values
        metrics = []
        for profile_name, data in normalized_data.items():
            # Creating a new Metric object for each profile with its normalized data
            metric = Metric(owner = profile_name, metric_name= self.my_metric_name )  # Adjust this depending on actual Metric constructor.
            metric.set_data(data)
            metrics.append(metric)
        return metrics