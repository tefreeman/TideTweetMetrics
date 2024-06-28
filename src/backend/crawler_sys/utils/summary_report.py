from threading import Lock
from backend.encoders.profile_encoder import Profile
from backend.encoders.tweet_encoder import Tweet
from backend.config import Config
import datetime


class SummaryReport:
    """
    A class that represents a summary report of tweet data.

    Attributes:
        _profiles_summary (dict): A dictionary that stores the summary of profiles and their added tweet count.
        _start_time (datetime): The start time of the summary report.
        _end_time (datetime): The end time of the summary report.
        _error_count (int): The count of errors encountered during the summary report.
        thread_faults (list): A list of thread faults encountered during the summary report.
        _lock (Lock): A lock to ensure thread safety.
    """

    def __init__(self):
        """
        Initializes a SummaryReport object.

        """
        self._profiles_summary = {}
        self._start_time = -1
        self._end_time = -1
        self._error_count = 0
        self.thread_faults = []
        self._lock = Lock()

    def get_tweet_count(self, username: str) -> int:
        """
        Returns the count of tweets added for a given username.

        Args:
            username (str): The username for which to retrieve the tweet count.

        Returns:
            int: The count of tweets added for the given username.

        """
        with self._lock:
            if username in self._profiles_summary:
                return self._profiles_summary[username]["added_tweet_count"]
            else:
                return 0

    def add_thread_fault(self, name: str, fault: str):
        """
        Adds a thread fault to the list of thread faults.

        Args:
            name (str): The name of the thread.
            fault (str): The description of the thread fault.

        """
        with self._lock:
            self.thread_faults.append({"name": name, "fault": fault})

    def add_errors(self, count: int):
        """
        Adds the count of errors to the error count.

        Args:
            count (int): The count of errors to be added.

        """
        with self._lock:
            self._error_count += count

    def set_start_time(self):
        """
        Sets the start time of the summary report.

        """
        self._start_time = datetime.datetime.now()

    def set_end_time(self):
        """
        Sets the end time of the summary report.

        """
        self._end_time = datetime.datetime.now()

    def add_data(self, profile: Profile, Tweets_result: list):
        """
        Adds profile and tweet data to the summary report.

        Args:
            profile (Profile): The profile object containing the profile data.
            Tweets_result (list): The list of tweet objects containing the tweet data.

        """
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
    def get_summary(self) -> dict:
        """
        Returns the summary report.

        Returns:
            dict: The summary report containing the results, start time, end time, backup zip ID, error count, and thread faults.

        Raises:
            Exception: If the summary times are not correctly set.

        """
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
