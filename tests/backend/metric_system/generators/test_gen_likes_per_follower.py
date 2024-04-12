from unittest import TestCase
import unittest
import json

from tests.backend.metric_system.test_metric_system_helper import TestMetricSystemHelper

class TestGenLikesPerFollower(TestCase):
    
    def setUp(self):
        self.helper = TestMetricSystemHelper()
        with open("ex_testing_metric_out.json", "r") as file:
            self.data = json.load(file)

    # TODO: discuss how we want to retrieve tweet_count and like_count
    def test_01_profile1(self):
        # output of the function
        generated_metric = self.data["likes_per_follower"]["1st_profile"]
        # expected output of the function
        [followers, following, tweets, likes] = self.helper.ReturnProfile1Metrics()
        calculated_metric = likes / tweets / followers
        self.assertAlmostEqual(generated_metric, calculated_metric)

# main
if __name__ == "__main__":
    unittest.main()
