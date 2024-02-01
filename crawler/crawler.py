from typing import List, Dict, Tuple
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from twitter_api_encoder import TweetEncoder, ProfileEncoder
from urllib.parse import urlparse

import database as db
from driver import create_undetected_driver
import time


class Crawler:
    def __init__(self) -> None:
        self.driver = create_undetected_driver()

    def crawl(self, account: str, stop_date: float, saveProfile: bool):
        url = self.get_url(account)

        self.driver_load_page(url)

        if saveProfile:
            profile = self.parse_profile()
            db.add_twitter_profile(profile)

        while url != None:
            filename = self.backup_raw_data(url)
            tweets, next_url = self.parse_tweets()

            db.add_tweets(tweets)
            url = next_url

            if tweets[len(tweets) - 1].get_post_date_as_epoch() < stop_date:
                break

            time.sleep(5)
            if url != None:
                self.driver_load_page(url)

    def get_url(self, text) -> str:
        raise NotImplementedError()

    def driver_load_page(self, url: str):
        raise NotImplementedError()

    # Back up text file incase we have any problems with parsed data
    # TODO: integrate with database
    def backup_raw_data(self, url: str) -> str:
        parsed_url = urlparse(url)
        last_url_part = parsed_url.path.split("/")[-1]
        filename = last_url_part + "-time-" + str(int(time.time()))
        with open(filename, "w", encoding="utf-8") as f:
            f.write(self.driver.page_source)

        return filename

    def parse_tweets(self) -> Tuple[List[TweetEncoder], str | None]:
        raise NotImplementedError()

    def parse_profile(self) -> ProfileEncoder:
        raise NotImplementedError()
