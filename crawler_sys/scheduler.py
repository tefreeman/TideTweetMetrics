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
from utils.page_link import PageLink

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
                self.crawler_threads.append(t)
            
            for t_ in self.crawler_threads:
                t_.join()
                
        self.summary.set_end_time()    
        return self.summary.get_summary()         
                
    
    def wait(self):
        time.sleep(Config.get_sleep_time())      

    def run_crawler(self, crawler: Crawler):
        try:
            while not self.account_queue.empty():
                self.wait()
                
                page_link = self.account_queue.get()
                
                if page_link.failure_count() > Config.get_max_url_page_error():
                    self.account_queue.task_done()
                    continue
                
                mirror = self.mirror_manager.get_mirror()
                page_link.set_domain(mirror["url"])
                
                url = page_link.get()
                results = crawler.crawl(url)
                
                if len(results["errors"]) > 0:
                    print(results["errors"])
                    
                    #TODO error type detection and handling
                    self.mirror_manager.return_offline(mirror)
                    
                    page_link.return_failure() 
                    self.account_queue.put(page_link)
                    continue
            
                # alias: BFI
                backup_file_id = Backup.back_up_html_file(results["raw_data"], results["profile"].get_username())
                
                for tweet in results["tweets"]:
                    ref = tweet.get_meta_ref()
                    ref.set_backup_file_id(backup_file_id)
                    ref.set_domain(page_link.get_domain())
                
                profile_ref = results["profile"].get_meta_ref()
                profile_ref.set_backup_file_id(backup_file_id)
                profile_ref.set_domain(page_link.get_domain())
                
                tweets_result = db.upsert_tweets(results["tweets"])
                profile_result = db.upsert_twitter_profile(results["profile"])
                
                self.summary.add_data(results["profile"], tweets_result)
                
                continue_bool = self.summary.get_tweet_count(results["profile"].get_username()) < Config.max_profile_tweet_crawl_depth()
                if results["next_url"] and continue_bool:
                    self.account_queue.put(PageLink(results["next_url"]))
                
                self.mirror_manager.return_online(mirror)
                self.account_queue.task_done()
        except Exception as e:
            print("!------THREAD FAULT-------!")
            print(e)
            self.summary.add_thread_fault(e.__class__.__name__, str(e))
        finally:  
            crawler.shutdown()



    
    