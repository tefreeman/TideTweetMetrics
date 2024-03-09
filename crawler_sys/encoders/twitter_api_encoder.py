from abc import ABC, abstractmethod
from datetime import datetime
from enum import Enum
from config import Config
import pytz
from utils.error_sys import Error


class IncompleteBuildException(Exception):
    """Exception raised when building Twiiit object fails due all required fields not being set."""

    pass


class ReferencedTweetType(Enum):
    RETWEET = "retweeted"
    QUOTED = "quoted"
    REPLY = "replied_to"
    NONE = "none"


# TODO: Add a MetaData class to store the metadata for the object
# instead of having to add it to the json object itself
# Should be able to attach itself to the raw json object


class DataEncoder(ABC):
    
    def __init__(self):
        self._required_fields = None
        
    # Must not be overriden
    def to_json_dict(self) -> dict:
        return self._to_json_dict()

    def changes_to_json_dict(self) -> dict:
        return self._changes_to_json_dict()

    def from_json_dict(self, data: dict) -> dict:
        return self._from_json_dict(data)

    def changes_from_json_dict(self, data: dict) -> dict:
        return self._changes_from_json_dict()

    def get_fields(self):
        if self._required_fields is None:
            raise Error("Required fields not set")
        
        return self._required_fields

    # These must be overridden

    @abstractmethod
    def _to_json_dict(self) -> dict:
        raise NotImplementedError()

    @abstractmethod
    def _changes_to_json_dict(self) -> dict:
        raise NotImplementedError()

    @abstractmethod
    def _from_json_dict(self, data: dict) -> dict:
        raise NotImplementedError()

    @abstractmethod
    def _changes_from_json_dict(self, data: dict) -> dict:
        raise NotImplementedError()
