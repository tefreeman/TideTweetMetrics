from ..metrics import Metric 
from encoders.tweet_encoder import Tweet
from encoders.profile_encoder import Profile

# Gets average likes per profile as well as total avg likes per all profiles (tag all)
class AverageLikesMetric(Metric):
    def __init__(self):
        # Initialize with update_over_tweets=True since we're calculating average likes for tweets
        super().__init__(self.__class__.__name__, update_over_tweets=True, update_over_profiles=True)
        self.total_likes = 0
        self.total_tweets = 0
        
        self.profiles = {}

    def UpdateByProfile(self, profile):
        self.profiles[profile.get_username()] = {"likes": 0, "tweets": 0}
        
    def UpdateByTweet(self, tweet):
        # Assuming 'tweet' is a dictionary that contains a 'likes' key
        self.total_likes += tweet.get_public_metrics()["like_count"]
        self.total_tweets += 1
        
        # Fix if its not in profiles:
        if tweet.get_author() not in self.profiles:
            return
            
        # Update the profile's like count         
        self.profiles[tweet.get_author()]["likes"] += tweet.get_public_metrics()["like_count"]
        self.profiles[tweet.get_author()]["tweets"] += 1
        
    def FinalUpdate(self, tweet_stats, profile_stats):
        # Calculate the average likes per tweet
        if self.total_tweets > 0:
            self.average_likes = self.total_likes / self.total_tweets
        else:
            self.average_likes = 0
            
        for profile in self.profiles:
            if self.profiles[profile]["tweets"] > 0:
                self.profiles[profile]["average_likes"] = self.profiles[profile]["likes"] / self.profiles[profile]["tweets"]
            else:
                self.profiles[profile]["average_likes"] = 0

        # Build up the metric encoder
        for profile in self.profiles:
            self.MetricEncoder.add_dataset(profile, (self.profiles[profile]["average_likes"],))
        
        self.MetricEncoder.set_axis_titles(["Profile", "Average Likes"])