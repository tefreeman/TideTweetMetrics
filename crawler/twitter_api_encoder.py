from abc import ABC, abstractmethod
from datetime import datetime
from enum import Enum
from typing import Dict
import pytz


class IncompleteBuildException(Exception):
    """Exception raised when building Twiiit object fails due all required fields not being set."""
    pass

class ReferencedTweetType(Enum):
    RETWEET = 'retweeted'
    QUOTED = 'quoted'
    REPLY = 'replied_to'
    NONE = 'none'

class DataEncoder(ABC):
    # Must not be overriden
    def encode_as_dict(self, backup_file_id) -> Dict:
        if backup_file_id == None:
            raise ValueError("backup_file_id cannot be None")

        result = self._encode_as_dict()

        if "imeta" not in result:
            result["imeta"] = {}
        result["imeta"]["bfi"] = backup_file_id
        return result
    
    def encode_changes_as_dict(self, backup_file_id) -> Dict:
        if backup_file_id == None:
            raise ValueError("backup_file_id cannot be None")
        
        result = self._encode_changes_as_dict()

        if "imeta" not in result:
            result["imeta"] = {}
        result["imeta"]["bfi"] = backup_file_id
        return result
    
    # Must be overriden
    # Changes will be stored seperately should only be the metrics I think
    
    @abstractmethod
    def _encode_as_dict(self) -> Dict:
        raise NotImplementedError()
    
    @abstractmethod
    def _encode_changes_as_dict(self) -> Dict:
        raise NotImplementedError()


class Tweet(DataEncoder):
    def __init__(self) -> None:
        self.object = {}
        self.includes = {}
        self.set_fields = set()
        self.required_fields = {'id', 'text', 'created_at', 'author_id', 'public_metrics', 'entities', 'attachments'}


    def ensure_required_fields_set(self):
        if not self.required_fields.issubset(self.set_fields):
            missing_fields = self.required_fields - self.set_fields
            raise IncompleteBuildException(f"Missing required fields before build: {missing_fields}")
    
    def _encode_as_dict(self) -> Dict:
        self.ensure_required_fields_set()
        return {"data": self.object, "includes": self.includes}
    
    def _encode_changes_as_dict(self) -> Dict:
        self.ensure_required_fields_set()
        metrics = self.object["public_metrics"]
        metrics["imeta"] = {"tweet_id": self.get_id()}
        metrics["timestamp"] = datetime.now()
        return metrics
    

    def set_id(self, id: str | None):
        self.object["id"] = id
        if id != None or id != "":
            self.set_fields.add('id')
    
    def get_id(self) -> str | None:
        return self.object["id"]

    def set_text(self, text: str):
        self.object["text"] = text
        self.set_fields.add('text')

    def get_text(self):
        return self.object["text"]

    def set_post_date(self, date: str):
        self.object["created_at"] = date
        if date != None and date != "":
            self.set_fields.add('created_at')

    def get_post_date(self):
        return self.object["created_at"]
    
    def get_post_date_as_epoch(self):
        date_format = "%b %d, %Y · %I:%M %p"
        parsed_date = datetime.strptime(self.object["created_at"].split(' UTC')[0], date_format)
        parsed_date = parsed_date.replace(tzinfo=pytz.UTC)
        return parsed_date.timestamp()

    def set_author(self, username: str):
        if username.startswith("@"):
            username = username[1:]
        self.object["author_id"] =  username.lower()
        if username != None and username != "":
            self.set_fields.add('author_id')
    
    def get_author(self):
        return self.object["author_id"]

    def set_public_metrics(self, retweet_count, reply_count, like_count, quote_count):
        self.object["public_metrics"] = {}
        self.object["public_metrics"]["retweet_count"] = int(retweet_count.replace(',','') )
        self.object["public_metrics"]["reply_count"] = int(reply_count.replace(',',''))
        self.object["public_metrics"]["like_count"] = int(like_count.replace(',',''))
        self.object["public_metrics"]["quote_count"] = int(quote_count.replace(',',''))
        self.set_fields.add('public_metrics')

    def get_public_metrics(self):
        return self.object["public_metrics"]
    
    def set_entities(self, content_links, content_text: str):
        entities = {"annotations": [], "cashtags": [], "hashtags": [], "mentions": [], "urls": []}
        for content_link in content_links:
            if content_link["text"][0] == "@":
                entities["mentions"].append({"tag": content_link["text"][1:],
                                            "start": content_text.find(content_link["text"]),
                                            "end": content_text.find(content_link["text"]) + len(content_link["text"])})
            elif content_link["text"][0] == "#":
                entities["hashtags"].append({"tag": content_link["text"][1:],
                                    "start": content_text.find(content_link["text"]),
                                "end": content_text.find(content_link["text"]) + len(content_link["text"])})   
            elif content_link["text"][0] == "$":
                entities["cashtags"].append({"tag": content_link["text"][1:],
                            "start": content_text.find(content_link["text"]),
                        "end": content_text.find(content_link["text"]) + len(content_link["text"])})     
            else:
                display_url = content_link["text"]
                entities["urls"].append({"url": content_link["href"], "display_url": display_url, "start": content_text.find(display_url), "end": content_text.find(display_url) + len(display_url)})

        self.object["entities"] = entities
        self.set_fields.add('entities')

    def set_attachments(self, photos, videos):
        self.object["attachments"] = {}
        self.object["attachments"]["photos"] = photos
        self.object["attachments"]["videos"] = videos
        self.set_fields.add("attachments")

    def get_attachments(self):
        return self.object["attachments"]
    
    # Version 2 of the Twitter API has a new field called "referenced_tweets" that can be set
    # For some reason this field is an array and an object in Twitter API docs
    # We will implement it as an object
    # https://developer.twitter.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-recent

    def set_refenced_tweet(self, referenced_tweet_id, tweet_type: ReferencedTweetType):
        if isinstance(tweet_type, ReferencedTweetType) == False:
            raise ValueError("tweet_type must be an instance of ReferencedTweetType")
        
        self.object["referenced_tweet"] = {}
        
        if tweet_type.value != "none":
            self.object["referenced_tweet"]["id"] = referenced_tweet_id
            self.object["referenced_tweet"]["type"] = tweet_type.value
        
        self.set_fields.add("referenced_tweet")
    
    def get_referenced_tweet(self):
        return self.object["referenced_tweet"]


