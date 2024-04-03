from backend.metrics.tweet_property_array import TweetPropertyArray
import numpy as np
from backend.config import Config
from pymongo import MongoClient
from backend.encoders.tweet_encoder import Tweet
from backend.encoders.profile_encoder import Profile
from pymongo import ASCENDING
from backend.metrics.profile_with_tweet_properties import ProfileWithTweetProperties

class TweetPropertyProfileCompiler:
    def __init__(self) -> None:
        self._profile_store: dict[str, ProfileWithTweetProperties] = {}
        self._tweets_col = self._connect_to_database(Config.db_name())["tweets"]

    def _connect_to_database(self, db_name: str):
        return MongoClient(
            Config.db_host(),
            port=Config.db_port(),
            username=Config.db_user(),
            password=Config.db_password(),
        )[db_name]

    def _load_profiles(self) -> list[dict]:
        db = self._connect_to_database(Config.db_name())
        return list(db["profiles"].find({}))

    def compute_stats_for_all_profiles(self):
        profiles = self._load_profiles()
        for profile in profiles:
            profile_stat = ProfileWithTweetProperties(as_json=profile)
            tweets = list(
                self._tweets_col.find({"data.author_id": profile_stat.get_username()}).sort(
                    "data.created_at", ASCENDING
                )
            )
            profile_stat.build_stats([Tweet(as_json=tweet) for tweet in tweets])
            self._profile_store[profile_stat.get_username()] = profile_stat

    def get_tweet_property(self, profile_name: str, property_name: str) -> TweetPropertyArray:
        return self._profile_store[profile_name].get_stats_by_tweet_property(property_name)
    
    def get_all_tweet_properties(self, profile_name: str) -> dict[str, TweetPropertyArray]:
        return self._profile_store[profile_name]._properties
                
    def get_all_profiles(self) -> dict[str, ProfileWithTweetProperties]:
        return self._profile_store