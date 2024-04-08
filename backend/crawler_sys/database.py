from bson import ObjectId
from pymongo import MongoClient
from backend.encoders.tweet_encoder import Tweet
from backend.encoders.profile_encoder import Profile
import datetime
from backend.config import Config

client = None
db = None


def init_database(name=None):
    global client, db
    client = MongoClient(
        Config.db_host(),
        port=Config.db_port(),
        username=Config.db_user(),
        password=Config.db_password(),
    )
    db_name = Config.db_name() if name == None else name
    db = client[db_name]

    collection_names = db.list_collection_names()
    if len(collection_names) == 0:
        _init_collections()


def _init_collections():
    old_db = client["twitter"]

    db.create_collection("crawl_list")
    crawl_list = old_db["crawl_list"].find({})
    for user in crawl_list:
        db["crawl_list"].insert_one(user)

    db.create_collection("mirrors")
    mirror_list = old_db["mirrors"].find({})
    for mirror in mirror_list:
        mirror["up_events"] = 0
        mirror["down_events"] = 0
        mirror["is_working"] = True
        db["mirrors"].insert_one(mirror)

    db.create_collection("profiles")
    db.create_collection("tweets")

    db["tweets"].create_index([("data.id", 1)], unique=True)
    db["profiles"].create_index([("username", 1)], unique=True)

    db.create_collection(
        "profile_updates",
        timeseries={
            "timeField": "timestamp",
            "metaField": "imeta",
            "granularity": "hours",
        },
    )
    db.create_collection(
        "tweet_updates",
        timeseries={
            "timeField": "timestamp",
            "metaField": "imeta",
            "granularity": "hours",
        },
    )


def get_crawl_list() -> list[str]:
    collection = db["crawl_list"]
    usernames = set()
    for user in collection.find():
        if not ("username" in user):
            raise Exception("username not inside user in crawl_list collection")

        usernames.add(user["username"])

    return list(usernames)


def add_crawl_summary(summary: dict):
    collection = db["crawl_summaries"]
    collection.insert_one(summary)


def get_crawl_history(acccount: str) -> list[str]:
    collection = db["crawl_history"]


def upsert_twitter_profile(profile: Profile):
    collection = db["profiles"]
    profile_updates_col = db["profile_updates"]

    db_profile = collection.find_one({"username": profile.get_username()})
    if db_profile != None:
        if db_profile["imeta"]["uid"] != None:
            update = profile_updates_col.find_one(
                {"_id": ObjectId(db_profile["imeta"]["uid"])}
            )
            if update != None:
                if update["timestamp"] > datetime.datetime.now() - datetime.timedelta(
                    hours=Config.get_profile_min_update_time_hours()
                ):
                    return None
        return _update_profile(profile)

    profile.get_meta_ref().set_as_new()
    return collection.insert_one(profile.to_json_dict())


def _update_profile(profile: Profile):
    profile_updates_col = db["profile_updates"]
    profile_col = db["profiles"]

    profile.get_meta_ref().set_as_update(profile.get_username())

    result = profile_updates_col.insert_one(profile.changes_to_json_dict())
    profile_col.update_one(
        {"username": profile.get_username()},
        {"$set": {"imeta.uid": result.inserted_id}},
    )
    return result


def upsert_tweets(tweets: list[Tweet]) -> list[ObjectId]:
    results = [upsert_tweet(tweet) for tweet in tweets]
    return results


def upsert_tweet(tweet: Tweet):
    collection = db["tweets"]
    if collection.find_one({"data.id": tweet.get_id()}) != None:
        return _update_tweet(tweet).inserted_id
    else:
        tweet.get_meta_ref().set_as_new()
        return collection.insert_one(tweet.to_json_dict()).inserted_id


def _update_tweet(tweet: Tweet):
    update_col = db["tweet_updates"]
    tweet_col = db["tweets"]

    tweet.get_meta_ref().set_as_update(tweet.get_id())
    result = update_col.insert_one(tweet.changes_to_json_dict())

    tweet_col.update_one(
        {"data.id": tweet.get_id()}, {"$set": {"imeta.uid": result.inserted_id}}
    )

    return result


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
