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
        profile_errors: list[Error] = []
        profile_element = self.find_element_or_none(None, By.CLASS_NAME, "css-175oi2r.r-ymttw5.r-ttdzmv.r-1ifxtd0")

        print("done")
        