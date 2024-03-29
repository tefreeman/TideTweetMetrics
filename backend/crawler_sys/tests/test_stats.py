import sys
import os
import unittest
from pymongo import MongoClient

# Ensure the parent directory is in the path to find the stats module
sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))
from api.metrics.stats import *


class TestStatsMethods(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = MongoClient(
            "73.58.28.154",
            port=27017,
            username="Admin",
            password="***REMOVED***",
        )
        cls.db = cls.client["twitter_v2"]

    def test_username_in_database(self):
        # Tests if the username is in the database.
        self.assertTrue(username_in_database(self.db, "csce_uark"))
        self.assertFalse(username_in_database(self.db, "csce_uarkk"))

    def test_get_crawl_list(self):
        # Tests if a list is returned.
        self.assertIsInstance(get_crawl_list(self.db), list)

    def test_get_crawl_list_size(self):
        # Tests if the actual crawl list size matches the expected size.
        self.assertEqual(get_crawl_list_size(self.db), 148)

    def test_get_profile_name(self):
        # Tests if the actual profile name matches the expected profile name.
        self.assertEqual(
            get_profile_name(self.db, "csce_uark"),
            "UArk Computer Science & Computer Engineering",
        )

    def test_get_profile_description(self):
        # Tests if the actual profile description matches the expected profile description.
        self.assertEqual(
            get_profile_description(self.db, "csce_uark"),
            "This page is no longer in use! We are now @UArkEECS",
        )

    def test_get_profile_created_at(self):
        # Tests if the actual profile created_at matches the expected profile created_at.
        self.assertEqual(
            get_profile_created_at(self.db, "csce_uark"), "9:25 PM - 10 Mar 2021"
        )

    def test_get_profile_location(self):
        # Tests if the actual profile location matches the expected profile location.
        self.assertEqual(get_profile_location(self.db, "csce_uark"), "Fayetteville, AR")

    def test_get_profile_verified(self):
        # Tests if the actual profile verified matches the expected profile verified.
        self.assertEqual(get_profile_verified(self.db, "csce_uark"), "False")

    def test_get_profile_url(self):
        # Tests if the actual profile url matches the expected profile url.
        self.assertEqual(
            get_profile_url(self.db, "csce_uark"),
            "linktr.ee/uarkeecs",
        )

    def test_get_profile_followers_count(self):
        # Tests if the actual profile followers_count matches the expected profile followers_count.
        self.assertEqual(get_profile_followers_count(self.db, "csce_uark"), 145)

    def test_get_profile_following_count(self):
        # Tests if the actual profile following_count matches the expected profile following_count.
        self.assertEqual(get_profile_following_count(self.db, "csce_uark"), 89)

    def test_get_profile_tweet_count(self):
        # Tests if the actual profile tweet_count matches the expected profile tweet_count.
        self.assertEqual(get_profile_tweet_count(self.db, "csce_uark"), 853)

    def test_get_profile_like_count(self):
        # Tests if the actual profile like_count matches the expected profile like_count.
        self.assertEqual(get_profile_like_count(self.db, "csce_uark"), 453)

    def test_get_profiles_avg_followers_count(self):
        # Tests if the actual average followers_count matches the expected average followers_count.
        self.assertEqual(
            get_profiles_avg_followers_count(self.db, ["csce_uark", "novaengineer"]),
            836.0,
        )
        self.assertNotEqual(
            get_profiles_avg_followers_count(self.db, ["csce_uark", "novaengineer"]), 0
        )

    def test_get_all_profiles_avg_followers_count(self):
        # Test functionality when no usernames are specified.
        # All profiles in the database will be examined.
        self.assertEqual(get_profiles_avg_followers_count(self.db), 5112.455782312925)
        self.assertNotEqual(get_profiles_avg_followers_count(self.db), 0)

    def test_get_profiles_avg_following_count(self):
        # Tests if the actual average following_count matches the expected average following_count.
        self.assertEqual(
            get_profiles_avg_following_count(self.db, ["csce_uark", "novaengineer"]),
            643.5,
        )
        self.assertNotEqual(
            get_profiles_avg_following_count(self.db, ["csce_uark", "novaengineer"]), 0
        )

    def test_get_all_profiles_avg_following_count(self):
        # Test functionality when no usernames are specified.
        # All profiles in the database will be examined.
        self.assertEqual(get_profiles_avg_following_count(self.db), 584.8775510204082)
        self.assertNotEqual(get_profiles_avg_following_count(self.db), 0)

    def test_get_profiles_avg_tweet_count(self):
        # Tests if the actual average tweet_count matches the expected average tweet_count.
        self.assertEqual(
            get_profiles_avg_tweet_count(self.db, ["csce_uark", "novaengineer"]),
            2519.0,
        )
        self.assertNotEqual(
            get_profiles_avg_tweet_count(self.db, ["csce_uark", "novaengineer"]), 0
        )

    def test_get_all_profiles_avg_tweet_count(self):
        # Test functionality when no usernames are specified.
        # All profiles in the database will be examined.
        self.assertEqual(get_profiles_avg_tweet_count(self.db), 3680.1768707482993)
        self.assertNotEqual(get_profiles_avg_tweet_count(self.db), 0)

    def test_get_profiles_avg_like_count(self):
        # Tests if the actual average like_count matches the expected average like_count.
        self.assertEqual(
            get_profiles_avg_like_count(self.db, ["csce_uark", "novaengineer"]),
            483.0,
        )
        self.assertNotEqual(
            get_profiles_avg_like_count(self.db, ["csce_uark", "novaengineer"]), 0
        )

    def test_get_all_profiles_avg_like_count(self):
        # Test functionality when no usernames are specified.
        # All profiles in the database will be examined.
        self.assertEqual(get_profiles_avg_like_count(self.db), 2622.530612244898)
        self.assertNotEqual(get_profiles_avg_like_count(self.db), 0)

    def test_get_profile_info(self):
        # Tests if the actual profile info matches the expected profile info.
        self.assertEqual(
            get_profile_info(self.db, "csce_uark"),
            {
                "username": "csce_uark",
                "name": "UArk Computer Science & Computer Engineering",
                "description": "This page is no longer in use! We are now @UArkEECS",
                "created_at": "9:25 PM - 10 Mar 2021",
                "location": "Fayetteville, AR",
                "verified": "False",
                "url": "linktr.ee/uarkeecs",
                "followers_count": 145,
                "following_count": 89,
                "tweet_count": 853,
                "like_count": 453,
            },
        )
        # Test error functionality when the username is not specified.
        self.assertEqual(
            get_profile_info(self.db),
            {"Error": "Error: No username specified in get_profile_info() function"},
        )
        # Test error functionality when no database is specified.
        self.assertEqual(
            get_profile_info(),
            {"Error": "Error: No database specified in get_profile_info() function"},
        )


if __name__ == "__main__":
    unittest.main()
