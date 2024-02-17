import unittest

from crawler_sys.encoders.tweet_encoder import *

class TestTweetEncoder(unittest.TestCase):

    def setUp(self):
        self.tweet = Tweet()

    def test_id(self):
        self.tweet.set_id("abc")
        self.assertEqual(self.tweet.get_id(), "abc")

    def test_text(self):
        self.tweet.set_text("abc")
        self.assertEqual(self.tweet.get_text(), "abc")

    def test_post_date(self):
        self.tweet.set_post_date("February 3, 2024 · 12:00 UTC")
        self.assertEqual(self.tweet.get_post_date(), "February 3, 2024 · 12:00 UTC")
        self.assertEqual(self.tweet.get_post_date_as_epoch(), 1706961600)

    def test_author(self):
        self.tweet.set_author("abc")
        self.assertEqual(self.tweet.get_author(), "abc")

    def test_public_metrics(self):
        self.tweet.set_public_metrics(20, 10, 50, 5)
        resp = self.tweet.get_public_metrics()
        self.assertEqual(resp['retweet_count'], 20)
        self.assertEqual(resp['reply_count'], 10)
        self.assertEqual(resp['like_count'], 50)
        self.assertEqual(resp['quote_count'], 5)

    def test_entities(self):
        content_links = [
            {"text": "@samgaines"},
            {"text": "#fine"},
            {"text": "$GOOG"},
            {"text": "Google", "href": "http://google.com"}
        ]
        content_text = "Hey @samgaines, you're looking #fine on this Thursday afternoon. $GOOG is trending. Google"
        self.tweet.set_entities(content_links, content_text)
        resp = self.tweet.get_entities()
        self.assertEqual(len(resp["mentions"]), 1)
        self.assertEqual(len(resp["hashtags"]), 1)
        self.assertEqual(len(resp["cashtags"]), 1)
        self.assertEqual(len(resp["urls"]), 1)
        self.assertEqual(resp["mentions"]["start"], 4)
        self.assertEqual(resp["mentions"]["end"], 14)
        self.assertEqual(resp["mentions"]["tag"], "samgaines")

    def test_attachments(self):
        photos = ["photo1", "photo2"]
        videos = ["video1", "video2", "video3"]
        cards = []
        self.tweet.set_attachments(photos, videos, cards)
        resp = self.tweet.get_attachments()
        self.assertEqual(len(resp["photos"]), 2)
        self.assertEqual(len(resp["videos"]), 3)
        self.assertEqual(len(resp["cards"]), 0)

    def test_referenced_tweet(self):
        id = "1256"
        type = "retweeted"
        self.tweet.set_refenced_tweet(id, type)
        self.assertEqual(self.tweet.get_referenced_tweet)

if __name__ == '__main__':
    unittest.main()
