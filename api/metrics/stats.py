from pymongo import MongoClient
import numpy as np
import datetime


# Username Verification
def username_in_database(db, username):
    collection = db["profiles"]
    # If username is found, return true; else return false
    return collection.find_one({"username": username}) is not None


# crawl_list functions


## Return list of "username" from crawl_list collection
def get_crawl_list(db=None):
    if db is None:
        return "Error: No database specified in get_crawl_list() function"
    collection = db["profiles"]
    return [{"username": x["username"], "name": x["name"]} for x in collection.find({})]


## Return number of documents in crawl_list collection
def get_crawl_list_size(db=None):
    if db is None:
        return "Error: No database specified in get_crawl_list_size() function"
    collection = db["crawl_list"]
    return collection.count_documents({})


# profiles functions


def get_profiles(db=None, usernames=None):
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
    if db is None:
        raise Exception(
            "Error: No database specified in get_profiles_avg_followers_count() function"
        )
    collection = db["profiles"]

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


def _get_all_tweets_for_profile(db=None, username=None, time_period=None):
    if db is None:
        return "Error: No database specified in get_all_tweets_for_profile() function"

    tweets_collection = db["tweets"]
    if time_period is None:
        return tweets_collection.find({"data.author_id": username})
    else:
        tp = datetime.datetime.now() - datetime.timedelta(weeks=time_period)
        return tweets_collection.find(
            {"data.author_id": username, "data.created_at": {"$gte": tp}}
        )


def get_profile_tweet_metrics(db=None, username=None, time_period=None):
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
    if db is None:
        return "Error: No database specified in get_post_length_metric() function"

    profiles = get_profiles(db=db)

    post_lengths_metric = [{"likes": 0, "count": 0} for _ in range(500)]

    for profile in profiles:
        tweets = _get_all_tweets_for_profile(
            db=db, username=profile["username"], time_period=time_period
        )
        for tweet in tweets:
            # Fix the indexing logic
            index = min(len(tweet["data"]["text"]), 499)
            post_lengths_metric[index]["likes"] += tweet["data"]["public_metrics"][
                "like_count"
            ]
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

        # Calculate likes divided by count for each range, avoiding division by zero
        metric = total_likes / total_count if total_count else 0

        # Construct the key representing the range
        if i + step_size >= 500:
            key = f"{i}+"
        else:
            key = f"{i}-{i+step_size-1}"

        results[key] = {"avg_likes": metric, "count": total_count}

    return results


### NOTES:
"""
- Given username and number n (return a dictionary of stuff)
  - Get average public metrics over last n tweets
  - Get average "" over last n days
  - Same, but get a percentage of all the stuff OVER followers
- 
"""

# Main function (for testing purposes)
if __name__ == "__main__":
    client = MongoClient(
        "73.58.28.154",
        port=27017,
        username="Admin",
        password="***REMOVED***",
    )
    db = client["twitter_v2"]

    # print(get_avg_likes())
    # print(get_crawl_list(db))  # working
    # print(get_crawl_list_size(db))  # working
    # print(get_profile_name(db, "csce_uark"))  # working
    # print(get_profile_name(db))  # working
    # print(get_profile_description(db, "csce_uark"))  # working
    # print(get_profile_created_at(db, "csce_uark"))  # working
    # print(get_profile_location(db, "csce_uark"))  # working
    # print(get_profile_verified(db, "csce_uark"))  # working
    # print(get_profile_url(db, "csce_uark"))  # working
    # print(get_profile_followers_count(db, "csce_uark"))  # working
    # print(get_profile_following_count(db, "csce_uark"))  # working
    # print(get_profile_tweet_count(db, "csce_uark"))  # working
    # print(get_profile_like_count(db, "csce_uark"))  # working
    # print(get_profiles_avg_followers_count(db, ["csce_uark", "novaengineer"]))  # working
    # print(
    #     get_profiles_avg_following_count(db, ["csce_uark", "novaengineer"])
    # )  # working
    # print(get_profiles_avg_tweet_count(db, ["csce_uark", "novaengineer"]))  # working
    # print(get_profiles_avg_like_count(db, ["csce_uark", "novaengineer"]))  # working
    # print(get_profiles_avg_followers_count(db))  # working
    # print(get_profiles_avg_following_count(db))  # working
    # print(get_profiles_avg_tweet_count(db))  # working
    # print(get_profiles_avg_like_count(db))  # working
    # print(get_profile_info(db, "csce_uark"))  # working
