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
import time

class CrawlResults(TypedDict):
    profile: Profile
    tweets: list[Tweet]
    raw_data: str | None
    errors: list[Error]
    account_needs_rest: bool 

class Crawler:
    """
    A class that represents a web crawler for scraping tweets and profiles.

    Attributes:
        driver: The web driver used for crawling.
        account: The account used for authentication.
    """

    def __init__(self) -> None:
        """
        Initializes a new instance of the Crawler class.
        """
        self.driver = None
        self.account: Account = None

    def init_driver_to_account(self, account: Account) -> None:
        """
        Initializes the web driver and account.

        Args:
            account: The account to be used for authentication.
        """
        self.account = account
        
        if self.driver != None:
            self.driver.quit()
            time.sleep(5)
        self.driver = create_undetected_driver(
            account.get_chrome_profile(), account.get_chrome_profile()
        )


    def try_load_page(self, url, errors: list[Error]) -> None:
        """
        Tries to load a web page and handles exceptions.

        Args:
            url: The URL of the web page to load.
            errors: The list to store any encountered errors.
        """
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
        """
        Crawls a web page and retrieves crawl results.

        Args:
            url: The URL of the web page to crawl.
            tweet_count: The number of tweets to retrieve.

        Returns:
            The crawl results containing the profile, tweets, raw data, and errors.
        """
        results: CrawlResults = {
            "profile": None,
            "tweets": [],
            "raw_data": None,
            "errors": [],
            "account_needs_rest": False,
        }

        self.try_load_page(url, results["errors"])

        if len(results["errors"]) > 0:
            return results

        if self.is_logged_in_quick() == False:
            self.login(self.account)
            self.try_load_page(url, results["errors"])

        self.parse_tweets_and_profile(results, tweet_count, self.account)

        cleaned_errors = [item for item in results["errors"] if item is not None]
        results["errors"] = cleaned_errors

        return results

    def shutdown(self):
        """
        Shuts down the web driver.
        """
        self.driver.quit()

    def detected_html_not_loaded(self) -> Error | None:
        """
        Checks if the HTML failed to load.

        Returns:
            An Error object if the HTML failed to load, None otherwise.
        """
        raise NotImplementedError()

    def driver_load_page(self, url: str):
        """
        Loads a web page using the web driver.

        Args:
            url: The URL of the web page to load.
        """
        raise NotImplementedError()

    def login(self) -> None:
        """
        Logs into an account using the web driver.

        Args:
            account: The account to log into.
        """
        raise NotImplementedError()
    def is_logged_in(self) -> bool:
        """
        Checks if the user is logged in.

        Returns:
            True if the user is logged in, False otherwise.
        """
        raise NotImplementedError()

    def is_logged_in_quick(self) -> bool:
        """
        Quickly checks if the user is logged in.

        Returns:
            True if the user is logged in, False otherwise.
        """
        raise NotImplementedError()
    
    def get_raw_data(self) -> str:
        """
        Retrieves the raw HTML data of the loaded page.

        Returns:
            The raw HTML data of the loaded page.
        """
        return self.driver.page_source

    def parse_tweets_and_profile(
        self, results: CrawlResults, tweet_count: int
    ) -> tuple[list[Tweet], Profile]:
        """
        Parses tweets and profile from the loaded page.

        Args:
            results: The crawl results to store the parsed tweets and profile.
            tweet_count: The number of tweets to retrieve.

        Returns:
            A tuple containing the parsed tweets and profile.
        """
        raise NotImplementedError()

