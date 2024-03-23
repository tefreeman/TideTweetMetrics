from pymongo import MongoClient
from datetime import datetime

# Your input string

def to_datetime(date_string):
    return datetime.strptime(date_string, "%b %d, %Y · %I:%M %p %Z")


client = MongoClient(
    "73.58.28.154",
    port=27017,
    username="Admin",
    password="***REMOVED***",
    )

db = client["twitter_v2"]

tweet_col = db["tweets"]


tweets = tweet_col.find({})

for tweet in tweets:
    tweet["data"]["created_at"] = to_datetime(tweet["data"]["created_at"])
    tweet_col.update_one({"_id": tweet["_id"]}, {"$set": tweet})
