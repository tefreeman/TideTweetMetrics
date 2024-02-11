from abc import ABC, abstractmethod
from datetime import datetime
from enum import Enum
from typing import Dict
from config import Config
import pytz
from error_sys import Error

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
        raise NotImplementedError()

    def decode_changes_from_dict(self, data: Dict) -> dict:
        raise NotImplementedError()

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
    

class MetaData(DataEncoder):
    def __init__(self, as_json=None) -> None:
        
        self._object = {}
        self._errors: list[Error] = []
        
        if as_json != None:
            self._object = self.decode_from_dict(as_json)
            
    def get_created(self):
        return self._object["created"]

    def get_update_id(self):
        return self._object["uid"]

    def get_errors(self) -> list[Error]:
        return self._errors

    def get_version(self):
        return self._object["version"]

    def get_backup_file_id(self):
        return self._object["bfi"]

    def set_created(self, created: datetime):
        self._object["created"] = created

    def set_update_id(self, update_id):
        self._object["uid"] = update_id

    def set_errors(self, errors):
         self._errors = [error for error in errors if error != None]

    def set_version_to_current(self):
        self._object["version"] = Config.get_version()

    def set_backup_file_id(self, backup_file_id):
        self._object["bfi"] = backup_file_id

    def _decode_as_dict(self, data: dict) -> Dict:
        self._object = data 
    
    def _encode_as_dict(self):
        self._object["errors"] = [error.to_json() for error in self._errors]
        return self._object
    
    def _encode_changes_as_dict(self):
        return self._encode_as_dict()
    
class Tweet(DataEncoder):
    def __init__(self, as_json=None, changes_json=None) -> None:
        self._object = {}
        self._includes = {}
        self._meta = MetaData()
        self._set_fields = set()
        self._required_fields = {
            "id",
            "text",
            "created_at",
            "author_id",
            "public_metrics",
            "entities",
            "attachments",
        }

        if as_json != None:
            self.decode_from_dict(as_json)
        if changes_json != None:
            self.decode_changes_from_dict(changes_json)

    def ensure_required_fields_set(self):
        if not self._required_fields.issubset(self._set_fields):
            missing_fields = self._required_fields - self._set_fields
            raise IncompleteBuildException(
                f"Missing required fields before build: {missing_fields}"
            )
    def _decode_from_dict(self, data: Dict):
        self._object = data["data"]
        self._includes = data["includes"]
        self._meta = MetaData(data["meta"])
    
    def _encode_as_dict(self) -> Dict:
        self.ensure_required_fields_set()
        if "imeta" not in self._object:
            self._object["imeta"] = {}
        self._object["imeta"]["errors"] = []

        for error in self.errors:
            if error != None:
                self._object["imeta"]["errors"].append(error.to_json())

        return {"data": self._object, "includes": self._includes}

    def _encode_changes_as_dict(self) -> Dict:
        self.ensure_required_fields_set()
        metrics = self._object["public_metrics"]
        metrics["imeta"] = {"tweet_id": self.get_id()}
        metrics["timestamp"] = datetime.now()
        return metrics

    def set_id(self, id: str | None):
        self._object["id"] = id
        if id != None or id != "":
            self._set_fields.add("id")

    def get_id(self) -> str | None:
        return self._object["id"]

    def set_text(self, text: str):
        self._object["text"] = text
        self._set_fields.add("text")

    def get_text(self):
        return self._object["text"]

    def set_post_date(self, date: str):
        self._object["created_at"] = date
        if date != None and date != "":
            self._set_fields.add("created_at")

    def get_post_date(self):
        return self._object["created_at"]

    def get_post_date_as_epoch(self):
        date_format = "%b %d, %Y · %I:%M %p"
        parsed_date = datetime.strptime(
            self._object["created_at"].split(" UTC")[0], date_format
        )
        parsed_date = parsed_date.replace(tzinfo=pytz.UTC)
        return parsed_date.timestamp()

    def set_author(self, username: str):
        if username.startswith("@"):
            username = username[1:]
        self._object["author_id"] = username.lower()
        if username != None and username != "":
            self._set_fields.add("author_id")

    def get_author(self):
        return self._object["author_id"]

    def set_public_metrics(self, retweet_count, reply_count, like_count, quote_count):
        self._object["public_metrics"] = {}
        self._object["public_metrics"]["retweet_count"] = int(
            retweet_count.replace(",", "")
        )
        self._object["public_metrics"]["reply_count"] = int(
            reply_count.replace(",", "")
        )
        self._object["public_metrics"]["like_count"] = int(like_count.replace(",", ""))
        self._object["public_metrics"]["quote_count"] = int(
            quote_count.replace(",", "")
        )
        self._set_fields.add("public_metrics")

    def get_public_metrics(self):
        return self._object["public_metrics"]

    def set_entities(self, content_links, content_text: str):
        entities = {
            "annotations": [],
            "cashtags": [],
            "hashtags": [],
            "mentions": [],
            "urls": [],
        }
        for content_link in content_links:
            if content_link["text"][0] == "@":
                entities["mentions"].append(
                    {
                        "tag": content_link["text"][1:],
                        "start": content_text.find(content_link["text"]),
                        "end": content_text.find(content_link["text"])
                        + len(content_link["text"]),
                    }
                )
            elif content_link["text"][0] == "#":
                entities["hashtags"].append(
                    {
                        "tag": content_link["text"][1:],
                        "start": content_text.find(content_link["text"]),
                        "end": content_text.find(content_link["text"])
                        + len(content_link["text"]),
                    }
                )
            elif content_link["text"][0] == "$":
                entities["cashtags"].append(
                    {
                        "tag": content_link["text"][1:],
                        "start": content_text.find(content_link["text"]),
                        "end": content_text.find(content_link["text"])
                        + len(content_link["text"]),
                    }
                )
            else:
                display_url = content_link["text"]
                entities["urls"].append(
                    {
                        "url": content_link["href"],
                        "display_url": display_url,
                        "start": content_text.find(display_url),
                        "end": content_text.find(display_url) + len(display_url),
                    }
                )

        self._object["entities"] = entities
        self._set_fields.add("entities")

    def get_entities(self):
        return self._object["entities"]

    def set_attachments(self, photos, videos, cards):
        self._object["attachments"] = {}
        self._object["attachments"]["photos"] = photos
        self._object["attachments"]["videos"] = videos
        self._object["attachments"]["cards"] = cards
        self._set_fields.add("attachments")

    def get_attachments(self):
        return self._object["attachments"]

    def set_errors(self, errors):
        self._meta.set_errors(errors)

    # Version 2 of the Twitter API has a new field called "referenced_tweets" that can be set
    # For some reason this field is an array and an object in Twitter API docs
    # We will implement it as an object
    # https://developer.twitter.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-recent

    def set_refenced_tweet(self, referenced_tweet_id, tweet_type: ReferencedTweetType):
        if isinstance(tweet_type, ReferencedTweetType) == False:
            raise ValueError("tweet_type must be an instance of ReferencedTweetType")

        self._object["referenced_tweet"] = {}

        if tweet_type.value != "none":
            self._object["referenced_tweet"]["id"] = referenced_tweet_id
            self._object["referenced_tweet"]["type"] = tweet_type.value

        self._set_fields.add("referenced_tweet")

    def get_referenced_tweet(self):
        return self._object["referenced_tweet"]


