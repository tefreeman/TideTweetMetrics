from backend.encoders.tweet_encoder import Tweet
from backend.encoders.profile_encoder import Profile
from backend.encoders.metric_encoder import MetricEncoder
from backend.metrics.profile_stats.tweet_property_profile_compiler import TweetPropertyProfileCompiler

class Metric:
    def __init__(self, owner: str, name: str,  update_over_tweets = False, update_over_profiles = False,):
        self.metric_encoder: MetricEncoder = MetricEncoder()
        self._owner = owner
        self._name = name
        self._update_over_tweets = update_over_tweets
        self._update_over_profiles = update_over_profiles
        
            
    def get_name(self) -> str:
        return self._name
    
    def get_owner(self) -> str:
        return self._owner
    
    def update_by_tweet(self, tweet: Tweet):
        raise NotImplementedError("UpdateByTweet method must be implemented in derived classes.")

    def update_over_profile(self, profile: Profile):
        raise NotImplementedError("UpdateByProfile method must be implemented in derived classes.")
    
    def tweet_filter(self, tweet: Tweet):
        return True  # Default filter returns True

    def profile_filter(self, profile: Profile):
        return True  # Default filter returns True

    def final_update(self, pre_compiler: TweetPropertyProfileCompiler):
        # Must be implemented in derived classes
        raise NotImplementedError("FinalUpdate method must be implemented in derived classes.")

    def get_data(self):
        return self.metric_encoder.get_dataset()
    
    def get_encoder(self):
        return self.metric_encoder

    