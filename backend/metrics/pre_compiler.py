from backend.metrics.common_tweet_property import CommonTweetProperty
import numpy as np
from backend.config import Config
from pymongo import MongoClient
from backend.encoders.tweet_encoder import Tweet
from backend.encoders.profile_encoder import Profile
from pymongo import ASCENDING


class TweetDataCompiler:
    def __init__(self) -> None:
        self._profiles = []
        self._property_extractors  = {
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

        self._common_tweet_properties: dict[str, CommonTweetProperty] = {}
        self._tweets_col = self._connect_to_database(Config.db_name())["tweets"]

    def _connect_to_database(self, db_name: str):
        return MongoClient(
            Config.db_host(),
            port=Config.db_port(),
            username=Config.db_user(),
            password=Config.db_password(),
        )[db_name]

    def _load_profiles(self):
        db = self._connect_to_database(Config.db_name())
        profiles = list(db["profiles"].find({}))

        for profile in profiles:
            self._profiles.append(Profile(as_json=profile).get_username())

    def _initialize_properties(self):
        for prop in self._property_extractors :
            self._common_tweet_properties[prop[0]] = CommonTweetProperty(*prop)

    def _compile_data(self):
        for profile in self._profiles:
            tweets = list(
                self._tweets_col.find({"data.author_id": profile}).sort(
                    "data.created_at", ASCENDING
                )
            )

            for common_tweet_pro in self._common_tweet_properties.values():
                common_tweet_pro.init_profile(len(tweets))

            for tweet in tweets:
                tweet_object = Tweet(as_json=tweet)
                for common_tweet_pro in self._common_tweet_properties.values():
                    common_tweet_pro.process_tweet(tweet_object)

            for common_tweet_pro in self._common_tweet_properties.values():
                common_tweet_pro.finish_profile(profile)
                
    def process(self):
        self._load_profiles()
        self._initialize_properties()
        self._compile_data()

    def get_common_tweet_property(self, property_name: str) -> CommonTweetProperty:
        return self._common_tweet_properties[property_name]
    
    def get_all_common_tweet_properties(self) -> dict[str, CommonTweetProperty]:
        return self._common_tweet_properties
    
