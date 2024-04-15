from http.client import HTTPException, ResponseNotReady
from typing import TypedDict
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from backend.encoders.tweet_encoder import Tweet
from backend.encoders.profile_encoder import Profile
from urllib.parse import urlparse
import database as db
from utils.driver import create_undetected_driver
from selenium.common.exceptions import WebDriverException
from utils.error_sys import Error


class CrawlResults(TypedDict):
    """Type definition for the crawl results."""

    profile: Profile
    tweets: list[Tweet]
    raw_data: str | None
    next_url: str | None
    errors: list[Error]


class Crawler:
    """Class representing a web crawler."""

    def __init__(self) -> None:
        """Initialize the Crawler class."""
        self.driver = create_undetected_driver()

    def try_load_page(self, url, errors: list[Error]) -> None:
        """Try to load a web page.

        Args:
            url (str): The URL of the web page to load.
            errors (list[Error]): List to store any errors encountered during loading.

        Returns:
            None
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

        status = self.driver.get_status_code()
        if status is None:
            errors.append(Error("noHTTPResponseCode"))
            return
        if status >= 300:
            errors.append(Error("BadHTTPResponseCode"))
            return

        html_not_loaded_error = self.detected_html_not_loaded()
        if html_not_loaded_error != None:
            errors.append(html_not_loaded_error)
            return

    def crawl(self, url: str) -> CrawlResults:
        """Crawl a web page and extract data.

        Args:
            url (str): The URL of the web page to crawl.

        Returns:
            CrawlResults: The results of the crawl operation.
        """
        results: CrawlResults = {
            "profile": None,
            "tweets": [],
            "raw_data": None,
            "next_url": None,
            "errors": [],
        }

        self.try_load_page(url, results["errors"])

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

    def shutdown(self):
        """Shutdown the web driver."""
        self.driver.quit()

    def detected_html_not_loaded(self) -> Error | None:
        """Check if the HTML failed to load.

        Returns:
            Error | None: An error object if the HTML failed to load, None otherwise.
        """
        raise NotImplementedError()

    def driver_load_page(self, url: str):
        """Load a web page in the web driver.

        Args:
            url (str): The URL of the web page to load.

        Returns:
            None
        """
        raise NotImplementedError()

    # raw html data
    def get_raw_data(self) -> str:
        """Get the raw HTML data of the loaded web page.

        Returns:
            str: The raw HTML data.
        """
        return self.driver.page_source

    def parse_tweets(self) -> tuple[list[Tweet], str | None]:
        """Parse the tweets on the web page.

        Returns:
            tuple[list[Tweet], str | None]: A tuple containing the list of parsed tweets and the URL of the next page, if available.
        """
        raise NotImplementedError()

    def parse_profile(self) -> Profile:
        """Parse the profile information on the web page.

        Returns:
            Profile: The parsed profile information.
        """
        raise NotImplementedError()
