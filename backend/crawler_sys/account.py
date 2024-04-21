from selenium import webdriver
from selenium.webdriver.common.by import By
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import logging
import random
from datetime import datetime, timedelta

_MAX_TWEETS_PER_DAY = 35
_MAX_TWEETS_PER_MIN = 30


class Account:
    def __init__(
        self, username: str, password: str, is_working: bool, lifetime_views: int
    ) -> None:
        """
        Initialize an Account object.

        Args:
            username (str): The username of the account.
            password (str): The password of the account.
            is_working (bool): Indicates whether the account is currently working.
            lifetime_views (int): The total number of views the account has accumulated.

        Returns:
            None
        """
        self.username = username
        self.password = password

        self.is_working = is_working
        self.lifetime_views = lifetime_views

        # Stats for the current session
        # [datetime, tweets_viewed]
        self.session_tweets_view_stats = []
        self.start_time = None

        self.total_updates = 0  # Count of updates
        self.avg_batch_size = 0  # Average batch size

    def get_minute_rest_time(self) -> int:
        """
        Determines how long to rest to keep the tweet viewing rate close to 30 tweets per minute.

        Returns:
            int: The extra rest time in seconds.
        """
        now = time.time()
        one_minute_ago = now - 60

        # Filter the tweet views in the last minute
        tweets_in_last_minute = sum(
            views
            for timestamp, views in self.session_tweets_view_stats
            if timestamp >= one_minute_ago
        )

        over_target_amount = tweets_in_last_minute - _MAX_TWEETS_PER_MIN
        extra_rest_time = 0

        if over_target_amount > 0:
            extra_rest_time = over_target_amount * 2
        else:
            extra_rest_time = max(0, (abs(over_target_amount) * 2) - 10)

        return extra_rest_time

    def get_time_working(self) -> float:
        """
        Get the amount of time the account has been working.

        Returns:
            float: The time in seconds.
        """
        return time.time() - self.start_time

    def start(self):
        """
        Start the account's session.

        Returns:
            None
        """
        self.start_time = time.time()

    def get_chrome_profile(self) -> str:
        """
        Get the Chrome profile associated with the account.

        Returns:
            str: The Chrome profile.
        """
        return self.username

    def get_username(self) -> str:
        """
        Get the username of the account.

        Returns:
            str: The username.
        """
        return self.username

    def get_password(self) -> str:
        """
        Get the password of the account.

        Returns:
            str: The password.
        """
        return self.password

    def update_tweets_viewed(self, tweets_viewed: int) -> None:
        """
        Update the number of tweets viewed by the account.

        Args:
            tweets_viewed (int): The number of tweets viewed.

        Returns:
            None
        """
        current_time = time.time()
        self.session_tweets_view_stats.append((current_time, tweets_viewed))
        self.lifetime_views += tweets_viewed
        self.total_updates += 1
        self.avg_batch_size = (
            self.avg_batch_size * (self.total_updates - 1) + tweets_viewed
        ) / self.total_updates

    def needs_long_rest(self) -> bool:
        """
        Check if the account needs a long rest based on the daily view limit.

        Returns:
            bool: True if the account needs a long rest, False otherwise.
        """
        # Check daily limit
        today = datetime.now()
        daily_views = sum(
            views
            for timestamp, views in self.session_tweets_view_stats
            if datetime.fromtimestamp(timestamp).date() == today.date()
        )
        if daily_views + self.avg_batch_size > _MAX_TWEETS_PER_DAY:
            return False
        else:
            return True

    def to_dict(self) -> dict:
        """
        Convert the Account object to a dictionary.

        Returns:
            dict: The Account object as a dictionary.
        """
        return {
            "username": self.username,
            "password": self.password,
            "is_working": self.is_working,
            "lifetime_views": self.lifetime_views,
        }
