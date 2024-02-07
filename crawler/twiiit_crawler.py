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
from twitter_api_encoder import Tweet, Profile, ReferencedTweetType
from urllib.parse import urlparse
from selenium.common.exceptions import NoSuchElementException
import time
import logging



class Twiiit_Crawler(Crawler):
    def __init__(self) -> None:
        super().__init__()


    # load data into the driver
    def driver_load_page(self, url: str):
        self.driver.get(url)
            

    def find_element_or_none(self, by: By, value: str) -> WebElement:
        try:
            return self.driver.find_element(by, value)
        except NoSuchElementException:
            return None
    
    def find_element_by_element_or_none(self, ele: WebElement, by: By, value: str) -> WebElement:
        try:
            return ele.find_element(by, value)
        except NoSuchElementException:
            return None
          
    def find_text_or_none(self, parent: WebElement, by: By, value: str) -> str:
        try:
            return parent.find_element(by, value).text
        except NoSuchElementException:
            return None
 
    def find_attribute_or_none(self, parent: WebElement, by: By, value: str, attrib: str) -> str:
        try:
            return parent.find_element(by, value).get_attribute(attrib)
        except NoSuchElementException:
            return None       
        
    def _parse_links(self, content_links_ele: List[WebElement]) -> List:
        content_links_list = []
        for content_link_ele in content_links_ele:
            content_links_list.append(
                {"title": content_link_ele.get_attribute("title"),
                    "href": content_link_ele.get_attribute("href"),
                    "text": content_link_ele.text
                    })
        return content_links_list
    
    def _parse_pictures(self, pictures_ele: List[WebElement]) -> List:
        pictures_list = [] # Just the links
        for picture_ele in pictures_ele:
            pictures_list.append({"href": picture_ele.get_attribute("href"), "img_src": picture_ele.find_element(By.TAG_NAME, "img").get_attribute("src")})
        
        return pictures_list
    
    def _enable_video_playback(self):
        
        overlay = self.find_element_or_none(By.CLASS_NAME, "video-overlay")
        
        if overlay == None:
            return
        
        button = self.find_element_by_element_or_none(overlay, By.TAG_NAME, "button")
        
        if button == None:
            return
        
        print("clicking enable video playback")
        button.click()
        print("clicked enable video playback")
        time.sleep(5) #TODO: fix this


    def _parse_videos(self, videos_ele: List[WebElement]) -> List:
        videos_list = [] # Just the links
        if len(videos_ele) == 0:
            return []
        
        for video_ele in videos_ele:
            try:
                video = video_ele.find_element(By.TAG_NAME, "video")
                videos_list.append({'poster': video.get_attribute("poster"), "data-url": video.get_attribute("data-url"), "data-autoload": video.get_attribute("data-autoload")})

            except Exception as e:
                logging.error("Error parsing video: ", e)
                continue
            
                
        return videos_list
    
    # TODO add many more error checks
    def detected_html_not_loaded(self, max_wait=10) -> bool:
        try:
            element_present = EC.presence_of_element_located((By.CLASS_NAME, "container"))
            WebDriverWait(self.driver, max_wait).until(element_present)
        except TimeoutException:
            return True
        
        error_div = self.driver.find_elements(By.CLASS_NAME, "error-panel")
        if len(error_div) > 0:
            return True
        
        return False
        
    def parse_profile_pic(self, picture_ele: WebElement):
        return {"href": picture_ele.get_attribute("href"), "img_src": self.find_attribute_or_none(picture_ele, By.TAG_NAME, "img", "src")}
    
    # does this need to be implemented?
    def parse_quoted_tweet(self, quote_ele: WebElement):
        pass
    
    
    #TODO: Parse a card
    # card-content, card-title, card-description, card-destination, card-image (img tag inside), 
    def _parse_card(self, card_ele: WebElement):
        pass
    
    
    def parse_profile(self) -> Profile:
        profile_ele = self.driver.find_element(By.CLASS_NAME, "profile-card")
        fullname_text = self.find_text_or_none(profile_ele, By.CLASS_NAME, "profile-card-fullname")
        username_text = self.find_text_or_none(profile_ele, By.CLASS_NAME, "profile-card-username")
        bio_text = self.find_text_or_none(profile_ele, By.CLASS_NAME, "profile-bio")
        location_text = self.find_text_or_none(profile_ele, By.CLASS_NAME, "profile-location")
        website_text = self.find_text_or_none(profile_ele, By.CLASS_NAME, "profile-website")

        join_date_ele = self.find_element_or_none(By.CLASS_NAME, "profile-joindate")
        join_date_text = None
        
        if join_date_ele != None:
            join_date_text = self.find_attribute_or_none(join_date_ele, By.TAG_NAME, "span", "title")

        verified_profile_ele = profile_ele.find_elements(By.CLASS_NAME, "icon-ok.verified-icon.blue")
        verified_profile_bool = len(verified_profile_ele) > 0

        profile_pic_ele = self.find_element_or_none(By.CLASS_NAME, "profile-card-avatar")
        
        profile_pic = None
        if profile_pic_ele != None:
            profile_pic = self.parse_profile_pic(profile_pic_ele)
        
        stat_container_ele = profile_ele.find_element(By.CLASS_NAME, "profile-statlist")
        
        tweets_count_text = None
        following_count_text = None
        followers_count_text = None
        likes_count_text = None
        
        if stat_container_ele == None:
            raise Exception("Profile doesn't have a stat container!")
        
        stat_list_ele = stat_container_ele.find_elements(By.TAG_NAME, "li")
        if len(stat_list_ele) != 4:
            raise Exception("Profile doesn't have 4 stats (Tweets Following, Followers, Likes)!")
        
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

        profile = Profile()
        profile.set_name(fullname_text)
        profile.set_description(bio_text)
        profile.set_username(username_text)
        profile.set_created_at(join_date_text)
        profile.set_location(location_text)
        profile.set_verified(verified_profile_bool)
        profile.set_public_metrics(followers_count_text, following_count_text, tweets_count_text, likes_count_text)
        profile.set_profile_image_url(profile_pic["img_src"])
        profile.set_url(website_text)
        
        return profile
        
    def parse_tweets(self) -> Tuple[List[Tweet], str | None]:
        self._enable_video_playback()
        tweets = self.driver.find_elements(By.CLASS_NAME, "timeline-item")
        json_tweets = []
        
        for tweet in tweets:
            
            if tweet.text == "Load newest":
                continue
            
            link_text = self.find_attribute_or_none(tweet, By.CLASS_NAME, "tweet-link", "href")
            
            fullname_text = self.find_text_or_none(tweet, By.CLASS_NAME, "fullname")
            username_text = self.find_text_or_none(tweet, By.CLASS_NAME, "username")
            date_text = tweet.find_element(By.CLASS_NAME, "tweet-date").find_element(By.TAG_NAME, 'a').get_attribute("title")
            
            content_ele = tweet.find_element(By.CLASS_NAME, "tweet-content")
            content_text = content_ele.text
            content_links_ele = content_ele.find_elements(By.TAG_NAME, "a")
            content_links_list = self._parse_links(content_links_ele)
            

            pictures_ele = tweet.find_elements(By.CLASS_NAME, "still-image")
            pictures_list = self._parse_pictures(pictures_ele)


            videos_ele = tweet.find_elements(By.CLASS_NAME, "video-container")
                   
            videos_list = self._parse_videos(videos_ele)
            tweet_stats_ele = tweet.find_element(By.CLASS_NAME, "tweet-stats")

            comment_count = tweet_stats_ele.find_element(By.CLASS_NAME, "icon-comment").find_element(By.XPATH, "..").text
            retweet_count = tweet_stats_ele.find_element(By.CLASS_NAME, "icon-retweet").find_element(By.XPATH, "..").text
            quote_count = tweet_stats_ele.find_element(By.CLASS_NAME, "icon-quote").find_element(By.XPATH, "..").text
            heart_count = tweet_stats_ele.find_element(By.CLASS_NAME, "icon-heart").find_element(By.XPATH, "..").text

            comment_count = comment_count if comment_count != "" else "0"
            retweet_count = retweet_count if retweet_count != "" else "0"
            quote_count = quote_count if quote_count != "" else "0"
            heart_count = heart_count if heart_count != "" else "0"


            is_retweet = True if len(tweet.find_elements(By.CLASS_NAME,"retweet-header")) > 0 else False
            
            #TODO: Simplify this
            quote_ele = None
            quotes = tweet.find_elements(By.CLASS_NAME, "quote")
            if len(quotes) == 1:
                quote_ele = quotes[0]

            is_quote = True if quote_ele != None else False
            

            json_tweet = Tweet()
            json_tweet.set_id(link_text)
            json_tweet.set_text(content_text)
            json_tweet.set_post_date(date_text)
            json_tweet.set_author(username_text)
            json_tweet.set_public_metrics(retweet_count, comment_count, heart_count, quote_count)
            json_tweet.set_entities(content_links_list, content_text)
            json_tweet.set_attachments(pictures_list, videos_list)
            
            if is_retweet:
                json_tweet.set_refenced_tweet(link_text, ReferencedTweetType.RETWEET)
            elif is_quote:
                quote_link_text= self.find_attribute_or_none(quote_ele, By.CLASS_NAME, "quote-link", "href")
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
        
        
        return json_tweets, load_more_link, errors
    

    

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