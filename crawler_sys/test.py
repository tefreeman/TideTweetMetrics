from crawler.twitter_crawler import TwitterCrawler
from config import Config
Config.init()
test = TwitterCrawler()
test.driver_load_page("https://twitter.com/elonmusk")

test.parse_profile()

print("done")