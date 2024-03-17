from crawler.twitter_crawler import TwitterCrawler
from config import Config
import time
import json

'''
Config.init()
test = TwitterCrawler()
test.driver_load_page("https://twitter.com/BillGates")


time.sleep(10)


test.parse_tweets()

'''

with open('tweet_response.json') as json_file:
    example_tweet_res = json.load(json_file)
    tweets = example_tweet_res['data']['user']['result']['timeline_v2']['timeline']['instructions'][1]['entries']
    
    
    print(example_tweet_res)