class Profile(DataEncoder):
    def __init__(self, as_json=None, changes_json=None) -> None:
        self._object = {}
        self._set_fields = set()
        self._required_fields = {
            "name",
            "description",
            "username",
            "location",
            "url",
            "description",
            "verified",
            "created_at",
            "profile_image_url",
            "public_metrics",
        }

        if as_json != None:
            self.decode_from_dict(as_json)
        if changes_json != None:
            self.decode_changes_from_dict(changes_json)

    def raise_unless_required_fields_set(self):
        if not self._required_fields.issubset(self._set_fields):
            missing_fields = self._required_fields - self._set_fields
            raise IncompleteBuildException(
                f"Missing required fields before build: {missing_fields}"
            )

    def _encode_as_dict(self) -> Dict:
        self.raise_unless_required_fields_set()
        return self._object

    def _encode_changes_as_dict(self) -> Dict:
        self.raise_unless_required_fields_set()
        metrics = self._object["public_metrics"]
        metrics["imeta"] = {"username": self._object["username"]}
        metrics["timestamp"] = datetime.now()
        return metrics

    def set_name(self, name: str):
        self._object["name"] = name
        self._set_fields.add("name")

    def get_name(self):
        return self._object["name"]

    def set_username(self, username: str):
        if username.startswith("@"):
            username = username[1:]
        self._object["username"] = username.lower()
        if username != None and username != "":
            self._set_fields.add("username")

    def get_username(self):
        return self._object["username"]

    def set_description(self, description: str):
        self._object["description"] = description
        self._set_fields.add("description")

    def get_description(self):
        return self._object["description"]

    def set_location(self, location: str):
        self._object["location"] = location
        self._set_fields.add("location")

    def get_location(self):
        return self._object["location"]

    def set_url(self, url: str):
        self._object["url"] = url
        self._set_fields.add("url")

    def get_url(self):
        return self._object["url"]

    def set_verified(self, verified: bool):
        self._object["verified"] = verified
        self._set_fields.add("verified")

    def get_verified(self):
        return self._object["verified"]

    def set_created_at(self, created_at: str):
        self._object["created_at"] = created_at
        self._set_fields.add("created_at")

    def get_created_at(self):
        return self._object["created_at"]

    def set_profile_image_url(self, profile_image_url: str):
        self._object["profile_image_url"] = profile_image_url
        self._set_fields.add("profile_image_url")

    def get_profile_image_url(self):
        return self._object["profile_image_url"]

    def set_public_metrics(
        self, followers_count, following_count, tweet_count, like_count
    ):
        self._object["public_metrics"] = {}

        self._object["public_metrics"]["followers_count"] = int(
            followers_count.replace(",", "")
        )
        self._object["public_metrics"]["following_count"] = int(
            following_count.replace(",", "")
        )
        self._object["public_metrics"]["tweet_count"] = int(
            tweet_count.replace(",", "")
        )
        self._object["public_metrics"]["like_count"] = int(like_count.replace(",", ""))

        self._set_fields.add("public_metrics")

    def get_public_metrics(self):
        return self._object["public_metrics"]
