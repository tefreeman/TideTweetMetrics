from pymongo import MongoClient
from twitter_api_encoder import TweetEncoder, ProfileEncoder

#ask for external ip
client = MongoClient('10.0.0.28', port=27017, username='Admin', password='We420?Z4!')
db = client["twitter"]


def get_crawl_list() -> list[str]:
    collection = db["crawl_list"]

def get_crawl_history(acccount:str ) -> list[str]:
    pass




def upsert_twitter_profile(profile: ProfileEncoder):
    collection = db["profiles"]
    
def upsert_tweets(tweets: list[TweetEncoder]):
    collection = db["tweets"]


def get_mirrors() -> list[dict]:
    collection = db["mirrors"]

def save_mirror(mirror: dict):
    collection = db["mirrors"]