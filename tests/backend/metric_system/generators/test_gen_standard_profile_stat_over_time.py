from unittest import TestCase
import unittest
import json
from datetime import datetime
import numpy as np

from tests.backend.metric_system.test_metric_system_helper import TestMetricSystemHelper

class TestStandardProfileStatOverTimeGenerator(TestCase):
    
    def setUp(self):
        self.helper = TestMetricSystemHelper()
        with open("ex_testing_metric_out.json", "r") as file:
            self.data = json.load(file)

    def test_01_profile1(self):
        # output of the function
        generated_metrics = {
            "tweet_likes-mean-yearly": self.data["tweet_likes-mean-yearly"]["1st_profile"],
            "tweet_likes-sum-yearly": self.data["tweet_likes-sum-yearly"]["1st_profile"],
            "tweet_likes-median-yearly": self.data["tweet_likes-median-yearly"]["1st_profile"],
            "tweet_count-mean-yearly": self.data["tweet_count-mean-yearly"]["1st_profile"],
            "tweet_count-sum-yearly": self.data["tweet_count-sum-yearly"]["1st_profile"],
            "tweet_count-median-yearly": self.data["tweet_count-median-yearly"]["1st_profile"]
        }

        # expected ouput of the function
        calculated_metrics = {
            "tweet_likes-mean-yearly": [],
            "tweet_likes-sum-yearly": [],
            "tweet_likes-median-yearly": [],
            "tweet_count-mean-yearly": [],
            "tweet_count-sum-yearly": [],
            "tweet_count-median-yearly": []
        }
        tweets = [{"tweet": self.helper.ReturnP1Tweet1(),
                   "metrics": self.helper.ReturnP1T1Metrics()},
                  {"tweet": self.helper.ReturnP1Tweet2(),
                   "metrics": self.helper.ReturnP1T2Metrics()},
                  {"tweet": self.helper.ReturnP1Tweet3(),
                   "metrics": self.helper.ReturnP1T3Metrics()}]
        tweets_by_year = {}
        for tweet in tweets:
            year = tweet["tweet"].get_post_date().year
            if year not in tweets_by_year:
                tweets_by_year[year] = [tweet]
            else:
                tweets_by_year[year].append(tweet)
        current_year = datetime.now().year
        for year in range(current_year - 9, current_year):
            if year not in tweets_by_year:
                calculated_metrics["tweet_likes-mean-yearly"].append([year, 0])
                calculated_metrics["tweet_likes-sum-yearly"].append([year, 0])
                calculated_metrics["tweet_likes-median-yearly"].append([year, 0])
                calculated_metrics["tweet_count-mean-yearly"].append([year, 0])
                calculated_metrics["tweet_count-sum-yearly"].append([year, 0])
                calculated_metrics["tweet_count-median-yearly"].append([year, 0])
            else:
                calculated_metrics["tweet_likes-mean-yearly"].append([year, np.mean([x["metrics"][2] for x in tweets_by_year[year]])])
                calculated_metrics["tweet_likes-sum-yearly"].append([year, np.sum([x["metrics"][2] for x in tweets_by_year[year]])])
                calculated_metrics["tweet_likes-median-yearly"].append([year, np.median([x["metrics"][2] for x in tweets_by_year[year]])])
                calculated_metrics["tweet_count-mean-yearly"].append([year, np.mean([1 for x in tweets_by_year[year]])])
                calculated_metrics["tweet_count-sum-yearly"].append([year, np.sum([1 for x in tweets_by_year[year]])])
                calculated_metrics["tweet_count-median-yearly"].append([year, np.median([1 for x in tweets_by_year[year]])])
            
        # check for equality
        self.assertDictEqual(generated_metrics, calculated_metrics)

    def test_02_profile2(self):
        # output of the function
        generated_metrics = {
            "tweet_likes-mean-yearly": self.data["tweet_likes-mean-yearly"]["2nd_profile"],
            "tweet_likes-sum-yearly": self.data["tweet_likes-sum-yearly"]["2nd_profile"],
            "tweet_likes-median-yearly": self.data["tweet_likes-median-yearly"]["2nd_profile"],
            "tweet_count-mean-yearly": self.data["tweet_count-mean-yearly"]["2nd_profile"],
            "tweet_count-sum-yearly": self.data["tweet_count-sum-yearly"]["2nd_profile"],
            "tweet_count-median-yearly": self.data["tweet_count-median-yearly"]["2nd_profile"]
        }

        # expected ouput of the function
        calculated_metrics = {
            "tweet_likes-mean-yearly": [],
            "tweet_likes-sum-yearly": [],
            "tweet_likes-median-yearly": [],
            "tweet_count-mean-yearly": [],
            "tweet_count-sum-yearly": [],
            "tweet_count-median-yearly": []
        }
        tweets = [{"tweet": self.helper.ReturnP2Tweet1(),
                   "metrics": self.helper.ReturnP2T1Metrics()},
                  {"tweet": self.helper.ReturnP2Tweet2(),
                   "metrics": self.helper.ReturnP2T2Metrics()},
                  {"tweet": self.helper.ReturnP2Tweet3(),
                   "metrics": self.helper.ReturnP2T3Metrics()}]
        tweets_by_year = {}
        for tweet in tweets:
            year = tweet["tweet"].get_post_date().year
            if year not in tweets_by_year:
                tweets_by_year[year] = [tweet]
            else:
                tweets_by_year[year].append(tweet)
        current_year = datetime.now().year
        for year in range(current_year - 9, current_year):
            if year not in tweets_by_year:
                calculated_metrics["tweet_likes-mean-yearly"].append([year, 0])
                calculated_metrics["tweet_likes-sum-yearly"].append([year, 0])
                calculated_metrics["tweet_likes-median-yearly"].append([year, 0])
                calculated_metrics["tweet_count-mean-yearly"].append([year, 0])
                calculated_metrics["tweet_count-sum-yearly"].append([year, 0])
                calculated_metrics["tweet_count-median-yearly"].append([year, 0])
            else:
                calculated_metrics["tweet_likes-mean-yearly"].append([year, np.mean([x["metrics"][2] for x in tweets_by_year[year]])])
                calculated_metrics["tweet_likes-sum-yearly"].append([year, np.sum([x["metrics"][2] for x in tweets_by_year[year]])])
                calculated_metrics["tweet_likes-median-yearly"].append([year, np.median([x["metrics"][2] for x in tweets_by_year[year]])])
                calculated_metrics["tweet_count-mean-yearly"].append([year, np.mean([1 for x in tweets_by_year[year]])])
                calculated_metrics["tweet_count-sum-yearly"].append([year, np.sum([1 for x in tweets_by_year[year]])])
                calculated_metrics["tweet_count-median-yearly"].append([year, np.median([1 for x in tweets_by_year[year]])])
            
        # check for equality
        self.assertDictEqual(generated_metrics, calculated_metrics)

    def test_03_all(self):
        # output of the function
        generated_metrics = {
            "tweet_likes-mean-yearly": self.data["tweet_likes-mean-yearly"]["_global"],
            "tweet_likes-sum-yearly": self.data["tweet_likes-sum-yearly"]["_global"],
            "tweet_likes-median-yearly": self.data["tweet_likes-median-yearly"]["_global"],
            "tweet_count-mean-yearly": self.data["tweet_count-mean-yearly"]["_global"],
            "tweet_count-sum-yearly": self.data["tweet_count-sum-yearly"]["_global"],
            "tweet_count-median-yearly": self.data["tweet_count-median-yearly"]["_global"]
        }

        # expected ouput of the function
        calculated_metrics = {
            "tweet_likes-mean-yearly": [],
            "tweet_likes-sum-yearly": [],
            "tweet_likes-median-yearly": [],
            "tweet_count-mean-yearly": [],
            "tweet_count-sum-yearly": [],
            "tweet_count-median-yearly": []
        }
        tweets = [{"tweet": self.helper.ReturnP1Tweet1(),
                   "metrics": self.helper.ReturnP1T1Metrics()},
                  {"tweet": self.helper.ReturnP1Tweet2(),
                   "metrics": self.helper.ReturnP1T2Metrics()},
                  {"tweet": self.helper.ReturnP1Tweet3(),
                   "metrics": self.helper.ReturnP1T3Metrics()},
                  {"tweet": self.helper.ReturnP2Tweet1(),
                   "metrics": self.helper.ReturnP2T1Metrics()},
                  {"tweet": self.helper.ReturnP2Tweet2(),
                   "metrics": self.helper.ReturnP2T2Metrics()},
                  {"tweet": self.helper.ReturnP2Tweet3(),
                   "metrics": self.helper.ReturnP2T3Metrics()}]
        tweets_by_year = {}
        for tweet in tweets:
            year = tweet["tweet"].get_post_date().year
            if year not in tweets_by_year:
                tweets_by_year[year] = [tweet]
            else:
                tweets_by_year[year].append(tweet)
        current_year = datetime.now().year
        for year in range(current_year - 9, current_year):
            if year not in tweets_by_year:
                calculated_metrics["tweet_likes-mean-yearly"].append([year, 0])
                calculated_metrics["tweet_likes-sum-yearly"].append([year, 0])
                calculated_metrics["tweet_likes-median-yearly"].append([year, 0])
                calculated_metrics["tweet_count-mean-yearly"].append([year, 0])
                calculated_metrics["tweet_count-sum-yearly"].append([year, 0])
                calculated_metrics["tweet_count-median-yearly"].append([year, 0])
            else:
                calculated_metrics["tweet_likes-mean-yearly"].append([year, np.mean([x["metrics"][2] for x in tweets_by_year[year]])])
                calculated_metrics["tweet_likes-sum-yearly"].append([year, np.sum([x["metrics"][2] for x in tweets_by_year[year]])])
                calculated_metrics["tweet_likes-median-yearly"].append([year, np.median([x["metrics"][2] for x in tweets_by_year[year]])])
                calculated_metrics["tweet_count-mean-yearly"].append([year, np.mean([1 for x in tweets_by_year[year]])])
                calculated_metrics["tweet_count-sum-yearly"].append([year, np.sum([1 for x in tweets_by_year[year]])])
                calculated_metrics["tweet_count-median-yearly"].append([year, np.median([1 for x in tweets_by_year[year]])])
            
        # check for equality
        self.assertDictEqual(generated_metrics, calculated_metrics)

# main
if __name__ == "__main__":
    unittest.main()