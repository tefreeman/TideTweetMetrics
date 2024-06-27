from backend.crawler_sys.scheduler import CrawlerScheduler
import database as db
from backend.config import Config
from time import sleep

from utils.backup import (
    compress_backups,
    remove_backup_files,
    check_if_raw_backup_exists,
)


def crawl_job():
    """
    This function is responsible for running the crawl job.
    It initializes the configuration, initializes the database,
    retrieves the accounts to crawl from the database, and starts
    the crawler scheduler. Finally, it adds the crawl summary to
    the database.

    :return: None
    """
    print("running crawl job")
    Config.init()
    db.init_database()

    # if check_if_raw_backup_exists():
    #     print(
    #         "Raw backup exists, (maybe error) compressing and removing raw backup files."
    #     )
    #     compress_backups()
    #     remove_backup_files()
    accounts = db.get_crawl_list()
    crawl_scheduler = CrawlerScheduler(accounts, Config.crawler_threads())
    summary_results = crawl_scheduler.start()
    db.add_crawl_summary(summary_results)
    # compress_backups()
    # remove_backup_files()


"""
schedule.every().day.at("19:04").do(crawl_job,)
while True:
    schedule.run_pending()
    time.sleep(10)
"""
