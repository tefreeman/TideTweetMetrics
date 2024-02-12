from abc import ABC, abstractmethod
from datetime import datetime
from enum import Enum
from typing import Dict
from config import Config
import pytz
from crawler_sys.utils.error_sys import Error

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
    # Must not be overriden
    def encode_as_dict(self) -> Dict:
        return self._encode_as_dict()

    def encode_changes_as_dict(self, backup_file_id) -> Dict:
        return self._encode_changes_as_dict()

    def decode_from_dict(self, data: Dict) -> dict:
        return self._decode_as_dict(data)

    def decode_changes_from_dict(self, data: Dict) -> dict:
        return self._decode_changes_as_dict()

    # These must be overridden


    @abstractmethod
    def _decode_as_dict(self) -> Dict:
        raise NotImplementedError()
    
    @abstractmethod
    def _decode_changes_as_dict(self) -> Dict:
        raise NotImplementedError()
    
    @abstractmethod
    def _encode_as_dict(self) -> Dict:
        raise NotImplementedError()
    
    @abstractmethod
    def _encode_changes_as_dict(self) -> Dict:
        raise NotImplementedError()

