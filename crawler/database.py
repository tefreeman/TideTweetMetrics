from pymongo import MongoClient

# from twitter_api_encoder import TweetEncoder, ProfileEncoder

# ask for external ip

client = MongoClient("mongodb://Admin:We420%3FZ4!@73.58.28.154:27017/")

db = client["twitter"]

print("hello world")


def get_crawl_list() -> list[str]:
    collection = db["crawl_list"]


def get_crawl_history(acccount: str) -> list[str]:
    pass


# def upsert_twitter_profile(profile: ProfileEncoder):
#     collection = db["profiles"]


# def upsert_tweets(tweets: list[TweetEncoder]):
#     collection = db["tweets"]


def get_mirrors() -> list[dict]:
    collection = db["mirrors"]


def save_mirror(mirror: dict):
    collection = db["mirrors"]
