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
    def setUp(self):

        if self._init_flag:
            return

        Database.init_database("TestDB", True)
        sleep(0.5)
        collections = Database.db.list_collection_names()
        print(f"The database contains {len(collections)} collections.")
        self.assertEqual(len(collections), 9, "Database should contain 9 collections.")
        self._init_flag = True

        # Add a couple profiles using the helper
        self.helper_obj = helper.TestMetricSystemHelper()
        self.profile1 = self.helper_obj.ReturnProfile1()
        self.profile2 = self.helper_obj.ReturnProfile2()

        # Add three tweets for each profile
        self.tweet1 = self.helper_obj.ReturnP1Tweet1()
        self.tweet2 = self.helper_obj.ReturnP1Tweet2()
        self.tweet3 = self.helper_obj.ReturnP1Tweet3()
        self.tweet4 = self.helper_obj.ReturnP2Tweet1()
        self.tweet5 = self.helper_obj.ReturnP2Tweet2()
        self.tweet6 = self.helper_obj.ReturnP2Tweet3()

        # Insert the profiles and tweets into the database
        Database.upsert_twitter_profile(self.profile1)
        Database.upsert_twitter_profile(self.profile2)
        Database.upsert_tweet(self.tweet1)
        Database.upsert_tweet(self.tweet2)
        Database.upsert_tweet(self.tweet3)
        Database.upsert_tweet(self.tweet4)
        Database.upsert_tweet(self.tweet5)
        Database.upsert_tweet(self.tweet6)

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
    def test_01_build_metrics(self):
        Config.overwrite_db_name("TestDB")
        output_file = "ex_testing_metric_out.json"
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

    def test_99_teardown(self):
        # Delete the specific tweets and profiles from the database
        Database.db["profiles"].delete_one({"username": self.profile1.get_username()})
        Database.db["profiles"].delete_one({"username": self.profile2.get_username()})
        Database.db["tweets"].delete_one({"data.id": self.tweet2.get_id()})
        Database.db["tweets"].delete_one({"data.id": self.tweet3.get_id()})
        Database.db["tweets"].delete_one({"data.id": self.tweet4.get_id()})
        Database.db["tweets"].delete_one({"data.id": self.tweet5.get_id()})
        Database.db["tweets"].delete_one({"data.id": self.tweet6.get_id()})
        Database.db["tweets"].delete_one({"data.id": self.tweet1.get_id()})


# main
if __name__ == "__main__":
    Config.init()
    try:
        unittest.main()
    finally:
        Database.client.close()
