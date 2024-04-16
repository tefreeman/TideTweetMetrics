
from selenium import webdriver
from selenium.webdriver.common.by import By
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import logging
import random 

class Account:
    _MAX_TWEETS_PER_HOUR = 500
    _MAX_TWEETS_PER_DAY = 2400
    _MAX_TWEETS_PER_15_MINUTES = 100
    _MAX_TWEETS_PER_MINUTE = 20
    
    def __init__(self, username: str, password: str, is_working: bool, total_tweets_viewed : int) -> None:
        self.username = username
        self.password = password
        self.is_working = is_working
        self.total_tweets_viewed = total_tweets_viewed
        
        self.tweets_viewed  = 0 
        self.start_time = None
        self.working_times = []
    
    def get_time_working(self) -> float:
        return time.time() - self.start_time
    
    def start(self):
        self.start_time = time.time()
        self.tweets_viewed = 0
        
    def rest(self, tweets_viewed: int) -> None:
        self.update_tweets_viewed(tweets_viewed)
        self.working_times.append({"working_time": self.get_time_working(), "tweets_viewed": self.tweets_viewed})
        self.start_time = None
        
    def get_chrome_profile(self) -> str:
        return self.username
    
    def get_username(self) -> str:
        return self.username
    
    def get_password(self) -> str:
        return self.password

    def update_tweets_viewed(self, tweets_viewed : int) -> None:
        self.tweets_viewed  = tweets_viewed
        self.total_tweets_viewed += tweets_viewed
    

    def get_batch_sleep_time(self, tweet_count: int) -> float:
        """
        Calculate and return a sleep time based on the normal distribution to mimic human behavior between batches.
        This method is intended to make the bot's interactions appear more natural.

        :param tweet_count: The total number of tweets you plan to manage in multiple batches.
        :return: float representing sleep time in seconds based on a Gaussian distribution.
        """
        batch_size = 15  # Number of tweets processed per batch
        time_per_tweet = 60 / self._MAX_TWEETS_PER_MINUTE

        # Calculate expected time for one batch of 15 tweets
        desired_time_for_one_batch = batch_size * time_per_tweet

        # Calculate expected time for all tweets
        num_batches = (tweet_count + batch_size - 1) // batch_size
        ideal_total_time = tweet_count * time_per_tweet

        # Calculate minimum necessary sleep time to not exceed rate limits
        min_sleep_time_needed = (num_batches * desired_time_for_one_batch) - ideal_total_time

        # Safety check to ensure sleep time is at least zero
        min_sleep_time_needed = max(0, min_sleep_time_needed)

        if num_batches > 1:
            # Divide total required sleep time across the number of inter-batch intervals
            mean_sleep_time_per_batch = min_sleep_time_needed / (num_batches - 1)
        else:
            mean_sleep_time_per_batch = min_sleep_time_needed

        # Use a normal distribution where mu is the calculated mean sleep time and sigma is, e.g., 25% of the mean
        sigma_percentage = 0.25
        fuzzy_sleep_time = random.normalvariate(mean_sleep_time_per_batch, sigma_percentage * mean_sleep_time_per_batch)

        # Safety check to ensure no negative sleep time
        fuzzy_sleep_time = max(0, fuzzy_sleep_time)
        print(f"Sleeping for {fuzzy_sleep_time:.2f} seconds between batches.")
        return fuzzy_sleep_time
    
    def to_dict(self) -> dict:
        return {
            "username": self.username,
            "password": self.password,
            "is_working": self.is_working,
            "total_tweets_viewed": self.total_tweets_viewed
        }
    
    
    def find_element_by_text(self, browser, text):
        try:
            xpath_expression = f"//*[text()='{text}']"
            element = WebDriverWait(browser, 10).until(
                EC.presence_of_element_located((By.XPATH, xpath_expression))
            )
            return element
        except TimeoutException:
            logging.error(f"Element with exact text '{text}' not found within the timeout period.")
            return None
    
    def login(self, driver: webdriver.Chrome) -> None:
        
        driver.get("https://twitter.com/i/flow/login")
        
        time.sleep(3)
        
        username_input = driver.find_element(By.CSS_SELECTOR, "input[name='text']")
        
        username_input.click()
        time.sleep(1)
        
        username_input.send_keys(self.username)
        time.sleep(1)
        
        next_button = self.find_element_by_text(driver, "Next")
        next_button.click()
        
        time.sleep(3)
        password_input = driver.find_element(By.CSS_SELECTOR, "input[name='password']")
        
        password_input.send_keys(self.password)
        
        time.sleep(1)
        
        login_button = self.find_element_by_text(driver, "Log in")
        
        login_button.click()
        
        time.sleep(1)
        