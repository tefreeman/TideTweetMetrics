from encoders.tweet_encoder import Tweet
from encoders.profile_encoder import Profile
from encoders.metric_encoder import MetricEncoder

class Metric:
    def __init__(self, name: str,  update_over_tweets = False, update_over_profiles = False, encoder_count = 1):
        self.metric_encoders: list[MetricEncoder] = []
        self._update_over_tweets = update_over_tweets
        self._update_over_profiles = update_over_profiles
        self._name = name
        
        
        self._init_encoder(encoder_count)
        
    def _init_encoder(self, count):
        for i in range(count):
            self.metric_encoders.append(MetricEncoder())
            
    def get_name(self) -> str:
        if not self._name:
            raise Exception("Name has not been set")
        return self._name
    
    def update_by_tweet(self, tweet: Tweet):
        raise NotImplementedError("UpdateByTweet method must be implemented in derived classes.")

    def update_by_profile(self, profile: Profile):
        raise NotImplementedError("UpdateByProfile method must be implemented in derived classes.")
    
    def tweet_filter(self, tweet: Tweet):
        return True  # Default filter returns True

    def profile_filter(self, profile: Profile):
        return True  # Default filter returns True

    def final_update(self, ):
        # Must be implemented in derived classes
        raise NotImplementedError("FinalUpdate method must be implemented in derived classes.")

    def get_encoders(self):
        return self.metric_encoders

    
    
