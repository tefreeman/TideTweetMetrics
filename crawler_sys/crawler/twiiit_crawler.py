from typing import List, Dict,Tuple
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from crawler import Crawler
import urllib.request

from ..encoders.tweet_encoder import Tweet
from ..encoders.profile_encoder import Profile
from ..encoders.twitter_api_encoder import ReferencedTweetType


from urllib.parse import urlparse
from selenium.common.exceptions import NoSuchElementException
import time
import logging
from crawler_sys.utils.error_sys import Error



class Twiiit_Crawler(Crawler):
    def __init__(self) -> None:
        super().__init__()
        
    # Load data into the driver
    def driver_load_page(self, url: str):
        self.driver.get(url)
    
    # Catch if element is not found
    def find_element_or_none(self, parent: WebElement, by: By, value: str) -> WebElement:
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
    def find_attribute_or_none(self, parent: WebElement, by: By, value: str, attrib: str) -> str:
        try:
            return parent.find_element(by, value).get_attribute(attrib)
        except NoSuchElementException:
            return None       
        
    # Returns List of link attributes 
    def _parse_links(self, content_links_ele: List[WebElement]) -> tuple[list[dict], list[Error]]:
        content_links_list = []
        errors_list = []
        for content_link_ele in content_links_ele:
            try:
                content_links_list.append(
                    {"title": content_link_ele.get_attribute("title"),
                        "href": content_link_ele.get_attribute("href"),
                        "text": content_link_ele.text
                        })
            except Exception as e:
                errors_list.append(Error(e.__class__.__name__))
                continue
        return content_links_list, errors_list
    
    # Returns list of picture attributes
    def _parse_pictures(self, pictures_ele: List[WebElement]) -> tuple[list[dict], list[Error]]:
        pictures_list = [] # Just the links
        errors_list = []
        
        for picture_ele in pictures_ele:
            try:
                pictures_list.append({"href": picture_ele.get_attribute("href"), "img_src": picture_ele.find_element(By.TAG_NAME, "img").get_attribute("src")})
            except Exception as e:
                errors_list.append(Error(e.__class__.__name__))
                continue
        return pictures_list, errors_list
    
    # Function that clicks "enable video playback" for videos
    def _enable_video_playback(self)-> Error | None:
        try:
            overlay = self.find_element_or_none(None, By.CLASS_NAME, "video-overlay")
            if overlay == None:
                return
            
            button = self.find_element_or_none(overlay, By.TAG_NAME, "button")
            
            if button == None:
                return
            
            print("clicking enable video playback")
            button.click()
            print("clicked enable video playback")
            time.sleep(10) #TODO: fix this -> problem with waiting page to load after enabling video playback. Sleep allows for page to load. Low priority
        except Exception as e:
            return Error(e.__class__.__name__)

    # Return list of video attributes
    def _parse_videos(self, videos_ele: List[WebElement]) -> tuple[list[dict], list[Error]]:
        videos_list = [] # Just the links
        errors: list[Error] = []
        # If the video element is empty, return empty list
        if len(videos_ele) == 0:
            return [], []
        
        for video_ele in videos_ele:
            try:
                video = video_ele.find_element(By.TAG_NAME, "video")
                videos_list.append({'poster': video.get_attribute("poster"), "data-url": video.get_attribute("data-url"), "data-autoload": video.get_attribute("data-autoload")})

            except Exception as e:
                errors.append(Error(e.__class__.__name__))
                continue
            
                
        return videos_list, errors
    
    #TODO: Add error checking (In progress)

    # Detects if the html isn't loading (DONE)
    def detected_html_not_loaded(self, max_wait=15) -> Error | None:
        try:
            element_present = EC.presence_of_element_located((By.CLASS_NAME, "container"))
            WebDriverWait(self.driver, max_wait).until(element_present)
        except TimeoutException as e:
            return Error(e.__class__._name__)

        #Error for when HTML generates error panel etc. wrong user name
        error_div = self.driver.find_elements(By.CLASS_NAME, "error-panel")
        if len(error_div) > 0:
            return Error("ErrorPanelFound")
        return None
        
    def parse_profile_pic(self, picture_ele: WebElement) -> tuple[dict | None, Error | None]:
        try:
            return {"href": picture_ele.get_attribute("href"), "img_src": self.find_attribute_or_none(picture_ele, By.TAG_NAME, "img", "src")}, None
        except Exception as e:
            return None, Error(e.__class__.__name__)
    
    def parse_quoted_tweet(self, quote_ele: WebElement):
        link = self.find_attribute_or_none(quote_ele, By.CLASS_NAME, "quote-link", "href")
        fullname_text = self.find_text_or_none(quote_ele, By.CLASS_NAME, "fullname")
        username_text = self.find_text_or_none(quote_ele, By.CLASS_NAME, "username")
        date_ele = self.find_element_or_none(quote_ele, By.CLASS_NAME, "tweet-date")
        date_text = None
        if date_ele != None:
            date_text = self.find_attribute_or_none(date_ele, By.TAG_NAME, "a", "title")
            
        
        content_ele = self.find_element_or_none(quote_ele, By.CLASS_NAME, "quote-text")
        content_text = content_ele.text
        content_links_ele = content_ele.find_elements(By.TAG_NAME, "a")
        content_links_list = self._parse_links(content_links_ele)
        
        quote_media_container_ele = self.find_element_or_none(quote_ele, By.CLASS_NAME, "quote-media-container")
        if quote_media_container_ele != None:
            pictures_ele = quote_media_container_ele.find_elements(By.CLASS_NAME, "still-image")
            pictures_list = self._parse_pictures(pictures_ele)
        
        print("done")

    def _parse_card(self, card_ele: WebElement):
        try:
            card_link = self.find_attribute_or_none(card_ele, By.CLASS_NAME, "card-container", "href")
            card_img_ele = self.find_element_or_none(card_ele, By.CLASS_NAME, "card-image-container")
            
            card_img_srcs = []
            
            if card_img_ele != None:
                images = card_img_ele.find_elements(By.TAG_NAME, "img")
                for image in images:     
                    card_img_srcs.append(image.get_attribute("src"))
                

            card_title = self.find_text_or_none(card_ele, By.CLASS_NAME, "card-title")
            card_description = self.find_text_or_none(card_ele, By.CLASS_NAME, "card-description")
            card_destination = self.find_text_or_none(card_ele, By.CLASS_NAME, "card-destination")
            
            return {
                "url": card_link,
                "img_srcs": card_img_srcs,
                "title": card_title,
                "description": card_description,
                "destination": card_destination
            }, None
        except Exception as e:
            return None, Error(e.__class__.__name__)
      
    def _parse_profile_stats(self, stat_container_ele: WebElement) -> tuple[str | None, str | None, str | None, str | None, Error | None]:        
        tweets_count_text = None
        following_count_text = None
        followers_count_text = None
        likes_count_text = None
        try:
            stat_list_ele = stat_container_ele.find_elements(By.TAG_NAME, "li")
            for stat_ele in stat_list_ele:
                stat_text = stat_ele.text.lower().replace("\n", "")
                if "tweets" in stat_text:
                    tweets_count_text = stat_text.replace("tweets", "")
                if "following" in stat_text:
                    following_count_text = stat_text.replace("following", "")
                if "followers" in stat_text:
                    followers_count_text = stat_text.replace("followers", "")
                if "likes" in stat_text:
                    likes_count_text = stat_text.replace("likes", "")
                    
        except Exception as e:
            return None, None, None, None, Error(e.__class__.__name__)
                
        return tweets_count_text, following_count_text, followers_count_text, likes_count_text, None
    
    def parse_profile(self) -> Profile:
        profile_errors: list[Error] = []
        
        profile_ele = self.find_element_or_none(None, By.CLASS_NAME, "profile-card")
        
        if profile_ele is None:
            return None, [Error("ProfileNotFound")]
        
        fullname_text = self.find_text_or_none(profile_ele, By.CLASS_NAME, "profile-card-fullname")
        username_text = self.find_text_or_none(profile_ele, By.CLASS_NAME, "profile-card-username")
        bio_text = self.find_text_or_none(profile_ele, By.CLASS_NAME, "profile-bio")
        location_text = self.find_text_or_none(profile_ele, By.CLASS_NAME, "profile-location")
        website_text = self.find_text_or_none(profile_ele, By.CLASS_NAME, "profile-website")


        join_date_ele = self.find_element_or_none(profile_ele, By.CLASS_NAME, "profile-joindate")
        join_date_text = self.find_attribute_or_none(join_date_ele, By.TAG_NAME, "span", "title") if join_date_ele else None

        verified_profile_bool = bool(profile_ele.find_elements(By.CLASS_NAME, "icon-ok.verified-icon.blue"))

        profile_pic_ele = self.find_element_or_none(profile_ele, By.CLASS_NAME, "profile-card-avatar")
        profile_pic, pic_errors = self.parse_profile_pic(profile_pic_ele) if profile_pic_ele else (None, None)
        if pic_errors:
            profile_errors.append(pic_errors)
        
        stat_container_ele = self.find_element_or_none(profile_ele, By.CLASS_NAME, "profile-statlist")
        tweets_cnt, following_cnt, follower_cnt, likes_cnt, stat_err = self._parse_profile_stats(stat_container_ele)
        
        if stat_err:
            profile_errors.append(stat_err)
            
        profile = Profile()
        profile.set_name(fullname_text)
        profile.set_description(bio_text)
        profile.set_username(username_text)
        profile.set_created_at(join_date_text)
        profile.set_location(location_text)
        profile.set_verified(verified_profile_bool)
        profile.set_public_metrics(follower_cnt, following_cnt, tweets_cnt, likes_cnt)
        profile.set_profile_image_url(profile_pic["img_src"])
        profile.set_url(website_text)
        
        return profile, profile_errors

    def _extract_content(self, tweet):
        content_ele = self.find_element_or_none(tweet, By.CLASS_NAME, "tweet-content")
        content_text = content_ele.text if content_ele else ""
        content_links_ele = content_ele.find_elements(By.TAG_NAME, "a") if content_ele else []
        content_links_list, parse_errs = self._parse_links(content_links_ele)
        return content_text, content_links_list, parse_errs   

    def _extract_date(self, tweet):
            date_ele = self.find_element_or_none(tweet, By.CLASS_NAME, "tweet-date")
            return self.find_attribute_or_none(date_ele, By.TAG_NAME, "a", "title") if date_ele else None

    def _extract_tweet_stats(self, tweet):
        stats_ele = self.find_element_or_none(tweet, By.CLASS_NAME, "tweet-stats")
        return {
            stat: stats_ele.find_element(By.CLASS_NAME, f"icon-{stat}").find_element(By.XPATH, "..").text or "0"
            for stat in ["comment", "retweet", "quote", "heart"]
        }
        
            
    def parse_tweets(self) -> Tuple[List[Tweet], str | None, list[Error]]:
        error_list: list[Error] = []
        
        error_list.append(self._enable_video_playback())
        
        tweets = self.driver.find_elements(By.CLASS_NAME, "timeline-item")
        json_tweets = []
        
        for tweet in tweets:
            if tweet.text == "Load newest":
                continue
            tweet_error_list: list[Error] = []
            
            link_text = self.find_attribute_or_none(tweet, By.CLASS_NAME, "tweet-link", "href")
            fullname_text = self.find_text_or_none(tweet, By.CLASS_NAME, "fullname")
            username_text = self.find_text_or_none(tweet, By.CLASS_NAME, "username")
            date_text = self._extract_date(tweet)
            
            content_text, content_links_list, parse_errs = self._extract_content(tweet)
            tweet_error_list.extend(parse_errs)

            pictures_ele = tweet.find_elements(By.CLASS_NAME, "still-image")
            pictures_list, pic_errs = self._parse_pictures(pictures_ele)
            tweet_error_list.extend(pic_errs)

            videos_ele = tweet.find_elements(By.CLASS_NAME, "video-container")
            videos_list, video_errs = self._parse_videos(videos_ele)
            tweet_error_list.extend(video_errs)
            
            stats = self._extract_tweet_stats(tweet)
            retweet_count, comment_count, heart_count, quote_count = stats["retweet"], stats["comment"], stats["heart"], stats["quote"]
            
            is_retweet = True if len(tweet.find_elements(By.CLASS_NAME,"retweet-header")) > 0 else False
            
            cards = tweet.find_elements(By.CLASS_NAME, "card")
            cards_list = []
            
            for card in cards:
                card_json, card_err = self._parse_card(card)
                cards_list.append(card_json)
                tweet_error_list.append(card_err)
                
            quotes = tweet.find_elements(By.CLASS_NAME, "quote")
            
            '''
            for quote in quotes:
                self.parse_quoted_tweet(quote)
            '''
            
            is_quote = len(quotes)  > 0
            

            json_tweet = Tweet()
            json_tweet.set_id(link_text)
            json_tweet.set_text(content_text)
            json_tweet.set_post_date(date_text)
            json_tweet.set_author(username_text)
            json_tweet.set_public_metrics(retweet_count, comment_count, heart_count, quote_count)
            json_tweet.set_entities(content_links_list, content_text)
            json_tweet.set_attachments(pictures_list, videos_list, cards_list)
            json_tweet.set_errors(tweet_error_list)
            
            # TODO: Need to set a retweet to have correct referenced tweet
            if is_retweet:
                json_tweet.set_refenced_tweet(link_text, ReferencedTweetType.RETWEET)
            elif is_quote:
                quote_link_text = self.find_attribute_or_none(quotes[0], By.CLASS_NAME, "quote-link", "href")
                json_tweet.set_refenced_tweet(quote_link_text, ReferencedTweetType.QUOTED)
            else:
                json_tweet.set_refenced_tweet("", ReferencedTweetType.NONE)
                
            json_tweets.append(json_tweet)


        #loads older tweets    
        load_more_link = None
        try:
            show_more_links = self.driver.find_elements(By.CLASS_NAME, "show-more")
            for show_more_link in show_more_links:
                button_ele = show_more_link.find_element(By.TAG_NAME, 'a')
                if button_ele.text == "Load more":
                    load_more_href = button_ele.get_attribute("href")
                    if load_more_href != None and load_more_href != "":
                        load_more_link = _remove_domain(load_more_href)
                    
        except Exception as e:
            print("Error parsing load more link: ", e)
        
        
        return json_tweets, load_more_link, error_list
    
def _remove_domain(url: str) -> str:
    parsed_url = urlparse(url)
    # Reconstruct URL without scheme and net location
    # Include params, query, and fragment if needed
    new_url = parsed_url.path
    if parsed_url.params:
        new_url += ';' + parsed_url.params
    if parsed_url.query:
        new_url += '?' + parsed_url.query
    if parsed_url.fragment:
        new_url += '#' + parsed_url.fragment
    return new_url[1:] if new_url.startswith('/') else new_url