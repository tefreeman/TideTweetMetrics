from scheduler import CrawlerScheduler
import database as db

accounts = db.get_crawl_list()

test = CrawlerScheduler(accounts, 10)
test.start()

 