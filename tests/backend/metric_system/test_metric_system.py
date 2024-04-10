import json
from unittest import TestCase
import unittest
from tests.backend.metric_system import test_metric_system_helper as helper
from bson import ObjectId
from pymongo import MongoClient
from backend.config import Config
from backend.encoders.tweet_encoder import Tweet
from backend.encoders.meta_encoder import MetaData
from backend.encoders.profile_encoder import Profile
from backend.crawler_sys import database as Database
from backend.config import Config
from backend.metric_system.build import build_metrics
from unittest import TestCase
from backend.crawler_sys.database import _update_tweet
from time import sleep
from datetime import datetime
import numpy as np

# import nltk

# nltk.download("stopwords")
# nltk.download("punkt")
# nltk.download("words")


class TestMetricSystem(TestCase):
    _init_flag = False
    _metrics = None

    # Initialize the database, if it doesn't exist
    # Add a couple tweets and a couple profiles
    def test_0_init_database(self):
        if self._init_flag:
            return

        Database.init_database("TestDB", True)
        sleep(0.5)
        collections = Database.db.list_collection_names()
        print(f"The database contains {len(collections)} collections.")
        self.assertEqual(len(collections), 9, "Database should contain 9 collections.")
        self._init_flag = True

        # Add a couple profiles using the helper
        helper_obj = helper.TestMetricSystemHelper()
        profile1 = helper_obj.ReturnProfile1()
        profile2 = helper_obj.ReturnProfile2()

        # Add three tweets for each profile
        tweet1 = helper_obj.ReturnP1Tweet1()
        tweet2 = helper_obj.ReturnP1Tweet2()
        tweet3 = helper_obj.ReturnP1Tweet3()
        tweet4 = helper_obj.ReturnP2Tweet1()
        tweet5 = helper_obj.ReturnP2Tweet2()
        tweet6 = helper_obj.ReturnP2Tweet3()

        # Insert the profiles and tweets into the database
        Database.upsert_twitter_profile(profile1)
        Database.upsert_twitter_profile(profile2)
        Database.upsert_tweet(tweet1)
        Database.upsert_tweet(tweet2)
        Database.upsert_tweet(tweet3)
        Database.upsert_tweet(tweet4)
        Database.upsert_tweet(tweet5)
        Database.upsert_tweet(tweet6)

        # Verify that each tweet and profile is there, one-by-one
        self.assertIsNotNone(Database.get_tweet_by_id("1111111001"))
        self.assertIsNotNone(Database.get_tweet_by_id("1111111002"))
        self.assertIsNotNone(Database.get_tweet_by_id("1111111003"))
        self.assertIsNotNone(Database.get_tweet_by_id("1111112001"))
        self.assertIsNotNone(Database.get_tweet_by_id("1111112002"))
        self.assertIsNotNone(Database.get_tweet_by_id("1111112003"))
        self.assertIsNotNone(Database.get_profile_by_username("1st_profile"))
        self.assertIsNotNone(Database.get_profile_by_username("2nd_profile"))

    # Call the build_metrics function and verify the the returned statistics are correct
    def test_1_build_metrics(self):
        Config.overwrite_db_name("TestDB")
        output_file = "ex_testing_metic_out.json"
        metric_json_str = build_metrics(output_file)
        TestMetricSystem._metrics = json.loads(metric_json_str)
        self.assertIsNotNone(TestMetricSystem._metrics)

    # def test_2_gen_likes_per_follower(self):

    #     statement = "likes_per_follower" in TestMetricSystem._metrics
    #     self.assertTrue("likes_per_follower" in TestMetricSystem._metrics)

    #     likes_per_follower = TestMetricSystem._metrics["likes_per_follower"]

    #     self.assertTrue("1234567890" in likes_per_follower)
    #     self.assertTrue("_global" in likes_per_follower)

    #     # compute the expected values and assert

    #     self.assertEqual(likes_per_follower["1234567890"], 0.5)


# main
if __name__ == "__main__":
    Config.init()
    try:
        unittest.main()
    finally:
        Database.client.close()
