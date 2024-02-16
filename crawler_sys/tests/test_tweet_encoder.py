import unittest

from crawler_sys.encoders.tweet_encoder import *

class TestTweetEncoder(unittest.TestCase):

    def setUp(self):
        self.tweet = Tweet()

    def test_tweet_encode_as_dict(self):
        pass

    def test_tweet_encode_changes_as_dict(self):
        pass

    def test_tweet_ensure_required_fields_set(self):
        pass

    def test_tweet_id(self):
        self.tweet.set_id("abc")
        self.assertEqual(self.tweet.get_id(), "abc")

    def test_tweet_text(self):
        self.tweet.set_text("abc")
        self.assertEqual(self.tweet.get_text(), "abc")

    def test_tweet_post_date(self):
        self.tweet.set_post_date("February 3, 2024 · 12:00 UTC")
        self.assertEqual(self.tweet.get_post_date(), "February 3, 2024 · 12:00 UTC")
        self.assertEqual(self.tweet.get_post_date_as_epoch(), 1706961600)

    def test_tweet_author(self):
        self.tweet.set_author("abc")
        self.assertEqual(self.tweet.get_author(), "abc")

    def test_tweet_public_metrics(self):
        self.tweet.set_public_metrics(20, 10, 50, 5)
        resp = self.tweet.get_public_metrics()
        self.assertEqual(resp['retweet_count'], 20)
        self.assertEqual(resp['reply_count'], 10)
        self.assertEqual(resp['like_count'], 50)
        self.assertEqual(resp['quote_count'], 5)

    def test_tweet_entities(self):
        pass

    def test_tweet_attachments(self):
        pass

    def test_tweet_referenced_tweet(self):
        pass

if __name__ == '__main__':
    unittest.main()
