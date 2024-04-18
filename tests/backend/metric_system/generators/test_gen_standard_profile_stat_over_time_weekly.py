from unittest import TestCase
import unittest
import json
from datetime import datetime, timedelta
import numpy as np

from tests.backend.metric_system.test_metric_system_helper import TestMetricSystemHelper

class TestStandardProfileStatOverTimeWeeklyGenerator(TestCase):
    
    def setUp(self):
        self.helper = TestMetricSystemHelper()
        with open("ex_testing_metric_out.json", "r") as file:
            self.data = json.load(file)

    def test_01_profile1(self):
        # output of the function
        generated_metrics = {
            "tweet_likes-mean-weekly": self.data["tweet_likes-mean-weekly"]["1st_profile"],
            "tweet_likes-sum-weekly": self.data["tweet_likes-sum-weekly"]["1st_profile"],
            "tweet_likes-median-weekly": self.data["tweet_likes-median-weekly"]["1st_profile"],
            "tweet_count-mean-weekly": self.data["tweet_count-mean-weekly"]["1st_profile"],
            "tweet_count-sum-weekly": self.data["tweet_count-sum-weekly"]["1st_profile"],
            "tweet_count-median-weekly": self.data["tweet_count-median-weekly"]["1st_profile"]
        }

        # expected ouput of the function
        calculated_metrics = {
            "tweet_likes-mean-weekly": [],
            "tweet_likes-sum-weekly": [],
            "tweet_likes-median-weekly": [],
            "tweet_count-mean-weekly": [],
            "tweet_count-sum-weekly": [],
            "tweet_count-median-weekly": []
        }
        tweets = [{"tweet": self.helper.ReturnP1Tweet1(),
                   "metrics": self.helper.ReturnP1T1Metrics()},
                  {"tweet": self.helper.ReturnP1Tweet2(),
                   "metrics": self.helper.ReturnP1T2Metrics()},
                  {"tweet": self.helper.ReturnP1Tweet3(),
                   "metrics": self.helper.ReturnP1T3Metrics()}]

        tweets_by_week = []
        latest_date = datetime.now()
        oldest_date = datetime.now() - timedelta(weeks=260)
        current_week_start = oldest_date
        while current_week_start < latest_date:
            current_week_end = current_week_start + timedelta(days=7)
            tweets_by_week.append([])
            for tweet in tweets:
                if tweet.get_post_date() >= current_week_start and tweet.get_post_date() < current_week_end:
                    tweets_by_week[-1].append(tweet)
                

        for week in tweets_by_week:
            if len(week) == 0:
                calculated_metrics["tweet_likes-mean-weekly"].append(0)
                calculated_metrics["tweet_likes-sum-weekly"].append(0)
                calculated_metrics["tweet_likes-median-weekly"].append(0)
                calculated_metrics["tweet_count-mean-weekly"].append(0)
                calculated_metrics["tweet_count-sum-weekly"].append(0)
                calculated_metrics["tweet_count-median-weekly"].append(0)
            else:
                calculated_metrics["tweet_likes-mean-weekly"].append(np.mean([x["metrics"][2] for x in week]))
                calculated_metrics["tweet_likes-sum-weekly"].append(np.sum([x["metrics"][2] for x in week]))
                calculated_metrics["tweet_likes-median-weekly"].append(np.median([x["metrics"][2] for x in week]))
                calculated_metrics["tweet_count-mean-weekly"].append(np.mean([1 for x in week]))
                calculated_metrics["tweet_count-sum-weekly"].append(np.sum([1 for x in week]))
                calculated_metrics["tweet_count-median-weekly"].append(np.median([1 for x in week]))
            
        # check for equality
        self.assertDictEqual(generated_metrics, calculated_metrics)

    def test_02_profile2(self):
        # output of the function
        generated_metrics = {
            "tweet_likes-mean-weekly": self.data["tweet_likes-mean-weekly"]["2nd_profile"],
            "tweet_likes-sum-weekly": self.data["tweet_likes-sum-weekly"]["2nd_profile"],
            "tweet_likes-median-weekly": self.data["tweet_likes-median-weekly"]["2nd_profile"],
            "tweet_count-mean-weekly": self.data["tweet_count-mean-weekly"]["2nd_profile"],
            "tweet_count-sum-weekly": self.data["tweet_count-sum-weekly"]["2nd_profile"],
            "tweet_count-median-weekly": self.data["tweet_count-median-weekly"]["2nd_profile"]
        }

        # expected ouput of the function
        calculated_metrics = {
            "tweet_likes-mean-weekly": [],
            "tweet_likes-sum-weekly": [],
            "tweet_likes-median-weekly": [],
            "tweet_count-mean-weekly": [],
            "tweet_count-sum-weekly": [],
            "tweet_count-median-weekly": []
        }
        tweets = [{"tweet": self.helper.ReturnP2Tweet1(),
                   "metrics": self.helper.ReturnP2T1Metrics()},
                  {"tweet": self.helper.ReturnP2Tweet2(),
                   "metrics": self.helper.ReturnP2T2Metrics()},
                  {"tweet": self.helper.ReturnP2Tweet3(),
                   "metrics": self.helper.ReturnP2T3Metrics()}]

        tweets_by_week = []
        latest_date = datetime.now()
        oldest_date = datetime.now() - timedelta(weeks=260)
        current_week_start = oldest_date
        while current_week_start < latest_date:
            current_week_end = current_week_start + timedelta(days=7)
            tweets_by_week.append([])
            for tweet in tweets:
                if tweet.get_post_date() >= current_week_start and tweet.get_post_date() < current_week_end:
                    tweets_by_week[-1].append(tweet)
                

        for week in tweets_by_week:
            if len(week) == 0:
                calculated_metrics["tweet_likes-mean-weekly"].append(0)
                calculated_metrics["tweet_likes-sum-weekly"].append(0)
                calculated_metrics["tweet_likes-median-weekly"].append(0)
                calculated_metrics["tweet_count-mean-weekly"].append(0)
                calculated_metrics["tweet_count-sum-weekly"].append(0)
                calculated_metrics["tweet_count-median-weekly"].append(0)
            else:
                calculated_metrics["tweet_likes-mean-weekly"].append(np.mean([x["metrics"][2] for x in week]))
                calculated_metrics["tweet_likes-sum-weekly"].append(np.sum([x["metrics"][2] for x in week]))
                calculated_metrics["tweet_likes-median-weekly"].append(np.median([x["metrics"][2] for x in week]))
                calculated_metrics["tweet_count-mean-weekly"].append(np.mean([1 for x in week]))
                calculated_metrics["tweet_count-sum-weekly"].append(np.sum([1 for x in week]))
                calculated_metrics["tweet_count-median-weekly"].append(np.median([1 for x in week]))
            
        # check for equality
        self.assertDictEqual(generated_metrics, calculated_metrics)
            
        # check for equality
        self.assertDictEqual(generated_metrics, calculated_metrics)

    def test_03_all(self):
        # output of the function
        generated_metrics = {
            "tweet_likes-mean-weekly": self.data["tweet_likes-mean-weekly"]["1st_profile"],
            "tweet_likes-sum-weekly": self.data["tweet_likes-sum-weekly"]["1st_profile"],
            "tweet_likes-median-weekly": self.data["tweet_likes-median-weekly"]["1st_profile"],
            "tweet_count-mean-weekly": self.data["tweet_count-mean-weekly"]["1st_profile"],
            "tweet_count-sum-weekly": self.data["tweet_count-sum-weekly"]["1st_profile"],
            "tweet_count-median-weekly": self.data["tweet_count-median-weekly"]["1st_profile"]
        }

        # expected ouput of the function
        calculated_metrics = {
            "tweet_likes-mean-weekly": [],
            "tweet_likes-sum-weekly": [],
            "tweet_likes-median-weekly": [],
            "tweet_count-mean-weekly": [],
            "tweet_count-sum-weekly": [],
            "tweet_count-median-weekly": []
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

        tweets_by_week = []
        latest_date = datetime.now()
        oldest_date = datetime.now() - timedelta(weeks=260)
        current_week_start = oldest_date
        while current_week_start < latest_date:
            current_week_end = current_week_start + timedelta(days=7)
            tweets_by_week.append([])
            for tweet in tweets:
                if tweet.get_post_date() >= current_week_start and tweet.get_post_date() < current_week_end:
                    tweets_by_week[-1].append(tweet)
                

        for week in tweets_by_week:
            if len(week) == 0:
                calculated_metrics["tweet_likes-mean-weekly"].append(0)
                calculated_metrics["tweet_likes-sum-weekly"].append(0)
                calculated_metrics["tweet_likes-median-weekly"].append(0)
                calculated_metrics["tweet_count-mean-weekly"].append(0)
                calculated_metrics["tweet_count-sum-weekly"].append(0)
                calculated_metrics["tweet_count-median-weekly"].append(0)
            else:
                calculated_metrics["tweet_likes-mean-weekly"].append(np.mean([x["metrics"][2] for x in week]))
                calculated_metrics["tweet_likes-sum-weekly"].append(np.sum([x["metrics"][2] for x in week]))
                calculated_metrics["tweet_likes-median-weekly"].append(np.median([x["metrics"][2] for x in week]))
                calculated_metrics["tweet_count-mean-weekly"].append(np.mean([1 for x in week]))
                calculated_metrics["tweet_count-sum-weekly"].append(np.sum([1 for x in week]))
                calculated_metrics["tweet_count-median-weekly"].append(np.median([1 for x in week]))
            
        # check for equality
        self.assertDictEqual(generated_metrics, calculated_metrics)

# main
if __name__ == "__main__":
    unittest.main()