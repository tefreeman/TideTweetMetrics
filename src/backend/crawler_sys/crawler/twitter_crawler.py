from queue import Queue
from typing import List, Dict, Tuple
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from backend.crawler_sys.account import Account
from crawler.crawler import Crawler  # hmmmm
import urllib.request
import json
from backend.encoders.tweet_encoder import Tweet
from backend.encoders.profile_encoder import Profile
from backend.encoders.twitter_api_encoder import ReferencedTweetType
import time
import random
from urllib.parse import urlparse
from selenium.common.exceptions import NoSuchElementException
import logging
from utils.error_sys import Error
from backend.crawler_sys.utils.random_utils import sleep_normally_distributed
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class TwitterCrawler(Crawler):
    """A class representing a Twitter crawler."""

    def __init__(self) -> None:
        super().__init__()

    def find_element_by_text(self, browser, text):
        """Find an element in the browser by its exact text.

        Args:
            browser: The browser instance.
            text: The exact text to search for.

        Returns:
            The found element or None if not found.
        """
        try:
            xpath_expression = f"//*[text()='{text}']"
            element = WebDriverWait(browser, 6).until(
                EC.presence_of_element_located((By.XPATH, xpath_expression))
            )
            return element
        except TimeoutException:
            logging.error(
                f"Element with exact text '{text}' not found within the timeout period."
            )
            return None

    def is_logged_in(self) -> bool:
        """Check if the user is logged in.

        Returns:
            True if the user is logged in, False otherwise.
        """
        time.sleep(3)  # page wait

        # Second condition: Check if URL has 'login' in it
        current_url = self.driver.current_url
        if "login" in current_url:
            logging.info(
                f"URL contains 'login': {current_url}, considered not logged in."
            )
            return False

        # First condition: Check if "Log in" element exists on page
        if self.find_element_by_text(self.driver, "Log in") is not None:
            logging.info("Detected 'Log in' text element, considered not logged in.")
            return False

        return True

    def is_logged_in_quick(self) -> bool:
        """Quickly check if the user is logged in.

        Returns:
            True if the user is logged in, False otherwise.
        """
        try:
            sleep_normally_distributed(3, 1, 1)
            element = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located(
                    (
                        By.XPATH,
                        "//div[contains(@data-testid, 'SideNav_AccountSwitcher')]",
                    )
                )
            )
            return True
        except TimeoutException:
            print("Element not found within the timeout period.")
            return False

    def driver_load_page(self, url: str):
        """Load a page in the driver.

        Args:
            url: The URL of the page to load.
        """
        self.driver.get(url)
        time.sleep(5)

    def find_element_or_none(
        self, parent: WebElement, by: By, value: str
    ) -> WebElement:
        """Find an element within a parent element or the driver.

        Args:
            parent: The parent element (WebElement) to search within. Pass None to search in the driver.
            by: The search method (By).
            value: The value (str) to search for.

        Returns:
            The found element or None if not found.
        """
        try:
            if parent == None:
                return self.driver.find_element(by, value)
            else:
                return parent.find_element(by, value)
        except NoSuchElementException:
            return None

    def find_text_or_none(self, parent: WebElement, by: By, value: str) -> str:
        """Find the text of an element within a parent element or the driver.

        Args:
            parent: The parent element (WebElement) to search within. Pass None to search in the driver.
            by: The search method (By).
            value: The value (str) to search for.

        Returns:
            The text of the found element or None if not found.
        """
        try:
            return parent.find_element(by, value).text
        except NoSuchElementException:
            return None

    def find_attribute_or_none(
        self, parent: WebElement, by: By, value: str, attrib: str
    ) -> str:
        """Find the value of an attribute of an element within a parent element or the driver.

        Args:
            parent: The parent element (WebElement) to search within. Pass None to search in the driver.
            by: The search method (By).
            value: The value (str) to search for.
            attrib: The attribute (str) to get the value of.

        Returns:
            The value of the attribute of the found element or None if not found.
        """
        try:
            return parent.find_element(by, value).get_attribute(attrib)
        except NoSuchElementException:
            return None

    def detected_html_not_loaded(self, max_wait=15) -> Error | None:
        """Check if the HTML of the page failed to load.

        Args:
            max_wait: The maximum time to wait for the HTML to load. 15 by default.

        Returns:
            An Error object if the HTML failed to load, None otherwise.
        """
        try:
            # Wait for the presence of the container element
            element_present = EC.presence_of_element_located((By.ID, "react-root"))
            WebDriverWait(self.driver, max_wait).until(element_present)
        except TimeoutException as e:
            # Create Error object
            return Error(e.__class__.__name__)

        # Check for error panel if theres an issue with HTML loading
        error_div = self.driver.find_elements(By.CLASS_NAME, "error-panel")
        if len(error_div) > 0:
            return Error("ErrorPanelFound")

        # If no errors found, return None
        return None

    def is_tweet(self, tweet_json: dict[str]):
        """Check if a JSON object represents a tweet.

        Args:
            tweet_json: The JSON object (dict[str]) to check.

        Returns:
            True if the JSON object represents a tweet, False otherwise.
        """
        # Check if the JSON object is a tweet
        return tweet_json["entryId"].startswith("tweet-")

    def find_element_by_text_case_insensitive(self, text):
        """Find an element in the browser by its text (case-insensitive).

        Args:
            text: The text to search for.

        Returns:
            The found element or None if not found.
        """
        try:
            # Convert both the document text and the provided text to lowercase (or uppercase)
            lower_text = text.lower()
            xpath_expression = f"//*[translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')='{lower_text}']"
            element = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, xpath_expression))
            )
            return element
        except TimeoutException:
            logging.info(
                f"Element with exact text '{text}' not found within the timeout period."
            )
            return None

    def login(self, account: Account) -> None:
        """Log in to Twitter using the provided account.

        Args:
            account: The account (Account) to log in with.
        """
        self.driver.get("https://twitter.com/i/flow/login")

        # Wait for the username input to be clickable
        sleep_normally_distributed(2, 1, 1)
        WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "input[name='text']"))
        ).click()
        sleep_normally_distributed(3, 2, 0.5)
        username_input = self.driver.find_element(By.CSS_SELECTOR, "input[name='text']")
        sleep_normally_distributed(3, 2, 0.5)
        username_input.send_keys(account.get_username())

        # Wait and click the Next button
        sleep_normally_distributed(3, 1, 1)
        WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//span[text()='Next']/.."))
        ).click()
        sleep_normally_distributed(3, 1, 1)
        # Wait for the password input to be present
        sleep_normally_distributed(3, 2, 0.5)
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='password']"))
        ).send_keys(account.get_password())
        sleep_normally_distributed(3, 2, 0.5)
        # Wait and click the Login button
        WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//span[text()='Log in']/.."))
        ).click()
        sleep_normally_distributed(5, 2, 3)

    def convert_json_to_tweet(self, tweet_json):
        """Convert a JSON object to a Tweet object.

        Args:
            tweet_json: The JSON object representing a tweet.

        Returns:
            The converted Tweet object.
        """
        # Initialize a new Tweet object
        tweet = Tweet()

        # Set the ID of the tweet using set_id
        tweet_id = tweet_json["entryId"].replace("tweet-", "")

        tweet_result = tweet_json["content"]["itemContent"]["tweet_results"]["result"]

        if "tweet" in tweet_result:
            tweet_result = tweet_result["tweet"]

        tweet_user_result = tweet_result["core"]["user_results"]["result"]
        tweet_id_alt = tweet_result["rest_id"]

        tweet_legacy = tweet_result["legacy"]
        profile_legacy = tweet_user_result["legacy"]

        # Set the text of the tweet
        full_text = tweet_legacy["full_text"]

        is_quote_status = tweet_legacy["is_quote_status"]
        is_retweet = tweet_legacy["retweeted"]

        quote_count = tweet_legacy["quote_count"]
        reply_count = tweet_legacy["reply_count"]
        retweet_count = tweet_legacy["retweet_count"]
        favorite_count = tweet_legacy["favorite_count"]
        bookmark_count = tweet_legacy["bookmark_count"]

        tweet_date = tweet_legacy["created_at"]
        tweet_entities = tweet_legacy["entities"]
        tweet_media = tweet_entities["media"] if "media" in tweet_entities else []

        user_id = tweet_legacy["user_id_str"]

        tweet_photos = []
        tweet_videos = []
        tweet_cards = []

        for media in tweet_media:
            if media["type"] == "photo":
                tweet_photos.append(media)
            elif media["type"] == "video":
                tweet_videos.append(media)
            elif media["type"] == "card":
                tweet_cards.append(media)

        tweet.set_id(tweet_id)
        tweet.set_text(full_text)
        tweet.set_author(user_id)
        tweet.set_public_metrics(
            retweet_count, reply_count, favorite_count, quote_count
        )
        tweet.set_attachments(
            photos=tweet_photos, videos=tweet_videos, cards=tweet_cards
        )  # TODO fix
        tweet.set_entities_direct(tweet_entities)
        tweet.set_post_date(tweet_date)

        profile = Profile()

        user_id = tweet_legacy["user_id_str"]
        username = profile_legacy["screen_name"]
        created_at = profile_legacy["created_at"]
        name = profile_legacy["name"]
        location = profile_legacy["location"]
        description = profile_legacy["description"]
        verified = profile_legacy["verified"]
        followers_count = profile_legacy["followers_count"]
        friends_count = profile_legacy["friends_count"]
        statuses_count = profile_legacy["statuses_count"]
        favourites_count = profile_legacy["favourites_count"]
        listed_count = profile_legacy["listed_count"]
        profile_url = profile_legacy["url"] if "url" in profile_legacy else ""
        profile_image_url_https = profile_legacy["profile_image_url_https"]

        profile.set_username(username)
        profile.set_id(user_id)
        profile.set_description(description)
        profile.set_location(location)
        profile.set_name(name)
        profile.set_url(profile_url)
        profile.set_verified(verified)
        profile.set_public_metrics(
            followers_count, friends_count, statuses_count, favourites_count
        )
        profile.set_profile_image_url(profile_image_url_https)
        profile.set_created_at(created_at)

        return tweet, profile

    def parse_profile(self) -> Profile:
        return self.parse_tweets_and_profile()[1]

    def parse_tweets(self) -> list[Tweet]:
        return self.parse_tweets_and_profile()[0]

    def scroll_to_bottom(self):
        self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")

    def parse_tweets_and_profile(self, result, tweet_count: int, account: Account):
        """
        Parses tweets and profile information from the Twitter crawler.

        Args:
            result (dict): The dictionary to store the parsed tweets and profile.
            tweet_count (int): The desired number of tweets to parse.
            account (Account): The Twitter account to use for crawling.

        Returns:
            None
        """

        tweet_queue: Queue = self.driver.get_tweets_queue()
        tweets: list[Tweet] = []
        profile: Profile

        account.start()

        # self.driver.register_cdp_listeners()
        sleep_for = account.get_minute_rest_time()
        sleep_normally_distributed(sleep_for - (sleep_for / 4), sleep_for / 2, 10)

        last_tweet_count = 0
        empty_count = 0

        while len(tweets) < tweet_count:

            if tweet_queue.empty():
                empty_count = +1
                if empty_count > 5:
                    result
            else:
                # TODO: add a error that better describes the issue

                while tweet_queue.empty() == False:
                    tweets_json = tweet_queue.get()

                    for tweet in tweets_json:
                        if not self.is_tweet(tweet):
                            continue
                        tweet_obj, profile_obj = self.convert_json_to_tweet(tweet)

                        tweets.append(tweet_obj)
                        profile = profile_obj

            if len(tweets) < tweet_count:
                self.scroll_to_bottom()

            account.update_tweets_viewed(len(tweets) - last_tweet_count)
            last_tweet_count = len(tweets)

            sleep_for = account.get_minute_rest_time()
            sleep_normally_distributed(sleep_for - (sleep_for / 4), sleep_for / 4, 10)

        result["tweets"] = tweets
        result["profile"] = profile
