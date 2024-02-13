from bson import ObjectId
from pymongo import MongoClient
from typing import TypedDict
from encoders.tweet_encoder import Tweet
from encoders.profile_encoder import Profile
import time
import datetime
from config import Config

client = None
db = None

def init_database():
    global client, db
    client = MongoClient(Config.db_host(), port=Config.db_port(), username=Config.db_user(), password=Config.db_password())
    db = client[Config.db_name()]



def get_crawl_list() -> list[str]:
    collection = db["crawl_list"]
    usernames = set()
    for user in collection.find():
        if not ("username" in user):
            raise Exception("username not inside user in crawl_list collection")

        usernames.add(user["username"])

    return list(usernames)


def get_crawl_history(acccount: str) -> list[str]:
    collection = db["crawl_history"]

    
def upsert_twitter_profile(profile: Profile):
    collection = db["profiles"]
    profile_updates_col = db["profile_updates"]
    
    db_profile = collection.find_one({"username": profile.get_username()})
    if db_profile != None:
        if db_profile["imeta"]["uid"] != None:
            update = profile_updates_col.find_one({"_id": ObjectId(db_profile["imeta"]["uid"])})
            if update != None:
                if update["timestamp"] > datetime.datetime.now() - datetime.timedelta(days=0):
                    return # aka no update
        return _update_profile(profile)

    profile.get_meta_ref().set_as_new()
    collection.insert_one(profile.to_json_dict())


def _update_profile(profile: Profile):
    profile_updates_col = db["profile_updates"]
    profile_col = db["profiles"]

    profile.get_meta_ref().set_as_update(profile.get_username())
    
    result = profile_updates_col.insert_one(
        profile.changes_to_json_dict()
    )
    profile_col.update_one(
        {"username": profile.get_username()},
        {"$set": {"imeta.uid": result.inserted_id}},
    )


def upsert_tweets(tweets: list[Tweet]):
    for tweet in tweets:
        upsert_tweet(tweet)


def upsert_tweet(tweet: Tweet):
    collection = db["tweets"]
    if collection.find_one({"data.id": tweet.get_id()}) != None:
        return _update_tweet(tweet)
    else:
        tweet.get_meta_ref().set_as_new()        
        collection.insert_one(tweet.to_json_dict())


def _update_tweet(tweet: Tweet):
    update_col = db["tweet_updates"]
    tweet_col = db["tweets"]
    
    tweet.get_meta_ref().set_as_update(tweet.get_id())
    result = update_col.insert_one(tweet.changes_to_json_dict())

    tweet_col.update_one(
        {"data.id": tweet.get_id()}, {"$set": {"imeta.uid": result.inserted_id}}
    )


def get_mirrors() -> list[dict]:
    collection = db["mirrors"]
    mirrors = []
    for mirror in collection.find():
        if not (
            "url" in mirror
            and "is_working" in mirror
            and "up_events" in mirror
            and "down_events" in mirror
        ):
            raise Exception(
                "mirror, is_working, up_events, or down_events not inside mirror in mirrors collection"
            )

        mirrors.append(mirror)

    return mirrors


def save_mirror(mirror: dict):
    collection = db["mirrors"]
    collection.replace_one({"url": mirror["url"]}, mirror, upsert=True)
