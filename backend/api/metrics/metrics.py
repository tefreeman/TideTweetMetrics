
from pymongo import MongoClient
import sys
from pathlib import Path

import sys

# ** THIS IS A HACK FOR DEV PURPOSES ONLY ** 


# __file__ gives the path to the current script.
# Using Path(__file__).resolve() ensures we get the absolute path,
# which is useful if the script is run using a relative path.
current_script_path = Path(__file__).resolve()

# Get the 'tide' directory path by going up two levels from the current script.
# .parents[1] goes up two directories from the current script's location.
tide_path = str(current_script_path.parents[2])

# Add the 'tide' directory to sys.path if it's not already there
if tide_path not in sys.path:
    sys.path.append(tide_path + "/types/")
    
from tweet_encoder import Tweet
from profile_encoder import Profile

class   MetricEncoder():
    pass


hostname =  "73.58.28.154"
port = 27017
username = "Admin"
password = "We420?Z4!"

client = MongoClient(hostname, port, username=username, password=password)
db = client['twitter_v2']


class Metric:
    def __init__(self, update_over_tweets = False, update_over_profiles = False):
        self.MetricEncoder = MetricEncoder()
        self._update_over_tweets = update_over_tweets
        self._update_over_profiles = update_over_profiles
    
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


class StatMetricCompiler:
    def __init__(self):
        self.tweetRowMetrics: list[Metric] = []
        self.profileRowMetrics:list[Metric] = []
        self.allMetrics: list[Metric] = []

        self.tweets_cursor = db['tweets'].find({})
        self.profiles_cursor = db['profiles'].find({})
        
    def AddMetric(self, metric: Metric):
        self.allMetrics.append(metric)
        
        if metric._update_over_tweets:
            self.tweetRowMetrics.append(metric)
        
        if metric._update_over_profiles:
            self.profileRowMetrics.append(metric)
            

    def Process(self):
        for tweet in self.tweets_cursor:
            tweet_obj = Tweet(as_json=tweet)
            for metric in self.tweetRowMetrics:
                if metric.tweetFilter(tweet_obj):
                    metric.UpdateByTweet(tweet_obj)
        for profile in self.profiles_cursor:
            for metric in self.profileRowMetrics:
                if metric.ProfileFilter(profile):
                    metric.UpdateByProfile(profile)
        # Finalize metrics after processing all data
        for metric in self.allMetrics:
            metric.FinalUpdate(None, None)  # Placeholder for actual stats arguments
        return [metric.GetEncoder() for metric in self.allMetrics] # update this with toJson method
    
    
    
    
class AverageLikesMetric(Metric):
    def __init__(self, accounts = None):
        # Initialize with update_over_tweets=True since we're calculating average likes for tweets
        super().__init__(update_over_tweets=True)
        self.total_likes = 0
        self.total_tweets = 0
        self.accounts = accounts

    def UpdateByTweet(self, tweet):
        # Assuming 'tweet' is a dictionary that contains a 'likes' key
        self.total_likes += tweet.get_public_metrics()["like_count"]
        self.total_tweets += 1

    def tweetFilter(self, tweet: Tweet):
        if self.accounts == None:
            return True
        else:
            return tweet.get_author() in self.accounts
        
    def FinalUpdate(self, tweet_stats, profile_stats):
        # Calculate the average likes per tweet
        if self.total_tweets > 0:
            self.average_likes = self.total_likes / self.total_tweets
        else:
            self.average_likes = 0

    def GetEncoder(self):
        # Return the average likes information
        # This method needs to be adapted if you want to return a more complex structure
        return {'average_likes': self.average_likes}


test = StatMetricCompiler()
test.AddMetric(AverageLikesMetric())

result = test.Process()

print("done")