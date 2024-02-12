#from scheduler import CrawlerScheduler
#import database as db
from config import Config
from encoders.tweet_encoder import Tweet


Config.Load()

tweet = {
    "data": {
    "id": "123",
    "text": "Hello world",
    "created_at": "2021-10-10",
    "author_id": "123",
    "conversation_id": "123",
    "in_reply_to_user_id": "123",
    "lang": "en",
    "public_metrics": {
        "retweet_count": 1,
        "reply_count": 1,
        "like_count": 1,
        "quote_count": 1
    }
    },
    "includes": [],
    "imeta": {
        "created": "2021-10-10",
        "update_id": "123",
        "errors": [{"name": "TimeoutException"}],
        "version": 1
    }
}

test =  Tweet(tweet)
print(test)
'''
db.init_database()

accounts = db.get_crawl_list()
test = CrawlerScheduler(accounts, Config.crawler_threads())
test.start()

'''
 