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

    def find_element_by_text(self, browser, text):
        try:
            xpath_expression = f"//*[text()='{text}']"
            element = WebDriverWait(browser, 6).until(
                EC.presence_of_element_located((By.XPATH, xpath_expression))
            )
            return element
        except TimeoutException:
            logging.error(f"Element with exact text '{text}' not found within the timeout period.")
            return None
        
    def is_logged_in(self) -> bool:
            time.sleep(3) # page wait
            
            # Second condition: Check if URL has 'login' in it
            current_url = self.driver.current_url
            if 'login' in current_url:
                logging.info(f"URL contains 'login': {current_url}, considered not logged in.")
                return False

            # First condition: Check if "Log in" element exists on page
            if self.find_element_by_text(self.driver, "Log in") is not None:
                logging.info("Detected 'Log in' text element, considered not logged in.")
                return False
            
            return True
            
    # Load data into the driver
    def driver_load_page(self, url: str):
        self.driver.get(url)
        time.sleep(5)

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
    # Check if the JSON object is a tweet
        return tweet_json['entryId'].startswith('tweet-')

    def convert_json_to_tweet(self, tweet_json):
        # Initialize a new Tweet object
        tweet = Tweet()

        # Set the ID of the tweet using set_id
        tweet_id = tweet_json['entryId'].replace('tweet-', '')
        
        tweet_result = tweet_json['content']['itemContent']['tweet_results']['result']
        
        if 'tweet' in tweet_result:
            tweet_result = tweet_result['tweet']
            
        tweet_user_result = tweet_result['core']['user_results']['result']
        tweet_id_alt = tweet_result['rest_id']

        tweet_legacy = tweet_result['legacy']
        profile_legacy = tweet_user_result['legacy']
        
        # Set the text of the tweet
        full_text =  tweet_legacy['full_text']

        is_quote_status = tweet_legacy['is_quote_status']
        is_retweet = tweet_legacy['retweeted']
        
        quote_count = tweet_legacy['quote_count']
        reply_count = tweet_legacy['reply_count']
        retweet_count = tweet_legacy['retweet_count']
        favorite_count = tweet_legacy['favorite_count']
        bookmark_count = tweet_legacy['bookmark_count']
        
        tweet_date = tweet_legacy['created_at']
        tweet_entities = tweet_legacy['entities']
        tweet_media = tweet_entities['media'] if 'media' in tweet_entities else []

        user_id = tweet_legacy['user_id_str']
        
        tweet_photos = []
        tweet_videos = []
        tweet_cards = []
        
        for media in tweet_media:
            if media['type'] == 'photo':
                tweet_photos.append(media)
            elif media['type'] == 'video':
                tweet_videos.append(media)
            elif media['type'] == 'card':
                tweet_cards.append(media)
                
        tweet.set_id(tweet_id)
        tweet.set_text(full_text)
        tweet.set_author(user_id)
        tweet.set_public_metrics(retweet_count, reply_count, favorite_count, quote_count)
        tweet.set_attachments(photos=tweet_photos, videos=tweet_videos, cards=tweet_cards) # TODO fix
        tweet.set_entities_direct(tweet_entities)
        tweet.set_post_date(tweet_date)


        
        
        profile = Profile()
        
        user_id = tweet_legacy['user_id_str']
        username = profile_legacy['screen_name']
        created_at = profile_legacy['created_at']
        name = profile_legacy['name']
        location = profile_legacy['location']
        description = profile_legacy['description']
        verified = profile_legacy['verified']
        followers_count = profile_legacy['followers_count']
        friends_count = profile_legacy['friends_count']
        statuses_count = profile_legacy['statuses_count']
        favourites_count = profile_legacy['favourites_count']
        listed_count = profile_legacy['listed_count']
        profile_url = profile_legacy['url'] if 'url' in profile_legacy else ""
        profile_image_url_https = profile_legacy['profile_image_url_https']
        
        
        profile.set_username(username)
        profile.set_id(user_id)
        profile.set_description(description)
        profile.set_location(location)
        profile.set_name(name)
        profile.set_url(profile_url)
        profile.set_verified(verified)
        profile.set_public_metrics(followers_count, friends_count, statuses_count, favourites_count)
        profile.set_profile_image_url(profile_image_url_https)
        profile.set_created_at(created_at)
        
        return tweet, profile

    def parse_profile(self) -> Profile:
        return self.parse_tweets_and_profile()[1]
    
    def parse_tweets(self) -> list[Tweet]:
        return self.parse_tweets_and_profile()[0]
    
    def scroll_to_bottom(self):
        self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        
        
    def parse_tweets_and_profile(self, result, tweet_count: int, account: Account) -> tuple[list[Tweet], Profile]:
        tweet_queue: Queue = self.driver.get_tweets_queue()
        tweets: list[Tweet] = []
        profile: Profile
        
        account.start()
        
        #self.driver.register_cdp_listeners()
        
        
        while len(tweets) < tweet_count:
            
            time.sleep(account.get_batch_sleep_time(tweet_count))
            
            if tweet_queue.empty():
                raise Error("NoTweetsFound")
            
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
            

            

        result["tweets"] = tweets
        result["profile"] = profile
    
    