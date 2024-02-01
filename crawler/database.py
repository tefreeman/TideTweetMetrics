from pymongo import MongoClient
from typing import List
from twitter_api_encoder import TweetEncoder, ProfileEncoder

#ask for external ip
client = MongoClient('10.0.0.28', port=27017, username='Admin', password='We420?Z4!')
db = client["twitter"]


def get_crawl_list() -> List[str]:
    pass

def get_crawl_history(acccount:str ) -> List[str]:
    pass

def add_twitter_profile(profile: ProfileEncoder):
    pass
    
def add_tweets(tweets: List[TweetEncoder]):
    pass
