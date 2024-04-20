from threading import Lock
from backend.encoders.profile_encoder import Profile
from datetime import datetime
import time


class ProfileCache:
    """
    A class that represents a cache for storing user profiles.

    Attributes:
        _cache (dict): A dictionary to store the cached profiles.
        max_cache_size (int): The maximum size of the cache.
        _lock (Lock): A lock object to ensure thread safety.

    Methods:
        load_from_db(profiles): Loads profiles from the database into the cache.
        get_or_cache_profile(username): Retrieves a profile from the cache or caches it if not present.
    """

    def __init__(self, max_cache_size: int):
        """
        Initializes a ProfileCache object.

        Args:
            max_cache_size (int): The maximum size of the cache.
        """
        self._cache = {}
        self.max_cache_size = max_cache_size
        self._lock = Lock()

    def load_from_db(self, profiles: list[Profile]):
        """
        Loads profiles from the database into the cache.

        Args:
            profiles (list[Profile]): A list of profiles to be loaded into the cache.
        """
        for profile in profiles:
            self._cache[profile.get_username()] = None

    def get_or_cache_profile(self, username: str) -> bool:
        """
        Retrieves a profile from the cache or caches it if not present.

        Args:
            username (str): The username of the profile to retrieve or cache.

        Returns:
            bool: True if the profile is already in the cache, False otherwise.
        """
        if self._cache[username] is not None:
            return self._cache[username]

        if len(self._cache) >= self.max_cache_size:
            self._cache.popitem()

        self._cache[username] = time.time()

        return None
