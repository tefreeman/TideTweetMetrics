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


class TestMetricSystem(TestCase):
    _init_flag = False

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
                "text": "1st Tweet for test_metric_system",
                "created_at": "2021-10-10T10:10:10.000Z",
                "author_id": "1234567890",
                "public_metrics": {
                    "retweet_count": 10,
                    "reply_count": 5,
                    "like_count": 0,
                },
                "entities": {
                    "mentions": [],
                    "urls": [],
                    "hashtags": [],
                    "annotations": [],
                },
                "attachments": {"media_keys": []},
            },
            "includes": {},
            "imeta": curMD.to_json_dict(),
        }
        curTweet = Tweet(as_json=tweet, ignore_required=True)
        Database.upsert_tweets([curTweet])
        dbTweet = Database.db["tweets"].find_one({"data.id": "1111111001"})
        self.assertEqual(dbTweet["data"]["text"], "1st Tweet for test_metric_system")

        # Add second tweet
        curMD = MetaData()
        curMD.set_errors([])
        curMD.set_as_new()
        tweet = {
            "data": {
                "id": "1111111002",
                "text": "2nd Tweet for test_metric_system",
                "created_at": "2021-10-10T10:10:10.000Z",
                "author_id": "1234567890",
                "public_metrics": {
                    "retweet_count": 20,
                    "reply_count": 10,
                    "like_count": 5,
                },
                "entities": {
                    "mentions": [],
                    "urls": [],
                    "hashtags": [],
                    "annotations": [],
                },
                "attachments": {"media_keys": []},
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
            "username": "test_profile_1",
            "name": "Test Profile 1",
            "id": "1111112001",
            "created_at": "2021-10-10T10:10:10.000Z",
            "public_metrics": {
                "followers_count": 10,
                "following_count": 5,
                "tweet_count": 0,
                "listed_count": 0,
            },
            "imeta": curMD.to_json_dict(),
        }
        curProfile = Profile(as_json=profile, ignore_required=True)
        Database.upsert_twitter_profile(curProfile)
        dbProfile = Database.db["profiles"].find_one({"username": "test_profile_1"})
        self.assertEqual(dbProfile["name"], "Test Profile 1")

        # Add second profile
        curMD = MetaData()
        curMD.set_errors([])
        curMD.set_as_new()
        profile = {
            "username": "test_profile_2",
            "name": "Test Profile 2",
            "id": "1111112002",
            "created_at": "2021-10-10T10:10:10.000Z",
            "public_metrics": {
                "followers_count": 20,
                "following_count": 10,
                "tweet_count": 5,
                "listed_count": 5,
            },
            "imeta": curMD.to_json_dict(),
        }
        curProfile = Profile(as_json=profile, ignore_required=True)
        Database.upsert_twitter_profile(curProfile)
        dbProfile = Database.db["profiles"].find_one({"username": "test_profile_2"})
        self.assertEqual(dbProfile["name"], "Test Profile 2")

    # Call the build_metrics function and verify the the returned statistics are correct
    def test_1_build_metrics(self):
        Config.overwrite_db_name("TestDB")
        output_file = ""
        metrics = build_metrics(output_file)
        self.assertIsNotNone(metrics)
        print(metrics)

    # Delete the tweets and profiles that we created
    def test_9_delete_tweets_profiles(self):
        # Delete the first tweet
        Database.db["tweets"].delete_one({"data.id": "1111111001"})
        dbTweet = Database.db["tweets"].find_one({"data.id": "1111111001"})
        self.assertIsNone(dbTweet)

        # Delete the second tweet
        Database.db["tweets"].delete_one({"data.id": "1111111002"})
        dbTweet = Database.db["tweets"].find_one({"data.id": "1111111002"})
        self.assertIsNone(dbTweet)

        # Delete the first profile
        Database.db["profiles"].delete_one({"username": "test_profile_1"})
        dbProfile = Database.db["profiles"].find_one({"username": "test_profile_1"})
        self.assertIsNone(dbProfile)

        # Delete the second profile
        Database.db["profiles"].delete_one({"username": "test_profile_2"})
        dbProfile = Database.db["profiles"].find_one({"username": "test_profile_2"})
        self.assertIsNone(dbProfile)


# main
if __name__ == "__main__":
    Config.init()
    try:
        unittest.main()
    finally:
        Database.client.close()
