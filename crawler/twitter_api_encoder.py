from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict
import pytz


class IncompleteBuildException(Exception):
    """Exception raised when building Twiiit object fails due all required fields not being set."""
    pass


class DataEncoder(ABC):
    # Must not be overriden
    def build(self) -> Dict:
        result = self._build()
        
        return result
    
    # Must be overriden
    @abstractmethod
    def _build(self) -> Dict:
        raise NotImplementedError()



class TweetEncoder(DataEncoder):
    def __init__(self) -> None:
        pass
    
    def _build(self) -> Dict:
        return {}
    

    def set_text(self, text: str):
        pass

    def get_text(self):
        pass
    

    def set_post_date(self, date: str):
        pass

    def get_post_date(self):
       pass
    
    def get_post_date_as_epoch(self):
        pass

    def set_author(self, username: str):
        pass

    def set_public_metrics(self, retweet_count, reply_count, like_count, quote_count):
        pass
    
    
    def set_entities(self, content_links, content_text: str):
        pass

    def set_attachments(self, photos, videos):
        pass




class ProfileEncoder(DataEncoder):
    def __init__(self) -> None:
        pass
    def _build(self) -> Dict:
        return {}
    
    def set_name(self, name: str):
        pass
    
    def set_description(self, description: str):
        pass
        
    def set_screen_name(self, screen_name: str):
        pass
        
    def set_location(self, location: str):
        pass
    
    def set_url(self, url: str):
        pass
    
    def description(self, description: str):
        pass
        
    def set_verified(self, verified: bool):
        pass
    
    def set_created_at(self, created_at: str):
        pass
        
    def set_profile_image_url(self, profile_image_url: str):
        pass
        
    def set_public_metrics(self, followers_count, following_count, tweet_count, like_count):
        pass