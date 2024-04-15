from unittest import TestCase
import unittest
import json

from tests.backend.metric_system.test_metric_system_helper import TestMetricSystemHelper

class TestGenLikesPerFollower(TestCase):
    
    def setUp(self):
        self.helper = TestMetricSystemHelper()
        with open("ex_testing_metric_out.json", "r") as file:
            self.data = json.load(file)

    def test_01_profile1(self):
        # output of the function
        generated_metric = self.data["likes_per_follower"]["1st_profile"]
        # expected output of the function
        [pFollowers, pFollowing, pTweets, pLikes] = self.helper.ReturnProfile1Metrics()
        tweets = 3
        likes = self.helper.ReturnP1T1Metrics()[2] + self.helper.ReturnP1T2Metrics()[2] + self.helper.ReturnP1T3Metrics()[2]
        calculated_metric = likes / tweets / pFollowers
        self.assertAlmostEqual(generated_metric, calculated_metric)

    def test_02_profile2(self):
        # output of the function
        generated_metric = self.data["likes_per_follower"]["2nd_profile"]
        # expected output of the function
        [pFollowers, pFollowing, pTweets, pLikes] = self.helper.ReturnProfile2Metrics()
        tweets = 3
        likes = self.helper.ReturnP2T1Metrics()[2] + self.helper.ReturnP2T2Metrics()[2] + self.helper.ReturnP2T3Metrics()[2]
        calculated_metric = likes / tweets / pFollowers
        self.assertAlmostEqual(generated_metric, calculated_metric)

# main
if __name__ == "__main__":
    unittest.main()
