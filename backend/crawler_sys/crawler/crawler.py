from http.client import HTTPException, ResponseNotReady
from typing import TypedDict
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from backend.encoders.tweet_encoder import Tweet
from backend.encoders.profile_encoder import Profile
from account import Account
from urllib.parse import urlparse
import database as db
from utils.driver import create_undetected_driver
from selenium.common.exceptions import WebDriverException
from utils.error_sys import Error


class CrawlResults(TypedDict):
    profile: Profile
    tweets: list[Tweet]
    raw_data: str | None
    errors: list[Error]


class Crawler:
    def __init__(self) -> None:
        self.driver = None
        self.account: Account = None
   
    def init_driver_to_account(self, account: Account) -> None:
        self.driver = create_undetected_driver(account.get_chrome_profile(), account.get_chrome_profile())
        self.account = account
        
    def try_load_page(self, url, errors: list[Error]) -> None:
        try:
            self.driver_load_page(url)

        except (WebDriverException, HTTPException, ResponseNotReady) as e:
            errors.append(Error(e.__class__.__name__))
            return

        # check these 
        if self.driver.has_connection() == False:
            errors.append(Error("NoInternetConnection"))
            return
        
        # status = self.driver.get_status_code()
        # if status is None:
        #     errors.append(Error("noHTTPResponseCode"))
        #     return 
        # if status >= 300:
        #     errors.append(Error("BadHTTPResponseCode"))
        #     return


        html_not_loaded_error = self.detected_html_not_loaded()
        if html_not_loaded_error != None:
            errors.append(html_not_loaded_error)
            return

    def crawl(self, url: str, tweet_count: int) -> CrawlResults:
        results: CrawlResults = {
            "profile": None,
            "tweets": [],
            "raw_data": None,
            "errors": [],
        }

        self.try_load_page(url, results["errors"])

        if len(results["errors"]) > 0:
            return results
        
        if self.is_logged_in() == False:
            self.account.login(self.driver)
            self.try_load_page(url, results["errors"])
            
        #results["raw_data"] = self.get_raw_data()
        self.parse_tweets_and_profile(results, tweet_count, self.account)

        # results["errors"] += profile_errors
        # results["errors"] += tweet_errors

        cleaned_errors = [item for item in results["errors"] if item is not None]
        results["errors"] = cleaned_errors

        return results

    def shutdown(self):
        self.driver.quit()

    def detected_html_not_loaded(self) -> Error | None:
        raise NotImplementedError()

    def driver_load_page(self, url: str):
        raise NotImplementedError()

    def is_logged_in(self) -> bool:
        raise NotImplementedError()
    
    # raw html data
    def get_raw_data(self) -> str:
        return self.driver.page_source
    
    def parse_tweets_and_profile(self, results: CrawlResults, tweet_count: int) -> tuple[list[Tweet], Profile]:
        raise NotImplementedError()
    
    def parse_tweets(self) -> tuple[list[Tweet], str | None]:
        raise NotImplementedError()

    def parse_profile(self) -> Profile:
        raise NotImplementedError()
