from pymongo import MongoClient
import numpy as np


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


## Return full name from profile, given username
def get_profile_name(db=None, username=None):
    if db is None:
        return "Error: No database specified in get_profile_name() function"
    collection = db["profiles"]
    if username is None:
        # Return the names from all the profiles
        return [x["name"] for x in collection.find({})]
    if not username_in_database(db, username):
        return "Error: Username not found in database"
    return collection.find_one({"username": username})["name"]


## Return description from profile, given username
def get_profile_description(db=None, username=None):
    if db is None:
        return "Error: No database specified in get_profile_description() function"
    collection = db["profiles"]
    if username is None:
        # Return the descriptions from all the profiles
        return [x["description"] for x in collection.find({})]
    if not username_in_database(db, username):
        return "Error: Username not found in database"

    return collection.find_one({"username": username})["description"]


## Return created_at from profile, given username
def get_profile_created_at(db=None, username=None):
    if db is None:
        return "Error: No database specified in get_profile_created_at() function"
    collection = db["profiles"]
    if username is None:
        # Return the created_at from all the profiles
        return [x["created_at"] for x in collection.find({})]
    if not username_in_database(db, username):
        return "Error: Username not found in database"

    return collection.find_one({"username": username})["created_at"]


## Return location from profile, given username
def get_profile_location(db=None, username=None):
    if db is None:
        return "Error: No database specified in get_profile_location() function"
    collection = db["profiles"]
    if username is None:
        # Return the locations from all the profiles
        return [x["location"] for x in collection.find({})]
    if not username_in_database(db, username):
        return "Error: Username not found in database"

    return collection.find_one({"username": username})["location"]


## Return verified status (boolean converted to string) from profile, given username
def get_profile_verified(db=None, username=None):
    if db is None:
        return "Error: No database specified in get_profile_verified() function"
    collection = db["profiles"]
    if username is None:
        # Return the verified statuses from all the profiles
        return [str(x["verified"]) for x in collection.find({})]
    if not username_in_database(db, username):
        return "Error: Username not found in database"

    return str(collection.find_one({"username": username})["verified"])


## Return url from profile, given username
def get_profile_url(db=None, username=None):
    if db is None:
        return "Error: No database specified in get_profile_url() function"
    collection = db["profiles"]
    if username is None:
        # Return the urls from all the profiles
        return [x["url"] for x in collection.find({})]
    if not username_in_database(db, username):
        return "Error: Username not found in database"

    return collection.find_one({"username": username})["url"]


## Functions for public_metrics of profile
### Return follwers_count from public_metrics from profile, given username
def get_profile_followers_count(db=None, username=None):
    if db is None:
        return "Error: No database specified in get_profile_followers_count() function"
    collection = db["profiles"]
    if username is None:
        # Return the number of followers from all the profiles
        return [x["public_metrics"]["followers_count"] for x in collection.find({})]
    if not username_in_database(db, username):
        return "Error: Username not found in database"

    return collection.find_one({"username": username})["public_metrics"][
        "followers_count"
    ]


### Return following_count from public_metrics from profile, given username
def get_profile_following_count(db=None, username=None):
    if db is None:
        return "Error: No database specified in get_profile_following_count() function"
    collection = db["profiles"]
    if username is None:
        # Return the number of following from all the profiles
        return [x["public_metrics"]["following_count"] for x in collection.find({})]
    if not username_in_database(db, username):
        return "Error: Username not found in database"
    return collection.find_one({"username": username})["public_metrics"][
        "following_count"
    ]


### Return tweet_count from public_metrics from profile, given username
def get_profile_tweet_count(db=None, username=None):
    if db is None:
        return "Error: No database specified in get_profile_tweet_count() function"
    collection = db["profiles"]
    if username is None:
        # Return the number of tweets from all the profiles
        return [x["public_metrics"]["tweet_count"] for x in collection.find({})]
    if not username_in_database(db, username):
        return "Error: Username not found in database"
    return collection.find_one({"username": username})["public_metrics"]["tweet_count"]


