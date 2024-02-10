import threading
import queue
from urllib.parse import urlparse
from typing import Dict, List
from twiiit_crawler import Twiiit_Crawler
from crawler import Crawler
import time
from twitter_mirrors_manager import TwitterMirrorManager
import database as db
import os
from datetime import datetime
import backup as Backup

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
        self.account_queue: queue.Queue[PageLink] = queue.Queue()
        self.crawler_count = crawler_count

        [self.account_queue.put(PageLink(account+"sfsd")) for account in accounts]
        
        self.crawler_threads = []
    
                    
    
    def start(self):
        if self.crawler_count == 1:
            self.run_crawler(Twiiit_Crawler())
        else:
            for _ in range(self.crawler_count):
                self.crawler_threads.append(threading.Thread(target=self.run_crawler, args=(Twiiit_Crawler(),)).start())                
    
    @staticmethod
    def make_url(account: str, domain: str) -> str:
        return f"http://{domain}/{account}"
    
    def wait(self):
        time.sleep(8)      

    def run_crawler(self, crawler: Crawler):
        while not self.account_queue.empty():
           
            self.wait()
            
            account = self.account_queue.get()
            
            if account.failure_count() > 3:
                self.account_queue.task_done()
                continue
            
            mirror = self.mirror_manager.get_mirror()
            domain = mirror["url"]
            
            url = CrawlerScheduler.make_url(account.get(), domain)
           
            results = crawler.crawl(url)
            
            if results["error"]:
                self.mirror_manager.return_offline(mirror)
                
                account.return_failure() 
                self.account_queue.put(account)
                continue
            
            
            backup_file_id = Backup.backup_raw_data(results["raw_data"], results["profile"].get_username())
            
            
            db_results = db.upsert_tweets(results["tweets"], backup_file_id)
            profile_result = db.upsert_twitter_profile(results["profile"], backup_file_id)
            
            if results["next_url"]:
                self.account_queue.put(results["next_url"])
               
            self.mirror_manager.return_online(mirror)
            self.account_queue.task_done()
        




    
    