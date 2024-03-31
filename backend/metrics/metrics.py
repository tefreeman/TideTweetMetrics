from encoders.tweet_encoder import Tweet
from encoders.profile_encoder import Profile
from encoders.metric_encoder import MetricEncoder

class Metric:
    def __init__(self, name: str,  update_over_tweets = False, update_over_profiles = False, encoder_count = 1):
        self.metric_encoders: list[MetricEncoder] = []
        self._update_over_tweets = update_over_tweets
        self._update_over_profiles = update_over_profiles
        self.name = name
        self.init_encoder(encoder_count)
    def init_encoder(self, count):
        for i in range(count):
            self.metric_encoders.append(MetricEncoder())
            
    def get_name(self) -> str:
        if not self.name:
            raise Exception("Name has not been set")
        return self.name
    
    def UpdateByTweet(self, tweet: Tweet):
        raise NotImplementedError("UpdateByTweet method must be implemented in derived classes.")

    def UpdateByProfile(self, profile: Profile):
        raise NotImplementedError("UpdateByProfile method must be implemented in derived classes.")
    
    def tweetFilter(self, tweet: Tweet):
        return True  # Default filter returns True

    def ProfileFilter(self, profile: Profile):
        return True  # Default filter returns True

    def FinalUpdate(self, tweet_stats, profile_stats):
        # Must be implemented in derived classes
        raise NotImplementedError("FinalUpdate method must be implemented in derived classes.")

    def GetEncoders(self):
        return self.metric_encoders

    
    
