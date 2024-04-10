from backend.encoders.tweet_encoder import Tweet
from backend.encoders.meta_encoder import MetaData
from backend.encoders.profile_encoder import Profile
from datetime import datetime


class TestMetricSystemHelper:
    def ReturnTweet1(self) -> Tweet:
        tweet1 = Tweet()
        tweet1.set_id("1111111001")
        tweet1.set_text("1st Tweet for 1st profile for test_metric_system")
        tweet1.set_post_date("Mar 10, 2024 · 04:30 PM UTC")
        tweet1.set_author("1st_profile")
        tweet1.set_public_metrics(10, 5, 2, 2)
        tweet1.set_entities([""], [""], [""], [""], [""])
        tweet1.set_attachments([""], [""], [""])
        tweet1.set_referenced_tweet("")
