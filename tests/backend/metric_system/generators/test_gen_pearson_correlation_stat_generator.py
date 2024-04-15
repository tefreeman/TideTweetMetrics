from unittest import TestCase
import unittest
import json
import numpy as np
from datetime import datetime

from tests.backend.metric_system.test_metric_system_helper import TestMetricSystemHelper

class TestPearsonCorrelationProfileStatGenerator(TestCase):
    
    def setUp(self):
        self.helper = TestMetricSystemHelper()
        with open("ex_testing_metric_out.json", "r") as file:
            self.data = json.load(file)

    def test_01_pearson(self):
        # output of the function
        generated_metrics = {}
        for metric in self.data.keys():
            if metric.startswith("pearson"):
                generated_metrics[metric] = self.data[metric]["_global"]

        # expected output of the function
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
        likes = [x["metrics"][2] for x in tweets]
        calculated_metrics = {
            "pearson-tweet_likes-vs-tweet_retweets": np.corrcoef(likes, [x["metrics"][0] for x in tweets])[0, 1],
            "pearson-tweet_likes-vs-tweet_replies": np.corrcoef(likes, [x["metrics"][1] for x in tweets])[0, 1],
            "pearson-tweet_likes-vs-tweet_quotes": np.corrcoef(likes, [x["metrics"][3] for x in tweets])[0, 1],
            "pearson-tweet_likes-vs-tweet_chars": np.corrcoef(likes, [len(x["tweet"].get_text()) for x in tweets])[0, 1],
            "pearson-tweet_likes-vs-tweet_words": np.corrcoef(likes, [len(x["tweet"].get_text().split()) for x in tweets])[0, 1],
            "pearson-tweet_likes-vs-post_date_hour": np.corrcoef(likes, [x["tweet"].get_post_date().hour for x in tweets])[0, 1],
            "pearson-tweet_likes-vs-post_date_day": np.corrcoef(likes, [x["tweet"].get_post_date().weekday() for x in tweets])[0, 1]
        }

        # check for equality
        self.assertDictEqual(generated_metrics, calculated_metrics)


# main
if __name__ == "__main__":
    unittest.main()