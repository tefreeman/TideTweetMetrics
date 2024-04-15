"""
random_tweet.py

This module provides functions for retrieving random tweets from specified databases and updating user responses.

Functions:
    - get_rand_tweet: Retrieves a random tweet from the specified educational and non-educational databases.
    - set_rand_tweet: Sets a random tweet for a user response and updates the user response database.
    - get_user_responses_cnt: Retrieves the count of user responses from the specified database.

Usage:
    - Import this module into your project to access the defined functions for retrieving random tweets and updating user responses.

Example:
    - To retrieve a random tweet and update user responses:
        ```
        random_tweet = get_rand_tweet(edu_db, non_edu_db)
        set_rand_tweet(edu_db, non_edu_db, update_db, tweet_id, is_edu, uid)
        ```
"""

import random
import logging

tweets = []
in_use = []

def get_rand_tweet(db_edu=None, db_non_edu=None):

    """Retrieves a random tweet from the database."""
    
    if id == None:
        logging.error("Error: No id specified in get_random_tweet() function")
        return "Error: No id specified in get_random_tweet() function"
    if db_edu is None or db_non_edu is None:
        logging.error("Error: No database specified in get_random_tweet() function")
        return "Error: No database specified in get_random_tweet() function"
    if len(tweets) < 100:
        edu_col = db_edu["tweets"]
        non_edu_col = db_non_edu["tweets"]
        pipeline = [
            {"$match": {"$expr": {"$gt": [{"$strLenCP": "$data.text"}, 8]}}},
            {"$sample": {"size": 250}}
        ]
        edu_tweets = list(edu_col.aggregate(pipeline))
        non_edu_tweets = list(non_edu_col.aggregate(pipeline))
        for tweet in edu_tweets:
            tweet["type"] = "edu"
        for tweet in non_edu_tweets:
            tweet["type"] = "nedu"
        tweets.extend(edu_tweets)
        tweets.extend(non_edu_tweets)
    if len(in_use) < 50:
        logging.debug("less than 50 tweets in use. Fetching a new one")
        tweet = tweets.pop(random.randint(0, len(tweets) - 1))
        tweet["count"] = 1
        del tweet["_id"]
        del tweet["data"]["created_at"]
        del tweet["imeta"]
        in_use.append(tweet)
        return tweet
    else:
        logging.debug("At least 50 tweets in use. Fetching one already in use")
        num = random.randint(0, len(in_use) - 1)
        tweet = in_use[num]
        tweet["count"] += 1
        if tweet["count"] == 4:
            in_use.pop(num)
        return tweet

def set_rand_tweet(edu_db=None, db_non_edu=None, update_db="user_responses", id=None, is_edu_bool=None, uid=None):
    """Sets a random tweet for a user."""
    if id == None:
        logging.error("Error: No id specified in set_random_tweet() function")
        return "Error: No id specified in set_random_tweet() function"
    if is_edu_bool == None:
        logging.error("Error: No is_edu_bool specified in set_random_tweet() function")
        return "Error: No is_edu_bool specified in set_random_tweet() function"
    if uid == None:
        logging.error("Error: No uid specified in set_random_tweet() function")
        return "Error: No uid specified in set_random_tweet() function"
    logging.db("Updating db with results")
    collection = update_db["results"]
    result = collection.insert_one({"uid": uid, "tweet_id": id, "is_edu": is_edu_bool})
    return get_rand_tweet(edu_db, db_non_edu)

def get_user_responses_cnt(db=None):
    """Retrieves the count of user responses."""
    if db is None:
        logging.error("Error: No database specified in get_user_responses_count() function")
        return "Error: No database specified in get_user_responses_count() function"
    collection = db["results"]
    return collection.count_documents({})