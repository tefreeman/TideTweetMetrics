from typing import List, Dict, Tuple, TypedDict
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from encoders.tweet_encoder import Tweet
from encoders.profile_encoder import Profile
from urllib.parse import urlparse
import database as db
from utils.driver import create_undetected_driver
import time
from selenium.common.exceptions import WebDriverException
from utils.error_sys import Error

class CrawlResults(TypedDict):
    profile: Profile
    tweets: List[Tweet]
    raw_data: str | None
    next_url: str | None
    errors: list[Error]
    
    
class Crawler:
    def __init__(self) -> None:
        self.driver = create_undetected_driver()
    
    def load_and_check_errors(self, url, errors: list[Error]) -> None:
        try:
            self.driver_load_page(url)

        except WebDriverException as e:
            errors.append(Error(e.__class__.__name__))
            return

        if self.driver.get_status_code() is None:
            errors.append(Error("NoHTTPResponseCode"))
            return  
        if self.driver.get_status_code() >= 300:
            errors.append(Error("BadHTTPResponseCode"))
            return
        
        if self.driver.has_connection() == False:
            errors.append(Error("NoInternetConnection"))
            return
       
        html_not_loaded_error = self.detected_html_not_loaded()
        if html_not_loaded_error != None:
            errors.append(html_not_loaded_error)
            return
        
        
    def crawl(self, url: str) -> CrawlResults:
        results: CrawlResults = {"profile": None, "tweets": [], "raw_data": None, "next_url": None, "errors": []}

        self.load_and_check_errors(url, results["errors"])
        
        if len(results["errors"]) > 0:
            return results
        
        results["raw_data"] = self.get_raw_data()
        results["profile"], profile_errors = self.parse_profile()
        results["tweets"], results["next_url"], tweet_errors = self.parse_tweets()       
        
        
        results["errors"] += profile_errors
        results["errors"] += tweet_errors
        
        cleaned_errors = [item for item in results["errors"] if item is not None]
        results["errors"] = cleaned_errors
        
        return results

    def detected_html_not_loaded(self) -> Error | None:
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