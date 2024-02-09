from scheduler import CrawlerScheduler
import database as db

accounts = db.get_crawl_list()

test = CrawlerScheduler(accounts, 8)
test.start()

 