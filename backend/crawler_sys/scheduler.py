import threading
import queue
from urllib.parse import urlparse
from crawler.twitter_crawler import TwitterCrawler
from crawler.crawler import Crawler  # hmmm
import time
from backend.crawler_sys.twitter_account_manager import TwitterAccountManager
from utils.summary_report import SummaryReport
import database as db
import utils.backup as Backup
from backend.config import Config
from utils.link_handler import LinkHandler
import logging

class CrawlerScheduler:
    def __init__(self, accounts: list[str], crawler_thread_count: int) -> None:
        self._account_manager = TwitterAccountManager()
        self._summary_report = SummaryReport()
        self._link_queue: queue.Queue[LinkHandler] = queue.Queue()
        self._crawler_thread_count = min(
            crawler_thread_count, len(accounts)
        )  # Can't have more threads than accounts

        if self._crawler_thread_count != crawler_thread_count:
            print(
                "Crawler count is greater than account count, reducing crawler count to account count"
            )

        [self._link_queue.put(LinkHandler(account)) for account in accounts]

        self._crawler_threads = []

    def start(self):
        self._summary_report.set_start_time()
        if self._crawler_thread_count == 1:
            self.run_crawler(TwitterCrawler())
        else:
            self._summary_report.set_start_time()
            for _ in range(self._crawler_thread_count):
                t = threading.Thread(target=self.run_crawler, args=(TwitterCrawler(),))
                t.start()
                self._crawler_threads.append(t)
                time.sleep(5)

            for t_ in self._crawler_threads:
                t_.join()

        self._summary_report.set_end_time()
        return self._summary_report.get_summary()

    def wait(self):
        time.sleep(Config.get_sleep_time())

    def run_crawler(self, crawler: Crawler):
        try:
 
            while not self._link_queue.empty():

                crawl_account = self._account_manager.get_account()
                crawler.init_driver_to_account(crawl_account)
                
                self.wait()

                page_link = self._link_queue.get()

                if page_link.failure_count() > Config.get_max_url_page_error():
                    self._link_queue.task_done()
                    continue

                
                page_link.set_domain("https://www.twitter.com")

                url = page_link.get()
                results = crawler.crawl(url, 35)

                if len(results["errors"]) > 0:
                    print(results["errors"])

                    # TODO error type detection and handling
                    self._account_manager.return_offline(crawl_account)

                    page_link.return_failure()
                    self._link_queue.put(page_link)
                    continue

                # alias: BFI
                # backup_file_id = Backup.back_up_html_file(
                #     results["raw_data"], results["profile"].get_username()
                # )
                backup_file_id = ""
                for tweet in results["tweets"]:
                    ref = tweet.get_meta_ref()
                    ref.set_backup_file_id(backup_file_id)
                    ref.set_domain(page_link.get_domain())

                profile_ref = results["profile"].get_meta_ref()
                profile_ref.set_backup_file_id(backup_file_id)
                profile_ref.set_domain(page_link.get_domain())

                tweets_result = db.upsert_tweets(results["tweets"])
                profile_result = db.upsert_twitter_profile(results["profile"])
                
                self._summary_report.add_data(results["profile"], tweets_result)
                self._link_queue.task_done()
                
                if crawl_account.needs_long_rest():
                    self._account_manager.return_offline(crawl_account)
                    break
                
        except Exception as e:
            logging.exception("ThreadFault")
            self._summary_report.add_thread_fault(e.__class__.__name__, str(e))
        finally:
            crawler.shutdown()
