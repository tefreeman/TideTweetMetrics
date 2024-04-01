import unittest
from backend.encoders.tweet_encoder import Tweet
import json


class TestTweetEncoder(unittest.TestCase):
    def getMockJSONTweetString(self):
        return """
        {
          "_id": {
            "$oid": "65d2e37e0b65a258f77ba546"
          },
          "data": {
            "id": "1684952349687615488",
            "text": "A group of @UAFS students studying through a remote campus program offered by @UArkELEG and @CSCE_uark  are designing a lunar rover for @NASA 's upcoming mission to the moon. The rover assists astronauts during their lunar exploration.",
            "created_at": {
              "$date": "2023-07-28T15:41:00.000Z"
            },
            "author_id": "uofa_engr",
            "public_metrics": {
              "retweet_count": 2,
              "reply_count": 0,
              "like_count": 3,
              "quote_count": 0
            },
            "entities": {
              "annotations": [],
              "cashtags": [],
              "hashtags": [],
              "mentions": [
                {
                  "tag": "UAFS",
                  "start": 11,
                  "end": 16
                },
                {
                  "tag": "UArkELEG",
                  "start": 78,
                  "end": 87
                },
                {
                  "tag": "CSCE_uark",
                  "start": 92,
                  "end": 102
                },
                {
                  "tag": "NASA",
                  "start": 136,
                  "end": 141
                }
              ],
              "urls": []
            },
            "attachments": {
              "photos": [
                {
                  "href": "https://nitter.holo-mix.com/pic/orig/enc/bWVkaWEvRjJJbVZkNWFBQUVwbmR5LmpwZw==",
                  "img_src": "https://nitter.holo-mix.com/pic/enc/bWVkaWEvRjJJbVZkNWFBQUVwbmR5LmpwZz9uYW1lPXNtYWxsJmZvcm1hdD13ZWJw"
                }
              ],
              "videos": [],
              "cards": []
            },
            "referenced_tweet": {
              "id": "https://nitter.holo-mix.com/UofA_Engr/status/1684952349687615488#m",
              "type": "retweeted"
            }
          },
          "includes": {},
          "imeta": {
            "bfi": 1,
            "domain": "nitter.holo-mix.com",
            "created": {
              "$date": "2024-02-18T23:13:34.178Z"
            },
            "version": "0.0.1",
            "uid": {
              "$oid": "65d2e5c4875e40cbce5fc0d5"
            },
            "errors": [],
            "zid": 9
          }
        }"""

    # def test_json_to_dict(self):
    #     tweet_dict = json.loads(self.getMockJSONTweetString())
    #     encoded_tweet = Tweet(as_json=tweet_dict)
    #     decoded_json_string = encoded_tweet.to_json_dict()
    #     self.assertEqual(json.loads(self.getMockJSONTweetString()), decoded_json_string)

    def test_get_and_set_id(self):
        tweet_dict = json.loads(self.getMockJSONTweetString())
        encoded_tweet = Tweet(as_json=tweet_dict)
        self.assertEqual(encoded_tweet.get_id(), "1684952349687615488")
        encoded_tweet.set_id("new_id")
        self.assertEqual(encoded_tweet.get_id(), "new_id")


# main
if __name__ == "__main__":
    unittest.main()
