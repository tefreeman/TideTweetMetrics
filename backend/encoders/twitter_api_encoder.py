from abc import ABC, abstractmethod
from datetime import datetime
from enum import Enum
import pytz


class IncompleteBuildException(Exception):
    """Exception raised when building Twiiit object fails due all required fields not being set."""

    pass


class ReferencedTweetType(Enum):
    """
    Enum class representing the type of referenced tweet.

    The ReferencedTweetType enum class defines the different types of referenced tweets
    that can be associated with a tweet. The possible types are:

    - RETWEET: Represents a retweeted tweet.
    - QUOTED: Represents a quoted tweet.
    - REPLY: Represents a tweet that is a reply to another tweet.
    - NONE: Represents no referenced tweet.
    """

    RETWEET = "retweeted"
    QUOTED = "quoted"
    REPLY = "replied_to"
    NONE = "none"


# TODO: Add a MetaData class to store the metadata for the object
# instead of having to add it to the json object itself
# Should be able to attach itself to the raw json object


class DataEncoder(ABC):
    """
    Abstract base class for data encoders.

    This class provides a common interface for encoding and decoding data to and from JSON format.
    Subclasses must implement the abstract methods to define the specific encoding and decoding logic.

    Attributes:
        None

    Methods:
        to_json_dict: Converts the object to a JSON dictionary.
        changes_to_json_dict: Converts the changes made to the object to a JSON dictionary.
        from_json_dict: Converts a JSON dictionary to an object.
        changes_from_json_dict: Converts a JSON dictionary of changes to an object.

    """

    # Must not be overridden
    def to_json_dict(self) -> dict:
        """
        Converts the object to a JSON dictionary.

        Returns:
            A dictionary representing the object in JSON format.

        """
        return self._to_json_dict()

    def changes_to_json_dict(self) -> dict:
        """
        Converts the changes made to the object to a JSON dictionary.

        Returns:
            A dictionary representing the changes made to the object in JSON format.

        """
        return self._changes_to_json_dict()

    def from_json_dict(self, data: dict) -> dict:
        """
        Converts a JSON dictionary to an object.

        Args:
            data: A dictionary representing the object in JSON format.

        Returns:
            An object created from the JSON dictionary.

        """
        return self._from_json_dict(data)

    def changes_from_json_dict(self, data: dict) -> dict:
        """
        Converts a JSON dictionary of changes to an object.

        Args:
            data: A dictionary representing the changes made to the object in JSON format.

        Returns:
            An object with the changes applied.

        """
        return self._changes_from_json_dict()

    # These must be overridden

    @abstractmethod
    def _to_json_dict(self) -> dict:
        """
        Converts the object to a JSON dictionary.

        This method must be implemented by subclasses.

        Returns:
            A dictionary representing the object in JSON format.

        """
        raise NotImplementedError()

    @abstractmethod
    def _changes_to_json_dict(self) -> dict:
        """
        Converts the changes made to the object to a JSON dictionary.

        This method must be implemented by subclasses.

        Returns:
            A dictionary representing the changes made to the object in JSON format.

        """
        raise NotImplementedError()

    @abstractmethod
    def _from_json_dict(self, data: dict) -> dict:
        """
        Converts a JSON dictionary to an object.

        This method must be implemented by subclasses.

        Args:
            data: A dictionary representing the object in JSON format.

        Returns:
            An object created from the JSON dictionary.

        """
        raise NotImplementedError()

    @abstractmethod
    def _changes_from_json_dict(self, data: dict) -> dict:
        """
        Converts a JSON dictionary of changes to an object.

        This method must be implemented by subclasses.

        Args:
            data: A dictionary representing the changes made to the object in JSON format.

        Returns:
            An object with the changes applied.

        """
        raise NotImplementedError()
