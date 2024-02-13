from scheduler import CrawlerScheduler
import database as db
from config import Config
from encoders.tweet_encoder import Tweet


Config.Load()

db.init_database()

accounts = db.get_crawl_list()
test = CrawlerScheduler(accounts, Config.crawler_threads())
test.start()


 