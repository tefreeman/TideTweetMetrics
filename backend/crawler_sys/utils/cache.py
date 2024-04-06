from threading import Lock
from encoders.profile_encoder import Profile
from datetime import datetime
import time


class ProfileCache:
    def __init__(self, max_cache_size: int):
        self._cache = {}
        self.max_cache_size = max_cache_size
        self._lock = Lock()

    def load_from_db(self, profiles: list[Profile]):
        for profile in profiles:
            self._cache[profile.get_username()] = None

    def get_or_cache_profile(self, username: str) -> bool:
        if self._cache[username] != None:
            return self._cache[username]

        if len(self._cache) >= self.max_cache_size:
            self._cache.popitem()

        self._cache[username] = time.time()

        return None
