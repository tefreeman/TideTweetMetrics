import unittest
from unittest.mock import patch, MagicMock
from bson import ObjectId
import database


class TestDatabaseOperations(unittest.TestCase):
    def setUp(self):
        self.config_patch = patch("database.Config")
        self.mongo_client_patch = patch("database.MongoClient")

        self.mocked_config = self.config_patch.start()
        self.mocked_mongo_client = self.mongo_client_patch.start()

        # Setup mock returns for Config
        self.mocked_config.db_host.return_value = "localhost"
        self.mocked_config.db_port.return_value = 27017
        self.mocked_config.db_user.return_value = "user"
        self.mocked_config.db_password.return_value = "pass"
        self.mocked_config.db_name.return_value = "testdb"
        self.mocked_config.get_profile_min_update_time.return_value = 7

        # Setup Mock DB
        self.mock_db = MagicMock()
        self.mocked_mongo_client.return_value.__getitem__.side_effect = (
            lambda name: self.mock_db
        )

        # Ensure db and client are initialized correctly
        database.client = self.mocked_mongo_client.return_value
        database.db = self.mock_db

    def tearDown(self):
        self.config_patch.stop()
        self.mongo_client_patch.stop()

    def test_init_database(self):
        database.init_database()
        self.mocked_mongo_client.assert_called_once_with(
            "localhost", port=27017, username="user", password="pass"
        )
        self.mocked_config.db_name.assert_called_once()
        self.mock_db.list_collection_names.assert_called_once()

    def test_init_collections(self):
        self.mock_db.list_collection_names.return_value = []
        database._init_collections()
        self.mock_db.create_collection.assert_any_call("crawl_list")
        # Further checks can be added for each collection initialization

    def test_get_crawl_list(self):
        self.mock_db["crawl_list"].find.return_value = [
            {"username": "user1"},
            {"username": "user2"},
        ]
        result = database.get_crawl_list()
        self.assertCountEqual(result, ["user1", "user2"])  # Ignores order

    def test_add_crawl_summary(self):
        summary = {"key": "value"}
        database.add_crawl_summary(summary)
        self.mock_db["crawl_summaries"].insert_one.assert_called_once_with(summary)

    @patch("database.datetime")
    def test_upsert_twitter_profile_new(self, mock_datetime):
        now = mock_datetime.datetime.now.return_value

        profile = MagicMock()
        profile.get_username.return_value = "new_user"
        profile.to_json_dict.return_value = {"username": "new_user"}
        profile.get_meta_ref.return_value.set_as_new.return_value = None

        # Mock the return value for find_one to include 'imeta'
        self.mock_db["profiles"].find_one.return_value = {
            "username": "new_user",
            "imeta": {
                "uid": str(ObjectId())
            },  # Ensure this matches the expected format in your actual function
        }

        database.upsert_twitter_profile(profile)
        self.mock_db["profiles"].insert_one.assert_called_with({"username": "new_user"})

    @patch("database.datetime")
    def test_upsert_tweets(self, mock_datetime):
        now = mock_datetime.datetime.now.return_value
        tweet = MagicMock()
        tweet.get_id.return_value = "123"
        # Ensure to_json_dict is set to return the expected value
        tweet.to_json_dict.return_value = {"data": {"id": "123", "text": "Test tweet"}}

        # This line simulates the upsert operation that involves to_json_dict
        database.upsert_tweets([tweet])

        # Check that to_json_dict was called as part of the operation
        tweet.to_json_dict.assert_called_once()
        self.mock_db["tweets"].insert_one.assert_called_with(
            tweet.to_json_dict.return_value
        )

    def test_get_mirrors(self):
        self.mock_db["mirrors"].find.return_value = [
            {
                "url": "http://mirror1.com",
                "is_working": True,
                "up_events": 0,
                "down_events": 0,
            }
        ]
        result = database.get_mirrors()
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["url"], "http://mirror1.com")

    def test_save_mirror(self):
        mirror = {
            "url": "http://mirror1.com",
            "is_working": True,
            "up_events": 1,
            "down_events": 0,
        }
        self.mock_db["mirrors"].replace_one.return_value = MagicMock()
        database.save_mirror(mirror)
        self.mock_db["mirrors"].replace_one.assert_called_once_with(
            {"url": "http://mirror1.com"}, mirror, upsert=True
        )


if __name__ == "__main__":
    unittest.main()
