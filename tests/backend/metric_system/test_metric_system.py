import json
from unittest import TestCase
import unittest
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

        # Add first tweet
        curMD = MetaData()
        curMD.set_errors([])
        curMD.set_as_new()
        tweet = {
            "data": {
                "id": "1111111001",
                "text": "1st Tweet for test_metric_system. This is a test tweet for students. I have to keep typing so that the system finds",
                "created_at": datetime.now(),
                "author_id": "1234567890",
                "public_metrics": {
                    "retweet_count": 10,
                    "reply_count": 5,
                    "like_count": 2,
                    "quote_count": 2
                },
                "entities": {
                    "mentions": [],
                    "urls": [],
                    "hashtags": [],
                    "cashtags": [],
                    "annotations": [],
                },
                "attachments": {
                    "photos": [],
                    "videos": [],
                    "cards": [],
                    },
                "referenced_tweet": {}
            },
            "includes": {},
            "imeta": curMD.to_json_dict(),
        }
        curTweet = Tweet(as_json=tweet, ignore_required=True)
        Database.upsert_tweets([curTweet])
        dbTweet = Database.db["tweets"].find_one({"data.id": "1111111001"})
        self.assertEqual(dbTweet["data"]["id"], "1111111001")

        # Add second tweet
        curMD = MetaData()
        curMD.set_errors([])
        curMD.set_as_new()
        tweet = {
            "data": {
                "id": "1111111002",
                "text": "2nd Tweet for test_metric_system",
                "created_at": datetime.now(),
                "author_id": "1234567890",
                "public_metrics": {
                    "retweet_count": 30,
                    "reply_count": 6,
                    "like_count": 3,
                    "quote_count": 1
                },
                "entities": {
                    "mentions": [""],
                    "urls": [""],
                    "hashtags": [""],
                    "cashtags": [""],
                    "annotations": [""],
                },
                "attachments": {
                    "photos": [""],
                    "videos": [""],
                    "cards": [""],},
                "referenced_tweet": {}
            },
            "includes": {},
            "imeta": curMD.to_json_dict(),
        }
        curTweet = Tweet(as_json=tweet, ignore_required=True)
        Database.upsert_tweets([curTweet])
        dbTweet = Database.db["tweets"].find_one({"data.id": "1111111002"})
        self.assertEqual(dbTweet["data"]["text"], "2nd Tweet for test_metric_system")

        # Add first profile
        curMD = MetaData()
        curMD.set_errors([])
        curMD.set_as_new()
        profile = {
            "username": "1234567890",
            "name": "Test Profile 1",
            "created_at": datetime.now(),
            "description": "Test Profile 1 Description",
            "location": "Test Profile 1 Location",
            "verified": False,
            "public_metrics": {
                "followers_count": 10,
                "following_count": 5,
                "tweet_count": 3,
                "like_count": 3,
            },
            "profile_image_url": "https://test_profile_1.com",
            "url": "https://test_profile_1.com",
            "imeta": curMD.to_json_dict(),
        }
        curProfile = Profile(as_json=profile, ignore_required=True)
        Database.upsert_twitter_profile(curProfile)
        dbProfile = Database.db["profiles"].find_one({"username": "1234567890"})
        self.assertEqual(dbProfile["name"], "Test Profile 1")

       

    # Call the build_metrics function and verify the the returned statistics are correct
    def test_1_build_metrics(self):
        Config.overwrite_db_name("TestDB")
        output_file = "ex_testing_metic_out.json"
        metric_json_str = build_metrics(output_file)
        TestMetricSystem._metrics = json.loads(metric_json_str)
        self.assertIsNotNone(TestMetricSystem._metrics)


    def test_2_gen_likes_per_follower(self):
        
        statement = "likes_per_follower" in TestMetricSystem._metrics
        self.assertTrue("likes_per_follower" in TestMetricSystem._metrics)
        
        likes_per_follower = TestMetricSystem._metrics["likes_per_follower"]
        
        self.assertTrue("1234567890" in likes_per_follower)
        self.assertTrue("_global" in likes_per_follower)
        
        # compute the expected values and assert
        
        self.assertEqual(likes_per_follower["1234567890"], 0.5)
        
# main
if __name__ == "__main__":
    Config.init()
    try:
        unittest.main()
    finally:
        Database.client.close()
