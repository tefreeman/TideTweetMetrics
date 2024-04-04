from backend.metric_system.helpers.profile.tweet_property_array import TweetPropertyArray
from backend.config import Config
from pymongo import MongoClient
from backend.encoders.tweet_encoder import Tweet
from pymongo import ASCENDING
from backend.metric_system.helpers.profile.profile_with_tweet_properties import ProfileWithTweetProperties

class TweetAnalyticsHelper:
    def __init__(self, limit_for_debug=False) -> None:
        self._limit_for_debug = limit_for_debug
        self._has_built = False
        self._profile_store: dict[str, ProfileWithTweetProperties] = {}
        self._tweets_col = self._connect_to_database()["tweets"]

    def _connect_to_database(self):
        return MongoClient(
            Config.db_host(),
            port=Config.db_port(),
            username=Config.db_user(),
            password=Config.db_password(),
        )[Config.db_name()]

    def _load_profiles(self) -> list[dict]:
        db = self._connect_to_database()
        return list(db["profiles"].find({}))


    def _compute_global_stats_over_all_profiles(self):
        global_profile = ProfileWithTweetProperties()
        global_profile.set_username("global")
        tweets = None
        if self._limit_for_debug:
            tweets = self._tweets_col.find({}).sort(
                "data.created_at", ASCENDING
            ).limit(20)
        else:
            tweets = self._tweets_col.find({}).sort(
                    "data.created_at", ASCENDING
                )

        global_profile.build_stats([Tweet(as_json=tweet) for tweet in tweets])
        
        self._profile_store["global"] = global_profile
        
        
    def _compute_stats_for_all_profiles(self):
        profiles = self._load_profiles()
        for profile in profiles:
            profile_stat = ProfileWithTweetProperties(as_json=profile)
            
            tweets = None
            if self._limit_for_debug:
                tweets = list(
                    self._tweets_col.find({"data.author_id": profile_stat.get_username()}).sort(
                        "data.created_at", ASCENDING
                    ).limit(20)
                )
            else:
                tweets = list(
                    self._tweets_col.find({"data.author_id": profile_stat.get_username()}).sort(
                        "data.created_at", ASCENDING
                    )
                )
                
            profile_stat.build_stats([Tweet(as_json=tweet) for tweet in tweets])
            self._profile_store[profile_stat.get_username()] = profile_stat

        self._has_built = True
    
    def build(self):
        self._compute_global_stats_over_all_profiles()
        self._compute_stats_for_all_profiles()
        
    def get_tweet_property(self, profile_name: str, property_name: str) -> TweetPropertyArray:
        if not self._has_built:
            raise Exception("You must call compute_stats_for_all_profiles() before calling get_tweet_property()")
        return self._profile_store[profile_name].get_stats_by_tweet_property(property_name)
    
    def get_all_tweet_properties(self, profile_name: str) -> dict[str, TweetPropertyArray]:
        if not self._has_built:
            raise Exception("You must call compute_stats_for_all_profiles() before calling get_all_tweet_properties()")
        return self._profile_store[profile_name]._properties
                
    def get_all_profiles(self) -> dict[str, ProfileWithTweetProperties]:
        if not self._has_built:
            raise Exception("You must call compute_stats_for_all_profiles() before calling get_all_profiles()")
        
        return self._profile_store