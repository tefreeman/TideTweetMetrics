from typing import List, Dict, Tuple, TypedDict
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from twitter_api_encoder import Tweet, Profile
from urllib.parse import urlparse
import database as db
from driver import create_undetected_driver
import time
from selenium.common.exceptions import WebDriverException


class CrawlResults(TypedDict):
    profile: Profile
    tweets: List[Tweet]
    raw_data: str | None
    next_url: str | None
    error: bool
    
    
class Crawler:
    def __init__(self) -> None:
        self.driver = create_undetected_driver()

    def crawl(self, url: str) -> CrawlResults:
        results: CrawlResults = {"profile": None, "tweets": [], "raw_data": None, "next_url": None, "error": False}


        #TODO: Add in error handling that will define different error types
        try:
            self.driver_load_page(url)

        except WebDriverException as e:
            results["error"] = True
            return results

        if self.driver.get_status_code() != 200:
            results["error"] = True
            return results
        
        if self.detected_html_not_loaded():
            results["error"] = True
            return results


        results["raw_data"] = self.get_raw_data()
        results["profile"] = self.parse_profile()
        results["tweets"], results["next_url"], results["error"] = self.parse_tweets()       
        
        return results

    def detected_html_not_loaded(self) -> bool:
        raise NotImplementedError()
    
    def driver_load_page(self, url: str):
        raise NotImplementedError()

    # raw html data
    def get_raw_data(self) -> str:
        return self.driver.page_source

    def parse_tweets(self) -> Tuple[List[Tweet], str | None]:
        raise NotImplementedError()

    def parse_profile(self) -> Profile:
        raise NotImplementedError()
