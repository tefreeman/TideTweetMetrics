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


        
        
    def _compute_stats_for_all_profiles(self):
        global_profile = ProfileWithTweetProperties()
        global_profile.set_public_metrics(0,0,0,0)
        global_profile.set_username("_global")
        
        profiles = self._load_profiles()
        
        for profile in profiles:
            profile_stat = ProfileWithTweetProperties(as_json=profile)
            global_profile.merge_public_metrics(profile_stat)
            
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
                
            profile_tweets = [Tweet(as_json=tweet) for tweet in tweets]
            
            profile_stat.build_stats(profile_tweets, is_sorted=True)
            global_profile.build_stats(profile_tweets, is_sorted=False) # profiles are sorted but multiple profiles are not sorted with respect to each other            
            
            self._profile_store[profile_stat.get_username()] = profile_stat

        self._profile_store[global_profile.get_username()] = global_profile
        self._has_built = True
    
    def build(self):
        self._compute_stats_for_all_profiles()
        
    def get_profile(self, username: str) -> ProfileWithTweetProperties:
        return self._profile_store[username]   
    
    def get_all_profiles(self) -> dict[str, ProfileWithTweetProperties]:
        return self._profile_store