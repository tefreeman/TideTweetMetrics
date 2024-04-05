from backend.metric_system.metric import Metric, MetricGenerator

class GenLikesPerFollower(MetricGenerator):
    def __init__(self):
        super().__init__()
        self.add_dependency("tweet_likes_mean")
        
        
    def generate_metrics(self, stat_helper):
        metrics = []
        
        tweet_likes_mean_metrics = self._previous_metrics.get_metric("tweet_likes_mean")
        for profile_plus in stat_helper.get_all_profiles().values():
            if profile_plus.get_username() not in tweet_likes_mean_metrics:
                continue
            
            average_likes_per_tweet = tweet_likes_mean_metrics[profile_plus.get_username()].get_data()
            followers = profile_plus.get_followers_count()
            
            if average_likes_per_tweet == 0 or followers == 0:
                continue
            
            likes_per_follower = average_likes_per_tweet / followers
            
            metric = Metric(profile_plus.get_username(), "likes_per_follower")
            metric.set_data(likes_per_follower)
            metrics.append(metric)
        return metrics