### Return like_count from public_metrics from profile, given username
def get_profile_like_count(db=None, username=None):
    if db is None:
        return "Error: No database specified in get_profile_like_count() function"
    collection = db["profiles"]
    if username is None:
        # Return the number of likes from all the profiles
        return [x["public_metrics"]["like_count"] for x in collection.find({})]
    if not username_in_database(db, username):
        return "Error: Username not found in database"
    return collection.find_one({"username": username})["public_metrics"]["like_count"]


### Given a list of usernames, return the average followers_count
def get_profiles_avg_followers_count(db=None, usernames=None):
    if db is None:
        return "Error: No database specified in get_profiles_avg_followers_count() function"
    collection = db["profiles"]
    if usernames is None:
        # Return the average followers_count OVER all the profiles
        profile_data = collection.find({})
        followers_counts = []
        for profile in profile_data:
            followers_counts.append(profile["public_metrics"]["followers_count"])
        return np.average(followers_counts)

    followers = []
    for user in usernames:
        followers.append(
            collection.find_one({"username": user})["public_metrics"]["followers_count"]
        )
    return np.average(followers)


### Given a list of usernames, return the average following_count
def get_profiles_avg_following_count(db=None, usernames=None):
    if db is None:
        return "Error: No database specified in get_profiles_avg_following_count() function"
    collection = db["profiles"]
    if usernames is None:
        # Return the average following_count OVER all the profiles
        profile_data = collection.find({})
        following_counts = []
        for profile in profile_data:
            following_counts.append(profile["public_metrics"]["following_count"])
        return np.average(following_counts)
    # For each username, verify that it exists in the profile collection
    for user in usernames:
        if not username_in_database(db, user):
            return "Error: Username ", user, " not found in database"
    following = []
    for user in usernames:
        following.append(
            collection.find_one({"username": user})["public_metrics"]["following_count"]
        )
    return np.average(following)


### Given a list of usernames, return the average tweet_count
def get_profiles_avg_tweet_count(db=None, usernames=None):
    if db is None:
        return "Error: No database specified in get_profiles_avg_tweet_count() function"
    collection = db["profiles"]
    if usernames is None:
        # Return the average tweet_count OVER all the profiles
        profile_data = collection.find({})
        tweet_counts = []
        for profile in profile_data:
            tweet_counts.append(profile["public_metrics"]["tweet_count"])
        return np.average(tweet_counts)
    # For each username, verify that it exists in the profile collection
    for user in usernames:
        if not username_in_database(db, user):
            return "Error: Username ", user, " not found in database"
    tweets = []
    for user in usernames:
        tweets.append(
            collection.find_one({"username": user})["public_metrics"]["tweet_count"]
        )
    return np.average(tweets)


### Given a list of usernames, return the average like_count
def get_profiles_avg_like_count(db=None, usernames=None):
    if db is None:
        return "Error: No database specified in get_profiles_avg_like_count() function"
    collection = db["profiles"]
    if usernames is None:
        # Return the average like_count OVER all the profiles
        profile_data = collection.find({})
        like_counts = []
        for profile in profile_data:
            like_counts.append(profile["public_metrics"]["like_count"])
        return np.average(like_counts)
    # For each username, verify that it exists in the profile collection
    for user in usernames:
        if not username_in_database(db, user):
            return "Error: Username ", user, " not found in database"
    likes = []
    for user in usernames:
        likes.append(
            collection.find_one({"username": user})["public_metrics"]["like_count"]
        )
    return np.average(likes)


