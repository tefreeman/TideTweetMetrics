"""
stats.py

This module contains functions for calculating various Twitter metrics.

Functions:
    - username_in_database: Checks if a username exists in the database.
    - get_crawl_list: Retrieves a list of usernames from the crawl list collection.
    - get_crawl_list_size: Retrieves the number of documents in the crawl list collection.
    - get_profiles: Retrieves profile documents for specified usernames.
    - get_avg_profile_data: Retrieves average public metric values for specified profiles.
    - get_profile_tweet_metrics: Retrieves tweet metrics for a given username.
    - get_all_profile_tweet_metrics: Retrieves tweet metrics for all profiles within a specified time period.
    - get_post_length_metric: Explores correlation between tweet length and tweet performance.

Usage:
    - See individual function docstrings for usage examples.
"""

from pymongo import MongoClient
import numpy as np
import datetime

def username_in_database(db, username):
    """Checks if a username exists in the database."""
    collection = db["profiles"]
    return collection.find_one({"username": username}) is not None

def get_crawl_list(db=None):
    """Retrieves a list of usernames from the crawl list collection."""
    if db is None:
        return "Error: No database specified in get_crawl_list() function"
    collection = db["profiles"]
    return [{"username": x["username"], "name": x["name"]} for x in collection.find({})]

def get_crawl_list_size(db=None):
    """Retrieves the number of documents in the crawl list collection."""
    if db is None:
        return "Error: No database specified in get_crawl_list_size() function"
    collection = db["crawl_list"]
    return collection.count_documents({})

def get_profiles(db=None, usernames=None):
    """Retrieves profile documents for specified usernames."""
    if db is None:
        return "Error: No database specified in get_profile_name() function"
    collection = db["profiles"]

    if usernames is None:
        return list(collection.find({}))

    user_profiles = []
    for username in usernames:
        user_profile = collection.find_one({"username": username})
        if user_profile is None:
            return "Error: Username not found in database"

        user_profiles.append(user_profile)

    return user_profiles

def get_avg_profile_data(db=None, usernames=None):
    """Retrieves average public metric values for specified profiles."""
    if db is None:
        raise Exception("Error: No database specified in get_profiles_avg_followers_count() function")

    profiles = get_profiles(db=db, usernames=usernames)

    following_cnt = 0
    followers_cnt = 0
    tweets_cnt = 0
    likes_cnt = 0

    for profile in profiles:
        following_cnt += profile["public_metrics"]["following_count"]
        followers_cnt += profile["public_metrics"]["followers_count"]
        tweets_cnt += profile["public_metrics"]["tweet_count"]
        likes_cnt += profile["public_metrics"]["like_count"]

    return {
        "following_count": following_cnt / len(profiles),
        "followers_count": followers_cnt / len(profiles),
        "tweet_count": tweets_cnt / len(profiles),
        "like_count": likes_cnt / len(profiles),
    }

def get_profile_tweet_metrics(db=None, username=None, time_period=None):
    """Retrieves tweet metrics for a given username."""
    if db is None:
        return "Error: No database specified in get_profile_name() function"

    tweets_cursor = _get_all_tweets_for_profile(
        db=db, username=username, time_period=time_period
    )

    total_retweets_count = 0
    total_reply_count = 0
    total_like_count = 0
    total_quote_count = 0
    tweet_count = 0

    for tweet in tweets_cursor:
        tweet_count += 1
        total_retweets_count += tweet["data"]["public_metrics"]["retweet_count"]
        total_reply_count += tweet["data"]["public_metrics"]["reply_count"]
        total_like_count += tweet["data"]["public_metrics"]["like_count"]
        total_quote_count += tweet["data"]["public_metrics"]["quote_count"]

    if tweet_count == 0:
        return {
            "avg_retweet_count": 0,
            "avg_reply_count": 0,
            "avg_like_count": 0,
            "avg_quote_count": 0,
        }
    return {
        "avg_retweet_count": total_retweets_count / tweet_count,
        "avg_reply_count": total_reply_count / tweet_count,
        "avg_like_count": total_like_count / tweet_count,
        "avg_quote_count": total_quote_count / tweet_count,
    }

def get_all_profile_tweet_metrics(db=None, time_period=None):
    """Retrieves tweet metrics for all profiles within a specified time period."""
    if db is None:
        return "Error: No database specified in get_profile_name() function"

    profiles = get_profiles(db=db)

    metrics = []
    for profile in profiles:
        tweet_metrics = get_profile_tweet_metrics(
            db=db, username=profile["username"], time_period=time_period
        )
        tweet_metrics["username"] = profile["username"]
        metrics.append(tweet_metrics)

    return metrics

def get_post_length_metric(db=None, time_period=None):
    """Explores correlation between tweet length and tweet performance."""
    if db is None:
        return "Error: No database specified in get_post_length_metric() function"

    profiles = get_profiles(db=db)

    post_lengths_metric = [{"likes": 0, "count": 0} for _ in range(500)]

    for profile in profiles:
        tweets = _get_all_tweets_for_profile(
            db=db, username=profile["username"], time_period=time_period
        )
        for tweet in tweets:
            index = min(len(tweet["data"]["text"]), 499)
            post_lengths_metric[index]["likes"] += tweet["data"]["public_metrics"]["like_count"]
            post_lengths_metric[index]["count"] += 1

    results = {}
    step_size = 50
    for i in range(0, 500, step_size):
        total_likes = sum(
            item["likes"] for item in post_lengths_metric[i : i + step_size]
        )
        total_count = sum(
            item["count"] for item in post_lengths_metric[i : i + step_size]
        )

        metric = total_likes / total_count if total_count else 0

        if i + step_size >= 500:
            key = f"{i}+"
        else:
            key = f"{i}-{i+step_size-1}"

        results[key] = {"avg_likes": metric, "count": total_count}

    return results
