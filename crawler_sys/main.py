from scheduler import CrawlerScheduler
import database as db
from config import Config
from encoders.tweet_encoder import Tweet
from utils.backup import compress_backups, remove_backup_files, check_if_raw_backup_exists
import schedule
import time


def crawl_job():
    print("running crawl job")
    Config.init()
    db.init_database()
    
    if check_if_raw_backup_exists():
        print("Raw backup exists, (maybe error) compressing and removing raw backup files.")
        compress_backups()
        remove_backup_files()
    accounts = db.get_crawl_list()
    crawl_scheduler = CrawlerScheduler(accounts, Config.crawler_threads())
    summary_results = crawl_scheduler.start()
    db.add_crawl_summary(summary_results)
    compress_backups()
    remove_backup_files()


crawl_job()

'''
schedule.every().day.at("19:04").do(crawl_job,)
while True:
    schedule.run_pending()
    time.sleep(10)
'''

 