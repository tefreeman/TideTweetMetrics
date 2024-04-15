from unittest import TestCase
import unittest
from bson import ObjectId
from pymongo import MongoClient
from backend.config import Config
from backend.encoders.tweet_encoder import Tweet
from backend.encoders.meta_encoder import MetaData
from backend.encoders.profile_encoder import Profile
from backend.crawler_sys import database as Database
from unittest import TestCase
from backend.crawler_sys.database import _update_tweet
from time import sleep


# Initialization test case
class TestDatabase(TestCase):
    _init_flag = False

    def test_0_init_database(self):
        if self._init_flag:
            return

        Database.init_database("TestDB", start_fresh=True)
        sleep(0.5)
        collections = Database.db.list_collection_names()
        print(f"The database contains {len(collections)} collections.")
        self.assertEqual(len(collections), 9, "Database should contain 9 collections.")
        self._init_flag = True

    # Insert tweet test case
    def test_1_upsert_tweets(self):
        curMD = MetaData()
        curMD.set_errors([])
        curMD.set_as_new()
        tweet = {
            "data": {
                "id": "1234567890",
                "text": "This is a tweet",
                "created_at": "2021-10-10T10:10:10.000Z",
                "author_id": "1234567890",
                "public_metrics": {
                    "retweet_count": 0,
                    "reply_count": 0,
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
        dbTweet = Database.db["tweets"].find_one({"data.id": "1234567890"})
        self.assertEqual(dbTweet["data"]["text"], "This is a tweet")

    # Find and update tweet test case
    def test_2_update_tweet(self):
        # Create a dummy tweet object
        curMD = MetaData()
        curMD.set_errors([])
        curMD.set_as_new()
        tweet = {
            "data": {
                "id": "1234567890",
                "text": "This is a tweet",
                "created_at": "2021-10-10T10:10:10.000Z",
                "author_id": "1234567890",
                "public_metrics": {
                    "retweet_count": 1,
                    "reply_count": 2,
                    "like_count": 3,
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
        # Call the _update_tweet() function
        _update_tweet(curTweet)

        original_tweet = Database.get_tweet_by_id("1234567890")
        update_id = original_tweet.get_meta_ref().get_update_id()
        updated_tweet = Database.db["tweet_updates"].find_one({"_id": update_id})

        # Assert that the tweet has been updated correctly
        self.assertEqual(updated_tweet["retweet_count"], 1)
        self.assertEqual(updated_tweet["reply_count"], 2)
        self.assertEqual(updated_tweet["like_count"], 3)

    # Find and delete tweet test case
    def test_3_find_delete(self):
        tweet = Database.db["tweets"].find_one({"data.id": "1234567890"})
        tweet_update = Database.db["tweet_updates"].find_one(
            {"imeta.oid": "1234567890"}
        )

        self.assertNotEqual(tweet, None)
        self.assertNotEqual(tweet_update, None)

        Database.db["tweets"].delete_one({"_id": tweet["_id"]})
        Database.db["tweet_updates"].delete_one({"_id": tweet_update["_id"]})

        tweet = Database.db["tweets"].find_one({"data.id": "1234567890"})
        tweet_update = Database.db["tweet_updates"].find_one(
            {"imeta.oid": "1234567890"}
        )

        self.assertEqual(tweet, None)
        self.assertEqual(tweet_update, None)

    # Insert profile test case
    def test_4_upsert_twitter_profile(self):
        curMD = MetaData()
        curMD.set_errors([])
        curMD.set_as_new()
        profile = {
            "username": "TestUser",
            "name": "Test User",
            "description": "This is a test user.",
            "public_metrics": {
                "followers_count": 0,
                "following_count": 0,
                "tweet_count": 0,
                "listed_count": 0,
            },
            "imeta": curMD.to_json_dict(),
        }
        curProfile = Profile(as_json=profile, ignore_required=True)
        Database.upsert_twitter_profile(curProfile)
        dbProfile = Database.db["profiles"].find_one({"username": "TestUser"})
        self.assertEqual(dbProfile["name"], "Test User")

    # Update profile test case
    def test_5_update_profile(self):
        curMD = MetaData()
        curMD.set_errors([])
        curMD.set_as_new()
        profile = {
            "username": "TestUser",
            "name": "Test User",
            "description": "This is a test user.",
            "public_metrics": {
                "followers_count": 1,
                "following_count": 2,
                "tweet_count": 3,
                "listed_count": 4,
            },
            "imeta": curMD.to_json_dict(),
        }
        curProfile = Profile(as_json=profile, ignore_required=True)
        Database.upsert_twitter_profile(curProfile)

        original_profile = Database.get_profile_by_username("TestUser")
        update_id = original_profile.get_meta_ref().get_update_id()
        updated_profile = Database.db["profile_updates"].find_one({"_id": update_id})

        self.assertEqual(updated_profile["followers_count"], 1)
        self.assertEqual(updated_profile["following_count"], 2)
        self.assertEqual(updated_profile["tweet_count"], 3)
        self.assertEqual(updated_profile["listed_count"], 4)

    # Find and delete profile test case
    def test_6_find_delete(self):
        profile = Database.db["profiles"].find_one({"username": "TestUser"})
        profile_update = Database.db["profile_updates"].find_one(
            {"imeta.oid": "TestUser"}
        )

        self.assertNotEqual(profile, None)
        self.assertNotEqual(profile_update, None)

        Database.db["profiles"].delete_one({"_id": profile["_id"]})
        Database.db["profile_updates"].delete_one({"_id": profile_update["_id"]})

        profile = Database.db["profiles"].find_one({"username": "TestUser"})
        profile_update = Database.db["profile_updates"].find_one(
            {"imeta.oid": "TestUser"}
        )

        self.assertEqual(profile, None)
        self.assertEqual(profile_update, None)


# Main function
if __name__ == "__main__":
    Config.init()
    try:
        unittest.main()
    finally:
        Database.client.close()
