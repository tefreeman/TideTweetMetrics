from scheduler import CrawlerScheduler
import database as db
from config import Config
from encoders.tweet_encoder import Tweet


Config.init()
db.init_database()

accounts = ["alabama_cs"]
test = CrawlerScheduler(accounts, Config.crawler_threads())
test.start()


 