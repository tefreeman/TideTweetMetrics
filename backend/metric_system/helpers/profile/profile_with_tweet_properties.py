from backend.encoders.profile_encoder import Profile
from backend.encoders.tweet_encoder import Tweet
from backend.metric_system.helpers.profile.tweet_property_array import TweetPropertyArray
import numpy as np


def _default_property_extractor():
       return {
            ("tweet_likes", lambda tweet: tweet.get_like_count(), np.int16),
            ("tweet_retweets", lambda tweet: tweet.get_retweet_count(), np.int32),
            ("tweet_replies", lambda tweet: tweet.get_reply_count(), np.int32),
            ("tweet_quotes", lambda tweet: tweet.get_quote_count(), np.int32),
            ("tweet_count", lambda tweet: 1, np.int32),
            ("tweet_chars", lambda tweet: len(tweet.get_text()), np.int32),
            ("tweet_words", lambda tweet: len(tweet.get_text().split()), np.int32),
            ("tweet_annotations", lambda tweet: len(tweet.get_annotations()), np.int32),
            ("tweet_cashtags", lambda tweet: len(tweet.get_cashtags()), np.int32),
            ("tweet_hashtags", lambda tweet: len(tweet.get_hashtags()), np.int32),
            ("tweet_mentions", lambda tweet: len(tweet.get_mentions()), np.int32),
            ("tweet_urls", lambda tweet: len(tweet.get_urls()), np.int32),
            ("tweet_photos", lambda tweet: len(tweet.get_photos()), np.int32),
            ("tweet_videos", lambda tweet: len(tweet.get_videos()), np.int32),
            ("tweet_cards", lambda tweet: len(tweet.get_cards()), np.int32),
            (
                "tweet_referenced_tweets",
                lambda tweet: len(tweet.get_referenced_tweet()),
                np.int32,
            ),
        }
       
class ProfileWithTweetProperties(Profile):
    def __init__(self, as_json: dict = None) -> None:
        super().__init__(as_json=as_json)
        self._properties_to_extract = _default_property_extractor()
        self._properties: dict[str, TweetPropertyArray] = {}

        self._valid_property_names = set([prop[0] for prop in self._properties_to_extract])
        
    def _initialize_properties(self, tweet_count):  
        for prop in self._properties_to_extract:
            self._properties[prop[0]] = TweetPropertyArray(*prop)
            self._properties[prop[0]].init_profile(tweet_count)
    
    def build_stats(self, tweets: list[Tweet]):
        self._initialize_properties(len(tweets))
        for tweet in tweets:
            for prop in self._properties:
                self._properties[prop].process_tweet(tweet)

    def get_stats_by_tweet_property(self, property_name: str) -> TweetPropertyArray:
        if property_name not in self._valid_property_names:
            raise ValueError(f"Invalid property name: {property_name}")
        
        return self._properties[property_name]
    
    def get_all_stats(self) -> dict[str, TweetPropertyArray]:
        return self._properties
