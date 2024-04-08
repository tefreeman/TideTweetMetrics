from unittest import TestCase
import unittest
from pymongo import MongoClient
from backend.config import Config
from backend.encoders.tweet_encoder import Tweet
from backend.encoders.meta_encoder import MetaData
from backend.encoders.profile_encoder import Profile
from backend.crawler_sys import database as Database
from unittest import TestCase
from backend.crawler_sys.database import _update_tweet


# def init_database(name=None):
#     global client, db
#     client = MongoClient(
#         Config.db_host(),
#         port=Config.db_port(),
#         username=Config.db_user(),
#         password=Config.db_password(),
#     )
#     db_name = Config.db_name() if name == None else name
#     db = client[db_name]

#     collection_names = db.list_collection_names()
#     if len(collection_names) == 0:
#         _init_collections()


# def _init_collections():
#     old_db = client["twitter"]

#     db.create_collection("crawl_list")
#     crawl_list = old_db["crawl_list"].find({})
#     for user in crawl_list:
#         db["crawl_list"].insert_one(user)

#     db.create_collection("mirrors")
#     mirror_list = old_db["mirrors"].find({})
#     for mirror in mirror_list:
#         mirror["up_events"] = 0
#         mirror["down_events"] = 0
#         mirror["is_working"] = True
#         db["mirrors"].insert_one(mirror)

#     db.create_collection("profiles")
#     db.create_collection("tweets")

#     db["tweets"].create_index([("data.id", 1)], unique=True)
#     db["profiles"].create_index([("username", 1)], unique=True)

#     db.create_collection(
#         "profile_updates",
#         timeseries={
#             "timeField": "timestamp",
#             "metaField": "imeta",
#             "granularity": "hours",
#         },
#     )
#     db.create_collection(
#         "tweet_updates",
#         timeseries={
#             "timeField": "timestamp",
#             "metaField": "imeta",
#             "granularity": "hours",
#         },
#     )


# def get_crawl_list() -> list[str]:
#     collection = db["crawl_list"]
#     usernames = set()
#     for user in collection.find():
#         if not ("username" in user):
#             raise Exception("username not inside user in crawl_list collection")

#         usernames.add(user["username"])

#     return list(usernames)


# Initialization test case
class TestDatabase(TestCase):
    _init_flag = False

    def test_0_init_database(self):
        if self._init_flag:
            return

        Database.init_database("TestDB")
        collections = Database.db.list_collection_names()
        print(f"The database contains {len(collections)} collections.")
        self.assertEqual(len(collections), 9, "Database should contain 9 collections.")
        self._init_flag = True

    # Insert tweet test case
    def test_1_insert_tweet(self):
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
        updated_tweet = _update_tweet(curTweet)

        # Assert that the tweet has been updated correctly
        self.assertEqual(updated_tweet["data"]["retweet_count"], 1)
        self.assertEqual(updated_tweet["data"]["reply_count"], 2)
        self.assertEqual(updated_tweet["data"]["like_count"], 3)

    # Find and delete test case
    # def test_3_find_delete(self):
    #     tweet = Database.db["tweets"].find_one({"data.id": "1234567890"})
    #     tweet_update = Database.db["tweet_updates"].find_one(
    #         {"imeta.oid": "1234567890"}
    #     )

    #     self.assertNotEqual(tweet, None)
    #     self.assertNotEqual(tweet_update, None)

    #     Database.db["tweets"].delete_one({"_id": tweet["_id"]})
    #     Database.db["tweet_updates"].delete_one({"_id": tweet_update["_id"]})

    #     tweet = Database.db["tweets"].find_one({"data.id": "1234567890"})
    #     tweet_update = Database.db["tweet_updates"].find_one(
    #         {"imeta.oid": "1234567890"}
    #     )

    #     self.assertEqual(tweet, None)
    #     self.assertEqual(tweet_update, None)


"""
Create a tweet using the encoder. Set username, set contents, set... Then upload it.
"""


# Main function
if __name__ == "__main__":
    Config.init()
    unittest.main()
