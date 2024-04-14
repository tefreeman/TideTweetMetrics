"""
metrics.py

This module defines classes and functions for calculating various metrics related to Twitter data.
It includes classes for encoding metrics, computing statistics based on tweets and profiles, and compiling metrics.

Classes:
    - MetricEncoder: Encodes metrics.
    - Metric: Base class for defining metrics and their calculations.
    - StatMetricCompiler: Compiles and processes metrics based on tweets and profiles.
    - AverageLikesMetric: Calculates the average number of likes per tweet.

Functions:
    - None

Usage:
    - Import this module into your project to access the defined classes and functions for Twitter metric calculations.

Example:
    - To calculate the average number of likes per tweet:
        ```
        test = StatMetricCompiler()
        test.AddMetric(AverageLikesMetric())
        result = test.Process()
        ```
"""

from pymongo import MongoClient
import sys
from pathlib import Path

# Hack for dev purposes only
current_script_path = Path(__file__).resolve()
tide_path = str(current_script_path.parents[2])
if tide_path not in sys.path:
    sys.path.append(tide_path + "/types/")

from backend.encoders.tweet_encoder import Tweet
from backend.encoders.profile_encoder import Profile


class MetricEncoder:
    pass


hostname = "73.58.28.154"
port = 27017
username = "Admin"
password = "We420?Z4!"

client = MongoClient(hostname, port, username=username, password=password)
db = client["twitter_v2"]


class Metric:
    """
    Base class for defining metrics and their calculations.
    """

    def __init__(self, update_over_tweets=False, update_over_profiles=False):
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
        """
        Must be implemented in derived classes.
        """
        raise NotImplementedError(
            "FinalUpdate method must be implemented in derived classes."
        )

    def GetEncoder(self):
        return self.MetricEncoder


class StatMetricCompiler:
    """
    Compiles and processes metrics based on tweets and profiles.
    """

    def __init__(self):
        self.tweetRowMetrics = []
        self.profileRowMetrics = []
        self.allMetrics = []

        self.tweets_cursor = db["tweets"].find({})
        self.profiles_cursor = db["profiles"].find({})

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
        for metric in self.allMetrics:
            metric.FinalUpdate(None, None)  # Placeholder for actual stats arguments
        return [metric.GetEncoder() for metric in self.allMetrics]


class AverageLikesMetric(Metric):
    """
    Calculates the average number of likes per tweet.
    """

    def __init__(self, accounts=None):
        super().__init__(update_over_tweets=True)
        self.total_likes = 0
        self.total_tweets = 0
        self.accounts = accounts

    def UpdateByTweet(self, tweet):
        self.total_likes += tweet.get_public_metrics()["like_count"]
        self.total_tweets += 1

    def tweetFilter(self, tweet: Tweet):
        if self.accounts == None:
            return True
        else:
            return tweet.get_author() in self.accounts

    def FinalUpdate(self, tweet_stats, profile_stats):
        if self.total_tweets > 0:
            self.average_likes = self.total_likes / self.total_tweets
        else:
            self.average_likes = 0

    def GetEncoder(self):
        return {"average_likes": self.average_likes}


test = StatMetricCompiler()
test.AddMetric(AverageLikesMetric())

result = test.Process()

print("done")
