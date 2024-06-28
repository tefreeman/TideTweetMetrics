import unittest
from backend.encoders.profile_encoder import Profile
import json


class TestProfileEncoder(unittest.TestCase):
    def getMockJSONProfileString(self):
        return """
        {
            "name": "UArk Computer Science & Computer Engineering",
            "description": "This page is no longer in use! We are now @UArkEECS",
            "username": "csce_uark",
            "created_at": "9:25 PM - 10 Mar 2021",
            "location": "Fayetteville, AR",
            "verified": false,
            "public_metrics": {
                "followers_count": 145,
                "following_count": 89,
                "tweet_count": 853,
                "like_count": 453
            },
            "profile_image_url": "https://nitter.holo-mix.com/pic/enc/cGJzLnR3aW1nLmNvbS9wcm9maWxlX2ltYWdlcy8xNTQwMzQzMDE3Njg0MzYxMjE2LzdmbUZmUXFvXzQwMHg0MDAuanBn",
            "url": "linktr.ee/uarkeecs",
            "imeta": {
                "bfi": 1,
                "domain": "nitter.holo-mix.com",
                "created": {
                "$date": "2024-02-18T23:13:34.232Z"
                },
                "version": "0.0.1",
                "uid": {
                "$oid": "65d2e5c4875e40cbce5fc0e9"
                },
                "errors": [],
                "zid": 9
            }
    
        }"""

    def test_set_and_get_name(self):
        profile_dict = json.loads(self.getMockJSONProfileString())
        profile = Profile(as_json=profile_dict)
        new_name = "New Name"
        profile.set_name(new_name)
        self.assertEqual(profile.get_name(), new_name)

    def test_set_and_get_username(self):
        profile_dict = json.loads(self.getMockJSONProfileString())
        profile = Profile(as_json=profile_dict)
        new_username = "@new_username"
        profile.set_username(new_username)
        self.assertEqual(profile.get_username(), new_username[1:].lower())

    def test_set_and_get_description(self):
        profile_dict = json.loads(self.getMockJSONProfileString())
        profile = Profile(as_json=profile_dict)
        new_description = "New Description"
        profile.set_description(new_description)
        self.assertEqual(profile.get_description(), new_description)

    def test_set_and_get_location(self):
        profile_dict = json.loads(self.getMockJSONProfileString())
        profile = Profile(as_json=profile_dict)
        new_location = "New Location"
        profile.set_location(new_location)
        self.assertEqual(profile.get_location(), new_location)

    def test_set_and_get_url(self):
        profile_dict = json.loads(self.getMockJSONProfileString())
        profile = Profile(as_json=profile_dict)
        new_url = "New URL"
        profile.set_url(new_url)
        self.assertEqual(profile.get_url(), new_url)

    def test_set_and_get_verified(self):
        profile_dict = json.loads(self.getMockJSONProfileString())
        profile = Profile(as_json=profile_dict)
        new_verified = True
        profile.set_verified(new_verified)
        self.assertEqual(profile.get_verified(), new_verified)

    def test_set_and_get_created_at(self):
        profile_dict = json.loads(self.getMockJSONProfileString())
        profile = Profile(as_json=profile_dict)
        new_created_at = "9:25 PM - 10 Mar 2021"
        profile.set_created_at(new_created_at)
        self.assertEqual(profile.get_created_at(), new_created_at)

    def test_set_and_get_profile_image_url(self):
        profile_dict = json.loads(self.getMockJSONProfileString())
        profile = Profile(as_json=profile_dict)
        new_profile_image_url = "New Profile Image URL"
        profile.set_profile_image_url(new_profile_image_url)
        self.assertEqual(profile.get_profile_image_url(), new_profile_image_url)

    def test_set_and_get_public_metrics(self):
        profile = Profile()
        # Use string representations including commas, as expected by the implementation
        profile.set_public_metrics("1,234", "567", "8,910", "111")

        # Verify that the metrics are correctly set and can be retrieved individually
        self.assertEqual(
            profile.get_followers_count(),
            1234,
            "The followers count should correctly handle numeric strings with commas.",
        )
        self.assertEqual(
            profile.get_following_count(),
            567,
            "The following count should be correctly set and retrieved.",
        )
        self.assertEqual(
            profile.get_tweet_count(),
            8910,
            "The tweet count should correctly handle numeric strings with commas.",
        )
        self.assertEqual(
            profile.get_like_count(),
            111,
            "The like count should be correctly set and retrieved.",
        )

    def test_set_public_metrics_with_invalid_numbers(self):
        profile = Profile()
        with self.assertRaises(ValueError):
            profile.set_public_metrics("not a number", "500", "150", "250")

    # # Note: zid is lost in decoding
    # def test_json_to_dict(self):
    #     profile_dict = json.loads(self.getMockJSONProfileString())
    #     encoded_profile = Profile(as_json=profile_dict)
    #     decoded_json_dict = encoded_profile.to_json_dict()
    #     t1 = json.loads(self.getMockJSONProfileString())
    #     t2 = decoded_json_dict
    #     print(t1)
    #     print(t2)
    #     self.assertEqual(t1, t2)


if __name__ == "__main__":
    unittest.main()
