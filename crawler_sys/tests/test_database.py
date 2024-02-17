import unittest
from unittest.mock import patch, MagicMock
from bson import ObjectId
import database as Database
from encoders.tweet_encoder import Tweet
from encoders.meta_encoder import MetaData
from config import Config


class TestDatabase(unittest.TestCase):
    def test_init_database(self):
        # See if a new database is created (if we have a correct number of collections)
        Config.init()
        Database.init_database("Test_DB")
        if Database.db != None:
            # Assuming 'db_name' is the name of your database
            collections = Database.db.list_collection_names()
            print(f"The database contains {len(collections)} collections.")
            self.assertEqual(
                len(collections), 9, "Database should contain 9 collections."
            )

    ## insert tweet
    def test_insert_tweet(self):
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

    ## delete tweet

    ## insert profile

    ## delete profile

    # def tearDown(self):
    #     Database.client.drop_database("Test_DB")


if __name__ == "__main__":
    unittest.main()
