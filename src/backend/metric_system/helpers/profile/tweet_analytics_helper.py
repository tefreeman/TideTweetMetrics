from backend.config import Config
from pymongo import MongoClient
from backend.encoders.tweet_encoder import Tweet
from pymongo import ASCENDING
from backend.metric_system.helpers.profile.profile_with_tweet_properties import (
    ProfileWithTweetProperties,
)
from backend.metric_system.helpers.key_map import GLOBAL_PROFILE_NAME
import logging


class TweetAnalyticsHelper:
    """
    Helper class that gives access to tweet statistics for all profiles.
    """

    def __init__(self, debug_mode=False) -> None:
        """
        Initializes the TweetAnalyticsHelper.

        Args:
            debug_mode (bool, optional): Whether debug mode is enabled. Defaults to False.
        """
        self._is_debug_mode = debug_mode

        self._profile_store: dict[str, ProfileWithTweetProperties] = {}
        self._tweets_collection = self._connect_to_database()["tweets"]

    def _connect_to_database(self):
        """
        Connects to the database.

        Returns:
            MongoClient: The MongoDB client.
        """
        return MongoClient(
            Config.db_host(),
            port=Config.db_port(),
            username=Config.db_user(),
            password=Config.db_password(),
        )[Config.db_name()]

    def _load_profiles(self) -> list[dict]:
        """
        Loads profiles from the database.

        Returns:
            list[dict]: The list of profiles.
        """
        db = self._connect_to_database()
        return list(db["profiles"].find({}))

    def _init_global_profile(self):
        """
        Initializes the global profile.

        Returns:
            ProfileWithTweetProperties: The global profile.
        """
        global_profile = ProfileWithTweetProperties()
        global_profile.set_public_metrics(0, 0, 0, 0)
        global_profile.set_username(GLOBAL_PROFILE_NAME)
        return global_profile

    def _compute_stats_for_all_profiles(self):
        """
        Computes tweet statistics for all profiles.
        """
        global_profile = self._init_global_profile()
        profiles = self._load_profiles()

        for profile in profiles:
            profile_stat = ProfileWithTweetProperties(as_json=profile)
            global_profile.merge_public_metrics(profile_stat)

            tweets = None
            if self._is_debug_mode:
                logging.debug(
                    f"Debug limit is set to True. Retrieving first 20 tweets from {profile_stat.get_username()} only"
                )
                tweets = list(
                    self._tweets_collection.find(
                        {"data.author_id": profile_stat.get_username()}
                    )
                    .sort("data.created_at", ASCENDING)
                    .limit(20)
                )
            else:
                logging.debug(
                    f"Retrieving all tweets from {profile_stat.get_username()} by date ascending"
                )
                tweets = list(
                    self._tweets_collection.find(
                        {"data.author_id": profile_stat.get_username()}
                    ).sort("data.created_at", ASCENDING)
                )

            profile_tweets = [Tweet(as_json=tweet) for tweet in tweets]
            profile_stat.build_stats(profile_tweets, is_sorted=True)

            # profiles are sorted but multiple profiles are not sorted with respect to each other.
            global_profile.build_stats(profile_tweets, is_sorted=False)

            self._profile_store[profile_stat.get_username()] = profile_stat

        self._profile_store[global_profile.get_username()] = global_profile

    def build(self):
        """
        Builds tweet statistics for all profiles.
        """
        self._compute_stats_for_all_profiles()

    def get_profile(self, username: str) -> ProfileWithTweetProperties:
        """
        Returns a profile.

        Args:
            username (str): The username of the profile.

        Returns:
            ProfileWithTweetProperties: The profile.
        """
        return self._profile_store[username]

    def get_all_profiles(self) -> dict[str, ProfileWithTweetProperties]:
        """
        Returns all profiles.

        Returns:
            dict[str, ProfileWithTweetProperties]: The dictionary of profiles.
        """
        return self._profile_store
