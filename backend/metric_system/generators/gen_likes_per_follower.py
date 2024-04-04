from backend.metric_system.metric import Metric, MetricGenerator

class GenLikesPerFollower(MetricGenerator):
    
    def generate_metrics(self, stat_helper, previous_metrics):
        metrics = []
        for profile_plus in stat_helper.get_all_profiles().values():
            if profile_plus.get_username() not in previous_metrics["tweet_likes_mean"]:
                continue
            
            average_likes_per_tweet = previous_metrics["tweet_likes_mean"][profile_plus.get_username()].get_data()
            followers = profile_plus.get_followers_count()
            
            if average_likes_per_tweet == 0 or followers == 0:
                continue
            
            likes_per_follower = average_likes_per_tweet / followers
            
            metric = Metric(profile_plus.get_username(), "likes_per_follower")
            metric.metric_encoder.set_dataset(likes_per_follower)
            metrics.append(metric)
        return metrics