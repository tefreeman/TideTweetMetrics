import json
from typing import Callable, Optional
import undetected_chromedriver as uc
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import time
from config import Config

# TODO: Implement a method to create a driver that is undetected
# This method should return a webdriver.Chrome object
# Create other functions as needed


class CustomChromeDriver(uc.Chrome):
    def __init__(self, *args, **kwargs):
        super(CustomChromeDriver, self).__init__(*args, **kwargs)
        self.set_page_load_timeout(Config.get_max_page_load_time())
        self.set_window_size(640, 480)

    def get_status_code(self) -> Optional[int]:
        return _get_status_code(self)

    def has_connection(self) -> bool:
        return _has_connection(self)


def create_undetected_driver(user_data_dir = None, profile_dir = None) -> CustomChromeDriver:

    capabilities = DesiredCapabilities.CHROME
    capabilities["goog:loggingPrefs"] = {"performance": "ALL"}
    # chromeOptions = webdriver.ChromeOptions()
    chrome_options = uc.ChromeOptions()
    
    if user_data_dir:
        chrome_options.add_argument(f"--user-data-dir={user_data_dir}")
    else:
        chrome_options.add_argument('--user-data-dir=C:\\Users\\sherr\\AppData\\Local\\Google\\Chrome\\User Data')
        
    if profile_dir:
        chrome_options.add_argument(f"--profile-directory={profile_dir}")
    else:
        chrome_options.add_argument('--profile-directory=Default')
        
    # driver = webdriver.Chrome()
    # driver = uc.Chrome(enable_cdp_events=True)
    driver = CustomChromeDriver(
        options=chrome_options, desired_capabilities=capabilities
    )

    return driver


def _get_status_code(self: webdriver.Chrome) -> Optional[int]:
    for entry in self.get_log("performance"):
        for k, v in entry.items():
            if k == "message" and "status" in v:
                msg = json.loads(v)["message"]["params"]
                for mk, mv in msg.items():
                    if mk == "response":
                        response_url = mv["url"]
                        response_status = mv["status"]
                        if response_url == self.current_url:
                            return response_status


def _has_connection(self: webdriver.Chrome) -> bool:
    try:
        self.driver.find_element_by_xpath(
            '//span[@jsselect="heading" and @jsvalues=".innerHTML:msg"]'
        )
        return False
    except:
        return True
