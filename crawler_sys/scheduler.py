import threading
import queue
from urllib.parse import urlparse
from typing import Dict, List
from crawler.twiiit_crawler import Twiiit_Crawler
from crawler.crawler import Crawler #hmmm
import time
from twitter_mirrors_manager import TwitterMirrorManager
from utils.summary import Summary
import database as db
import os
from datetime import datetime
import utils.backup as Backup
from utils.error_sys import Error
from config import Config

class PageLink:
    def __init__(self, page_url: str) -> None:
        self._page_url = page_url
        self._in_use = False
        self._failures = 0
    
    def get(self) -> str:
        if self._in_use:
            raise Exception("PageLink is in use")
        self._in_use = True
        return self._page_url
    
    def failure_count(self) -> int:
        return self._failures
    
    def return_failure(self):
        self._in_use = False
        self._failures += 1
    
class CrawlerScheduler:
    def __init__(self, accounts: List[str], crawler_count: int) -> None:
        self.mirror_manager = TwitterMirrorManager()
        self.summary = Summary()
        self.account_queue: queue.Queue[PageLink] = queue.Queue()
        self.crawler_count = min(crawler_count, len(accounts)) # Can't have more threads than accounts

        [self.account_queue.put(PageLink(account)) for account in accounts]
        
        self.crawler_threads = []
    
                    
    
    def start(self):
        self.summary.set_start_time()
        if self.crawler_count == 1:
            self.run_crawler(Twiiit_Crawler())
        else:
            self.summary.set_start_time()
            for _ in range(self.crawler_count):
                t = threading.Thread(target=self.run_crawler, args=(Twiiit_Crawler(),))
                t.start()
                t.join()
                self.crawler_threads.append(t)
                
        self.summary.set_end_time()    
        return self.summary.get_summary()         
                
    @staticmethod
    def make_url(account: str, domain: str) -> str:
        return f"http://{domain}/{account}"
    
    def wait(self):
        time.sleep(Config.get_sleep_time())      

    def run_crawler(self, crawler: Crawler):
        try:
            while not self.account_queue.empty():
                self.wait()
                
                account = self.account_queue.get()
                
                if account.failure_count() > Config.get_max_url_page_error():
                    self.account_queue.task_done()
                    continue
                
                mirror = self.mirror_manager.get_mirror()
                domain = mirror["url"]
                
                url = CrawlerScheduler.make_url(account.get(), domain)
            
                results = crawler.crawl(url)
                
                if len(results["errors"]) > 0:
                    print(results["errors"])
                    
                    #TODO error type detection and handling
                    self.mirror_manager.return_offline(mirror)
                    
                    account.return_failure() 
                    self.account_queue.put(account)
                    continue
            
                # alias: BFI
                backup_file_id = Backup.back_up_html_file(results["raw_data"], results["profile"].get_username())
                
                for tweet in results["tweets"]:
                    tweet.get_meta_ref().set_backup_file_id(backup_file_id)
                
                results["profile"].get_meta_ref().set_backup_file_id(backup_file_id)
                
                tweets_result = db.upsert_tweets(results["tweets"])
                profile_result = db.upsert_twitter_profile(results["profile"])
                
                self.summary.add_data(results["profile"], tweets_result)
                
                if results["next_url"]:
                    self.account_queue.put(PageLink(results["next_url"]))
                
                self.mirror_manager.return_online(PageLink(mirror))
                self.account_queue.task_done()
        except Exception as e:
            print("!------THREAD FAULT-------!")
            print(e)
            self.summary.add_thread_fault(e.__class__.__name__, str(e))
        finally:  
            crawler.shutdown()



    
    