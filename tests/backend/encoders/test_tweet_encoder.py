import unittest
from backend.encoders.tweet_encoder import Tweet
import json
from datetime import datetime
import pytz


class TestTweetEncoder(unittest.TestCase):
    def getMockJSONTweetString(self):
        return """
        {
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

    def test_json_to_dict(self):
        tweet_dict = json.loads(self.getMockJSONTweetString())
        encoded_tweet = Tweet(as_json=tweet_dict)
        print()
        print(tweet_dict)
        decoded_json_dict = encoded_tweet.to_json_dict()
        print()
        print(decoded_json_dict)
        self.assertEqual(json.loads(self.getMockJSONTweetString()), decoded_json_dict)

    def test_get_and_set_id(self):
        tweet_dict = json.loads(self.getMockJSONTweetString())
        encoded_tweet = Tweet(as_json=tweet_dict)
        self.assertEqual(encoded_tweet.get_id(), "1684952349687615488")
        encoded_tweet.set_id("new_id")
        self.assertEqual(encoded_tweet.get_id(), "new_id")

    def test_set_and_get_text(self):
        tweet_dict = json.loads(self.getMockJSONTweetString())
        tweet = Tweet(as_json=tweet_dict)
        new_text = "This is a new tweet text."
        tweet.set_text(new_text)
        self.assertEqual(tweet.get_text(), new_text)

    def test_set_and_get_post_date(self):
        tweet_dict = json.loads(self.getMockJSONTweetString())
        tweet = Tweet(as_json=tweet_dict)
        new_date = "Mar 10, 2024 · 04:30 PM UTC"
        tweet.set_post_date(new_date)
        expected_date = datetime.strptime(
            new_date.split(" UTC")[0], "%b %d, %Y · %I:%M %p"
        )
        expected_date = expected_date.replace(tzinfo=pytz.UTC)
        self.assertEqual(tweet.get_post_date(), expected_date)

    def test_set_and_get_author(self):
        tweet_dict = json.loads(self.getMockJSONTweetString())
        tweet = Tweet(as_json=tweet_dict)
        new_author = "@new_user"
        tweet.set_author(new_author)
        self.assertEqual(tweet.get_author(), new_author[1:].lower())

    def test_set_and_get_public_metrics(self):
        tweet_dict = json.loads(self.getMockJSONTweetString())
        tweet = Tweet(as_json=tweet_dict)
        retweet_count = "10"
        reply_count = "5"
        like_count = "20"
        quote_count = "2"
        tweet.set_public_metrics(retweet_count, reply_count, like_count, quote_count)
        self.assertEqual(tweet.get_retweet_count(), int(retweet_count))
        self.assertEqual(tweet.get_reply_count(), int(reply_count))
        self.assertEqual(tweet.get_like_count(), int(like_count))
        self.assertEqual(tweet.get_quote_count(), int(quote_count))

    def test_set_and_get_entities(self):
        tweet_dict = json.loads(self.getMockJSONTweetString())
        tweet = Tweet(as_json=tweet_dict)
        content_links = [
            {"text": "@user", "href": "http://example.com/@user"},
            {"text": "#hashtag", "href": "http://example.com/hashtag"},
        ]
        content_text = "This is a tweet with @user and #hashtag."
        tweet.set_entities(content_links, content_text)
        self.assertEqual(len(tweet.get_mentions()), 1)
        self.assertEqual(len(tweet.get_hashtags()), 1)

    def test_set_and_get_attachments(self):
        tweet_dict = json.loads(self.getMockJSONTweetString())
        tweet = Tweet(as_json=tweet_dict)
        photos = [
            {
                "href": "http://example.com/photo.jpg",
                "img_src": "http://example.com/photo_small.jpg",
            }
        ]
        videos = []  # Assuming similar structure as photos for simplicity
        cards = []  # Assuming it's some kind of structured data
        tweet.set_attachments(photos, videos, cards)
        self.assertEqual(len(tweet.get_photos()), 1)
        self.assertEqual(len(tweet.get_videos()), 0)
        self.assertEqual(len(tweet.get_cards()), 0)

    def test_set_and_get_urls(self):
        tweet_dict = json.loads(self.getMockJSONTweetString())
        tweet = Tweet(as_json=tweet_dict)

        # Define a URL to be added to the tweet's entities
        content_links = [
            {
                "text": "Example Site",  # Usually, this would be the anchor text in a real tweet
                "href": "http://example.com",
            }
        ]
        content_text = "Check out this site: Example Site."

        # Use the set_entities method to add the URL
        tweet.set_entities(content_links, content_text)

        # Retrieve the list of URLs from the tweet
        urls = tweet.get_urls()

        # Ensure that the URL has been correctly added
        self.assertEqual(len(urls), 1)
        self.assertEqual(urls[0]["url"], "http://example.com")
        self.assertEqual(urls[0]["display_url"], "Example Site")

    def test_set_and_get_urls(self):
        tweet_dict = json.loads(self.getMockJSONTweetString())
        tweet = Tweet(as_json=tweet_dict)

        # Define a URL to be added to the tweet's entities
        content_links = [
            {
                "text": "Example Site",  # Usually, this would be the anchor text in a real tweet
                "href": "http://example.com",
            }
        ]
        content_text = "Check out this site: Example Site."

        # Use the set_entities method to add the URL
        tweet.set_entities(content_links, content_text)

        # Retrieve the list of URLs from the tweet
        urls = tweet.get_urls()

        # Ensure that the URL has been correctly added
        self.assertEqual(len(urls), 1)
        self.assertEqual(urls[0]["url"], "http://example.com")
        self.assertEqual(urls[0]["display_url"], "Example Site")


if __name__ == "__main__":
    unittest.main()
