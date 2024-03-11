from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import urllib
import json





_default_tweet_target = {
            "id": {},
            "text": {"value": "css-1qaijid.r-bcqeeo.r-qvutc0.r-poiln3", "type": By.CSS_SELECTOR},
            "created_at": [{"value": "css-1rynq56 r-bcqeeo r-qvutc0 r-37j5jr r-a023e6 r-rjixqe r-16dba41 r-xoduu5 r-1q142lx r-1w6e6rj r-9aw3ui r-3s2u2q r-1loqt21", "type": By.CSS_SELECTOR},
                           {"value": "time", "type": By.TAG_NAME}
],
            "author_id": {"value": "css-1qaijid r-bcqeeo r-qvutc0 r-poiln3", "type": By.CSS_SELECTOR},
            "public_metrics": {
                
                },
            "entities": {},
            "attachments": {}
}
class Targeter:
    def __init__(self) -> None:
        self.tweet_target = {}
        self.profile_target = {}
        
    def save(self):
        pass
    
    def load_tweet_targets(self):
        self.tweet_target = {
            
        }

    def load_profile_targets(self):
        pass
    
class TwitterTargeter:
    pass