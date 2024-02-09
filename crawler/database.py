from bson import ObjectId
from pymongo import MongoClient
from typing import TypedDict
from twitter_api_encoder import Tweet, Profile
import time
import datetime

client = MongoClient("10.0.0.28", port=27017, username="Admin", password="We420?Z4!")
db = client["twitter"]


def attach_new_tweet_meta(obj: dict):
    if "imeta" not in obj:
        obj["imeta"] = {}

    obj["imeta"]["created"] = datetime.datetime.now()
    obj["imeta"]["update_id"] = None
    obj["imeta"]["errors"] = []
    obj["imeta"]["version"] = 1


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

    
def upsert_twitter_profile(profile: Profile, backup_file_id: int):
    collection = db["profiles"]
    profile_updates_col = db["profile_updates"]
    
    db_profile = collection.find_one({"username": profile.get_username()})
    if db_profile != None:
        if db_profile["imeta"]["update_id"] != None:
            update = profile_updates_col.find_one({"_id": ObjectId(db_profile["imeta"]["update_id"])})
            if update != None:
                if update["timestamp"] > datetime.datetime.now() - datetime.timedelta(days=1):
                    return # aka no update
        return _update_profile(profile, backup_file_id)

    profile_json = profile.encode_as_dict(backup_file_id)
    attach_new_tweet_meta(profile_json)
    collection.insert_one(profile_json)


def _update_profile(profile: Profile, backup_file_id: int):
    profile_updates_col = db["profile_updates"]
    profile_col = db["profiles"]

    result = profile_updates_col.insert_one(
        profile.encode_changes_as_dict(backup_file_id)
    )
    profile_col.update_one(
        {"username": profile.get_username()},
        {"$set": {"imeta.update_id": result.inserted_id}},
    )


def upsert_tweets(tweets: list[Tweet], backup_file_id: int):
    for tweet in tweets:
        upsert_tweet(tweet, backup_file_id)


def upsert_tweet(tweet: Tweet, backup_file_id):
    collection = db["tweets"]
    if collection.find_one({"data.id": tweet.get_id()}) != None:
        return _update_tweet(tweet, backup_file_id)
    else:
        tweet_as_json = tweet.encode_as_dict(backup_file_id)
        attach_new_tweet_meta(tweet_as_json)
        collection.insert_one(tweet_as_json)


def _update_tweet(tweet: Tweet, backup_file_id: int):
    update_col = db["tweet_updates"]
    tweet_col = db["tweets"]
    result = update_col.insert_one(tweet.encode_changes_as_dict(backup_file_id))

    tweet_col.update_one(
        {"data.id": tweet.get_id()}, {"$set": {"imeta.update_id": result.inserted_id}}
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