class Profile(DataEncoder):
    def __init__(self) -> None:
        self.object = {}
        self.set_fields = set()
        self.required_fields = {'name', 'description', 'username', 'location', 'url', 'description', 'verified', 'created_at', 'profile_image_url', 'public_metrics'}

    
    def raise_unless_required_fields_set(self):
        if not self.required_fields.issubset(self.set_fields):
            missing_fields = self.required_fields - self.set_fields
            raise IncompleteBuildException(f"Missing required fields before build: {missing_fields}")
        
    def _encode_as_dict(self) -> Dict:
        self.raise_unless_required_fields_set()
        return self.object
    
    def _encode_changes_as_dict(self) -> Dict:
        self.raise_unless_required_fields_set()   
        metrics =  self.object["public_metrics"]
        metrics["imeta"] = {"username": self.object["username"]}
        metrics["timestamp"] = datetime.now()
        return metrics
    
    def set_name(self, name: str):
        self.object["name"] = name
        self.set_fields.add('name')

    def get_name(self):
        return self.object["name"]
    
    def set_username(self, username: str):
        if username.startswith("@"):
            username = username[1:]
        self.object["username"] = username.lower()
        if username != None and username != "":
            self.set_fields.add('username')
    
    def get_username(self):
        return self.object["username"]
    
    def set_description(self, description: str):
        self.object["description"] = description
        self.set_fields.add('description')
    
    def get_description(self):
        return self.object["description"]
        
    def set_location(self, location: str):
        self.object["location"] = location
        self.set_fields.add('location')
    
    def get_location(self):
        return self.object["location"]
    
    def set_url(self, url: str):
        self.object["url"] = url
        self.set_fields.add('url')
    
    def get_url(self):
        return self.object['url']
    
    def set_description(self, description: str):
        self.object["description"] = description
        self.set_fields.add('description')
    
    def get_description(self):
        return self.object["description"]
        
    def set_verified(self, verified: bool):
        self.object["verified"] = verified
        self.set_fields.add('verified')
    
    def get_verified(self):
        return self.object["verified"]
    
    def set_created_at(self, created_at: str):
        self.object["created_at"] = created_at
        self.set_fields.add('created_at')

    def get_created_at(self):
        return self.object["created_at"]
        
    def set_profile_image_url(self, profile_image_url: str):
        self.object["profile_image_url"] = profile_image_url
        self.set_fields.add('profile_image_url')
    
    def get_profile_image_url(self):
        return self.object["profile_image_url"]
        
    def set_public_metrics(self, followers_count, following_count, tweet_count, like_count):
        self.object["public_metrics"] = {}
        
        self.object["public_metrics"]["followers_count"] = int(followers_count.replace(',','') )
        self.object["public_metrics"]["following_count"] = int(following_count.replace(',',''))
        self.object["public_metrics"]["tweet_count"] = int(tweet_count.replace(',',''))
        self.object["public_metrics"]["like_count"] = int(like_count.replace(',',''))
        
        self.set_fields.add('public_metrics')
    
    def get_public_metrics(self):
        return self.object["public_metrics"]