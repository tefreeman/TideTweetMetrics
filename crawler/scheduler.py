import threading
import queue
from urllib.parse import urlparse
from typing import Dict, List
from twiiit_crawler import Twiiit_Crawler, Crawler
import time
from twitter_mirrors_manager import TwitterMirrorManager
import database as db


class CrawlerScheduler:
    def __init__(self, accounts: List[str], crawler_count: int) -> None:
        self.mirror_manager = TwitterMirrorManager()
        self.account_queue: queue.Queue = queue.Queue()
        self.crawler_count = crawler_count
        [self.account_queue.put(account) for account in accounts]
    
                    
    
    def start(self):
        for _ in range(self.crawler_count):
            threading.Thread(target=self.run_crawler, args=(Twiiit_Crawler(),)).start()                
    
    @staticmethod
    def make_url(account: str, domain: str) -> str:
        return f"http://{domain}/{account}"
    
    def wait(self):
        time.sleep(5)      
    
    def run_crawler(self, crawler: Crawler):
        while not self.account_queue.empty():
           
            self.wait()
            
            account = self.account_queue.get()
            mirror = self.mirror_manager.get_mirror()
            domain = mirror["url"]
            
            url = CrawlerScheduler.make_url(account, domain)
           
            results = crawler.crawl(url)
            
            if results["error"]:
                self.mirror_manager.return_offline(mirror)
                self.account_queue.put(account)
                continue
            
            
            
            db_results = db.upsert_tweets(results["tweets"])
            
            profile_result = db.upsert_twitter_profile(results["profile"])
            
            if results["next_url"]:
                self.account_queue.put(results["next_url"])
               
            self.mirror_manager.return_online(mirror)
            self.account_queue.task_done()
        


'''
    def backup_raw_data(self, url: str) -> str:
        parsed_url = urlparse(url)
        last_url_part = parsed_url.path.split("/")[-1]
        filename = last_url_part + "-time-" + str(int(time.time()))
        fullpath = self.backup_raw_dir + "/" + filename
        
        with open(fullpath, "w", encoding="utf-8") as f:
            f.write(self.driver.page_source)

        return fullpath
'''  
    
    
test = CrawlerScheduler(["alabama_cs", "umichcse", "EECS_UTK", "OleMissCompSci", "gatech_scs", "LSUCSE", "UFCISE", "TulaneSSE", "MITEECS", "UAZScience", "CSatUSC"], 7)
test.start()