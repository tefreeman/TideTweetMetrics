from ..metrics import Metric 
from encoders.tweet_encoder import Tweet
from encoders.profile_encoder import Profile

# Gets average likes per profile as well as total avg likes per all profiles (tag all)
class TotalMetric(Metric):
    def __init__(self, prop_name:str, tweet_method):
        super().__init__("Total" + prop_name,  update_over_tweets=True, update_over_profiles=True)
        self.prop_name = prop_name
        self.tweet_method = tweet_method
        self.total = 0        
        self.profiles = {}

    def UpdateByProfile(self, profile):
        self.profiles[profile.get_username()] = {self.prop_name: 0}
        
    def UpdateByTweet(self, tweet):
        # Assuming 'tweet' is a dictionary that contains a 'likes' key
        self.total += getattr(tweet, self.tweet_method)()
        
        # Fix if its not in profiles:
        if tweet.get_author() not in self.profiles:
            return
            
        # Update the profile's like count         
        self.profiles[tweet.get_author()][self.prop_name] += getattr(tweet, self.tweet_method)()
        
    def FinalUpdate(self, tweet_stats, profile_stats):

        # Build up the metric encoder
        for profile in self.profiles:
            self.MetricEncoder.add_dataset(profile, (self.profiles[profile][self.prop_name],))
        
        self.MetricEncoder.set_axis_titles(["Profile", "Total" + self.prop_name])