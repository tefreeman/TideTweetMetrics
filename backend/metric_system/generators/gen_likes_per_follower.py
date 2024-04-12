from backend.metric_system.metric import Metric, MetricGenerator, DependentMetric
import logging

class GenLikesPerFollower(MetricGenerator, DependentMetric):
    def __init__(self):
        MetricGenerator.__init__(self, expected_metric_names=["likes_per_follower"])
        
        # This gives you access to the DependentMetric class
        # Methods like get_metric
        DependentMetric.__init__(self,)
        
        # Now we are able to call get_metric("tweet_likes-mean")
        self.add_dependency("tweet_likes-mean")
        
        
    def generate_metrics(self, stat_helper):
        metrics = []
        
        # Gets "tweet_likes-mean": {owner: Metric, owner: Metric,  ... }
        tweet_likes_mean_metrics = self.get_metric("tweet_likes-mean")
        
        for profile_plus in stat_helper.get_all_profiles().values():
            if profile_plus.get_username() not in tweet_likes_mean_metrics:
                logging.debug(f"{profile_plus.get_username()} not in tweet_likes_mean_metrics. Moving to next profile")
                continue
            
            average_likes_per_tweet = tweet_likes_mean_metrics[profile_plus.get_username()].get_data()
            followers = profile_plus.get_followers_count()
            
            if average_likes_per_tweet == 0 or followers == 0:
                logging.debug(f"average_likes_per_tweet and/or followers == 0. Moving to next profile")
                continue
            
            likes_per_follower = average_likes_per_tweet / followers        
            metric = Metric(profile_plus.get_username(), "likes_per_follower")
            metric.set_data(likes_per_follower)
            metrics.append(metric)
            
        return metrics