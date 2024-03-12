from typing import List, Dict, Tuple
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from crawler.crawler import Crawler  # hmmmm
import urllib.request

from encoders.tweet_encoder import Tweet
from encoders.profile_encoder import Profile
from encoders.twitter_api_encoder import ReferencedTweetType


from urllib.parse import urlparse
from selenium.common.exceptions import NoSuchElementException
import time
import logging
from utils.error_sys import Error



class TwitterCrawler(Crawler):
    p_tar = {
        "container": "css-175oi2r.r-ymttw5.r-ttdzmv.r-1ifxtd0",
        "name": "css-1rynq56.r-bcqeeo.r-qvutc0.r-37j5jr.r-adyw6z.r-135wba7.r-1vr29t4.r-1awozwy.r-6koalj.r-1udh08x",
        "tag_name": "css-1rynq56.r-dnmrzs.r-1udh08x.r-3s2u2q.r-bcqeeo.r-qvutc0.r-37j5jr.r-a023e6.r-rjixqe.r-16dba41.r-18u37iz.r-1wvb978",
        "description": "css-1rynq56.r-bcqeeo.r-qvutc0.r-37j5jr.r-a023e6.r-rjixqe.r-16dba41",
        "header_item_container": "css-1rynq56.r-bcqeeo.r-qvutc0.r-37j5jr.r-a023e6.r-16dba41.r-56xrmm",
        "header_items": "css-1qaijid.r-bcqeeo.r-qvutc0.r-poiln3.r-4qtqp9.r-1b7u577",
        "stats_container": "css-175oi2r.r-13awgt0.r-18u37iz.r-1w6e6rj",
        "stats_items": "css-1rynq56.r-bcqeeo.r-qvutc0.r-37j5jr.r-a023e6.r-rjixqe.r-16dba41.r-1loqt21"
    }
    
    t_tar = {
        "tweets_container_tag": "section",
        "tweet_container_class": "css-175oi2r.r-16y2uox.r-1wbh5a2.r-1ny4l3l",
        "time_class": "css-1rynq56 r-bcqeeo r-qvutc0 r-37j5jr r-a023e6 r-rjixqe r-16dba41 r-xoduu5 r-1q142lx r-1w6e6rj r-9aw3ui r-3s2u2q r-1loqt21".replace(" ", "."),
        "time_post_attrib": "datetime",
        "time_status_attrib": "href",
        "post_text_class": "css-1rynq56 r-8akbws r-krxsd3 r-dnmrzs r-1udh08x r-bcqeeo r-qvutc0 r-37j5jr r-a023e6 r-rjixqe r-16dba41 r-bnwqim".replace(" ", "."),
        "post_stats_class": "css-175oi2r r-1kbdv8c r-18u37iz r-1wtj0ep r-1ye8kvj r-1s2bzr4".replace(" ", "."),
        "post_stats_data_attrib": "aria-label",
        "quoted_tweet_class": "css-175oi2r.r-9aw3ui.r-1s2bzr4",
        "pinned_tweet_class": "css-1rynq56 r-8akbws r-krxsd3 r-dnmrzs r-1udh08x r-bcqeeo r-qvutc0 r-37j5jr r-n6v787 r-1cwl3u0 r-b88u0q".replace(" ", "."),
        "reposted_tweet_class": "css-1qaijid r-8akbws r-krxsd3 r-dnmrzs r-1udh08x r-bcqeeo r-qvutc0 r-poiln3 r-n6v787 r-1cwl3u0 r-b88u0q".replace(" ", "."),
        
    }
    
    def __init__(self) -> None:
        super().__init__()

    # Load data into the driver
    def driver_load_page(self, url: str):
        self.driver.get(url)

    # Catch if element is not found
    def find_element_or_none(
        self, parent: WebElement, by: By, value: str
    ) -> WebElement:
        try:
            if parent == None:
                return self.driver.find_element(by, value)
            else:
                return parent.find_element(by, value)
        except NoSuchElementException:
            return None

    # Catch if element.text is not found
    def find_text_or_none(self, parent: WebElement, by: By, value: str) -> str:
        try:
            return parent.find_element(by, value).text
        except NoSuchElementException:
            return None

    # Catch if element.get_attribute is not found
    def find_attribute_or_none(
        self, parent: WebElement, by: By, value: str, attrib: str
    ) -> str:
        try:
            return parent.find_element(by, value).get_attribute(attrib)
        except NoSuchElementException:
            return None
        
    def detected_html_not_loaded(self, max_wait=15) -> Error | None:
        try:
            # Wait for the presence of the container element
            element_present = EC.presence_of_element_located((By.CLASS_NAME, "container"))
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
    
    
    
    def parse_profile(self) -> Profile:
        pass
    
    def parse_tweets(self):
        pass
        