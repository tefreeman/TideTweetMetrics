import unittest

from backend.encoders.profile_encoder import *

class TestProfileEncoder(unittest.TestCase):

    def setUp(self):
        self.profile = Profile()

    def test_name(self):
        self.profile.set_name("Sam Gaines")
        self.assertEqual(self.profile.get_name(), "Sam Gaines")

    def test_username(self):
        self.profile.set_username("samuelmgaines")
        self.assertEqual(self.profile.get_username(), "samuelmgaines")

    def test_description(self):
        self.profile.set_description("Sam is HIM")
        self.assertEqual(self.profile.get_description(), "Sam is HIM")

    def test_location(self):
        self.profile.set_location("Gamertown, USA")
        self.assertEqual(self.profile.get_location(), "Gamertown, USA")

    def test_url(self):
        self.profile.set_url("http://google.com")
        self.assertEqual(self.profile.get_url(), "http://google.com")

    def test_verified(self):
        self.profile.set_verified(True)
        self.assertTrue(self.profile.get_verified())

    def test_created_at(self):
        self.profile.set_created_at("string")
        self.assertEqual(self.profile.get_created_at(), "string")

    def test_profile_image_url(self):
        self.profile.set_profile_image_url("url")
        self.assertEqual(self.profile.get_profile_image_url(), "url")

    def test_public_metrics(self):
        self.profile.set_public_metrics("1,000,000", "2", "11", "2,401")
        self.assertEqual(self.profile.get_public_metrics()["followers_count"], 1000000)
        self.assertEqual(self.profile.get_public_metrics()["following_count"], 2)
        self.assertEqual(self.profile.get_public_metrics()["tweet_count"], 11)
        self.assertEqual(self.profile.get_public_metrics()["like_count"], 2401)

if __name__ == '__main__':
    unittest.main()