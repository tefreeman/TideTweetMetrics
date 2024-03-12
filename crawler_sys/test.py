from crawler.twitter_crawler import TwitterCrawler
from config import Config
import time

Config.init()
test = TwitterCrawler()
test.driver_load_page("https://twitter.com/BillGates")



