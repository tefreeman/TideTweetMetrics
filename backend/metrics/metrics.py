from encoders.tweet_encoder import Tweet
from encoders.profile_encoder import Profile
from encoders.metric_encoder import MetricEncoder

class Metric:
    def __init__(self, name: str,  update_over_tweets = False, update_over_profiles = False):
        self.MetricEncoder = MetricEncoder()
        self._update_over_tweets = update_over_tweets
        self._update_over_profiles = update_over_profiles
        self.name = name
    
    def get_name(self) -> str:
        if not self.name:
            raise Exception("Name has not been set")
        return self.name
    
    def UpdateByTweet(self, tweet: Tweet):
        pass

    def UpdateByProfile(self, profile: Profile):
        pass
    
    def tweetFilter(self, tweet: Tweet):
        return True  # Default filter returns True

    def ProfileFilter(self, profile: Profile):
        return True  # Default filter returns True

    def FinalUpdate(self, tweet_stats, profile_stats):
        # Must be implemented in derived classes
        raise NotImplementedError("FinalUpdate method must be implemented in derived classes.")

    def GetEncoder(self):
        return self.MetricEncoder

    
    