## Return a dictionary with all the information from a profile, given username
def get_profile_info(db=None, username=None):
    if db is None:
        return {"Error": "Error: No database specified in get_profile_info() function"}
    if username is None:
        return {"Error": "Error: No username specified in get_profile_info() function"}
    # If username is not found in the database, return an error
    if not username_in_database(db, username):
        return {"Error": "Error: Username not found in database"}
    collection = db["profiles"]
    name = collection.find_one({"username": username})["name"]
    description = collection.find_one({"username": username})["description"]
    created_at = collection.find_one({"username": username})["created_at"]
    location = collection.find_one({"username": username})["location"]
    verified = str(collection.find_one({"username": username})["verified"])
    url = collection.find_one({"username": username})["url"]
    followers_count = collection.find_one({"username": username})["public_metrics"][
        "followers_count"
    ]
    following_count = collection.find_one({"username": username})["public_metrics"][
        "following_count"
    ]
    tweet_count = collection.find_one({"username": username})["public_metrics"][
        "tweet_count"
    ]
    like_count = collection.find_one({"username": username})["public_metrics"][
        "like_count"
    ]
    return {
        "username": username,
        "name": name,
        "description": description,
        "created_at": created_at,
        "location": location,
        "verified": verified,
        "url": url,
        "followers_count": followers_count,
        "following_count": following_count,
        "tweet_count": tweet_count,
        "like_count": like_count,
    }


### Given a list of usernames, return all average data
def get_profiles_averages(db=None, usernames=None):
    if db is None:
        return "Error: No database specified in get_profiles_avg_followers_count() function"
    collection = db["profiles"]
    if usernames is None:
        # Return averages over ALL the profiles
        profile_data = collection.find({})
        (
            followers_counts,
            following_counts,
            tweet_counts,
            total_like_counts,
            avg_likes,
            avg_likes_per_follower
        ) = ([], [], [], [], [], [])
        for profile in profile_data:
            followers_counts.append(profile["public_metrics"]["followers_count"])
            following_counts.append(profile["public_metrics"]["following_count"])
            tweet_counts.append(profile["public_metrics"]["tweet_count"])
            total_like_counts.append(profile["public_metrics"]["like_count"])
            if profile["public_metrics"]["tweet_count"] != 0:
                avg_likes.append(
                    profile["public_metrics"]["like_count"]
                    / profile["public_metrics"]["tweet_count"]
                )
            if profile["public_metrics"]["followers_count"] != 0 and profile["public_metrics"]["tweet_count"] != 0:
                avg_likes_per_follower.append(
                    profile["public_metrics"]["like_count"]
                    / profile["public_metrics"]["tweet_count"]
                    / profile["public_metrics"]["followers_count"]
                )

    else:
        # For each username, verify that it exists in the profile collection
        for user in usernames:
            if not username_in_database(db, user):
                return "Error: Username ", user, " not found in database"
        (
            followers_counts,
            following_counts,
            tweet_counts,
            total_like_counts,
            avg_likes,
            avg_likes_per_follower
        ) = ([], [], [], [], [], [])
        
        for username in usernames:
            user = collection.find_one({"username": username})
            followers_counts.append(
                user["public_metrics"]["followers_count"]
            )
            following_counts.append(
                user["public_metrics"][
                    "following_count"
                ]
            )
            tweet_counts.append(
                user["public_metrics"]["tweet_count"]
            )
            total_like_counts.append(
                user["public_metrics"]["like_count"]
            )
            if user["public_metrics"]["tweet_count"] != 0:
                avg_likes.append(
                    user["public_metrics"]["like_count"] / user["public_metrics"]["tweet_count"]
                )
            if user["public_metrics"]["tweet_count"] != 0 and user["public_metrics"]["followers_count"]!= 0:
                avg_likes_per_follower.append(
                   user["public_metrics"]["like_count"] / user["public_metrics"]["tweet_count"] / user["public_metrics"]["followers_count"]
                )

    if len(avg_likes) == 0:
        avg_likes = [0]

    return {
        "followers_count": np.average(followers_counts),
        "following_count": np.average(following_counts),
        "tweet_count": np.average(tweet_counts),
        "total_like_count": np.average(total_like_counts),
        "avg_likes": np.average(avg_likes),
        "avg_likes_per_follower": np.average(avg_likes_per_follower)
    }

def get_all_profile_averages(db):
    profiles = get_crawl_list(db=db)
    profiles = [x["username"] for x in profiles]
    accounts_data = {}
    for profile in profiles:
        accounts_data[profile] = get_profiles_averages(db=db, usernames=[profile])
    return accounts_data

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
    print(get_profiles_averages(db, ["csce_uark", "novaengineer"]))
