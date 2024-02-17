from threading import Lock
from encoders.profile_encoder import Profile
from encoders.tweet_encoder import Tweet
from config import Config
import datetime


class SummaryReport:
    def __init__(self):
        self._profiles_summary = {}
        self._start_time = -1
        self._end_time = -1
        self._error_count = 0
        self.thread_faults = []
        self._lock = Lock()

    def get_tweet_count(self, username: str) -> int:
        with self._lock:
            if username in self._profiles_summary:
                return self._profiles_summary[username]["added_tweet_count"]
            else:
                return 0

    def add_thread_fault(self, name: str, fault: str):
        with self._lock:
            self.thread_faults.append({"name": name, "fault": fault})

    def add_errors(self, count: int):
        with self._lock:
            self._error_count += count

    def set_start_time(self):
        self._start_time = datetime.datetime.now()

    def set_end_time(self):
        self._end_time = datetime.datetime.now()

    def add_data(self, profile: Profile, Tweets_result: list):
        with self._lock:
            if profile.get_username() not in self._profiles_summary:
                self._profiles_summary[profile.get_username()] = {
                    "added_tweet_count": len(Tweets_result),
                }
            else:
                self._profiles_summary[profile.get_username()][
                    "added_tweet_count"
                ] += len(Tweets_result)

    # TODO: fix possible threading issues (not sure if this could cause them)
    def get_summary(self):
        if self._start_time == -1 or self._end_time == -1:
            raise Exception("Summary times not correctly set")

        return {
            "results": self._profiles_summary,
            "start_time": self._start_time,
            "end_time": self._end_time,
            "zid": Config.next_run_backup_zip_id(),
            "error_count": self._error_count,
            "thread_faults": self.thread_faults,
        }
