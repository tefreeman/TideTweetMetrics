from crawler.twitter_crawler import TwitterCrawler
from config import Config

import time

Config.init()
test = TwitterCrawler()
test.driver_load_page("https://twitter.com/BillGates")
time.sleep(2)
test.parse_profile()

print("done")