from typing import Dict, List
from twiiit_crawler import Twiiit_Crawler, Crawler
import time

class CrawlerScheduler:
    def __init__(self, accounts: List[str]) -> None:
        self.accounts = accounts
        self.crawler: Crawler = Twiiit_Crawler()
        
    def get_next_profile(self):
        return self.accounts.pop()

    def wait(self):
        time.sleep(10)      
    
    def run(self):
        while len(self.accounts) > 0:
            account = self.get_next_profile()
            self.crawler.crawl(account, time.time()-60*60*24*30*12, True)
            self.wait()



        
    

test = CrawlerScheduler(["alabama_cs"])
test.run()