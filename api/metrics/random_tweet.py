import random

tweets = []

in_use = []


def get_rand_tweet(db_edu=None, db_non_edu=None):
    if id == None:
        return "Error: No id specified in get_random_tweet() function"
    if db_edu is None or db_non_edu is None:
        return "Error: No database specified in get_random_tweet() function"
    if len(tweets) < 100:
        edu_col = db_edu["tweets"]
        non_edu_col = db_non_edu["tweets"]
        # Aggregation pipeline to get a random document
        pipeline = [
            {
                "$match": {
                    "$expr": {
                        "$gt": [{"$strLenCP": "$data.text"}, 8]
                    }
                }
            },
            { '$sample': { 'size': 250 } }
        ]

        edu_tweets = list(edu_col.aggregate(pipeline))
        non_edu_tweets = list(non_edu_col.aggregate(pipeline))
        
        for tweet in edu_tweets:
            tweet["type"] = "edu"
        
        for tweet in non_edu_tweets:
            tweet["type"] = "nedu"
    
        tweets.extend(edu_tweets)
        tweets.extend(non_edu_tweets)
        
    # If no tweets are in use, get a random tweet from the list
    if len(in_use) < 50:
        tweet = tweets.pop(random.randint(0, len(tweets) - 1))
        tweet["count"] = 1
        del tweet["_id"]
        del tweet["data"]["created_at"]
        del tweet["imeta"]
        in_use.append(tweet)
        return tweet
    else:
        num = random.randint(0, len(in_use) - 1)
        tweet = in_use[num]
        tweet["count"] += 1
        
        if tweet["count"] == 4:
            in_use.pop(num)
        return tweet


def set_rand_tweet(edu_db=None, db_non_edu= None, update_db= "user_responses", id=None, is_edu_bool=None, uid=None):
        if id == None:
            return "Error: No id specified in set_random_tweet() function"
        if is_edu_bool == None:
            return "Error: No is_edu_bool specified in set_random_tweet() function"

        if uid == None:
            return "Error: No uid specified in set_random_tweet() function"
        
        collection = update_db["results"]
        result = collection.insert_one({"uid": uid, "tweet_id": id, "is_edu": is_edu_bool})
        
        return get_rand_tweet(edu_db, db_non_edu)

def get_user_responses_cnt(db=None):
    if db is None:
        return "Error: No database specified in get_user_responses_count() function"
    collection = db["results"]
    return collection.count_documents({})