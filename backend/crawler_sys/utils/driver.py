import json
from queue import Queue
from typing import Callable, Optional
import undetected_chromedriver as uc
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import time
import os
from backend.config import Config
from pprint import pformat
from requests.adapters import HTTPAdapter
from requests.sessions import Session
from urllib3 import PoolManager

# TODO: Implement a method to create a driver that is undetected
# This method should return a webdriver.Chrome object
# Create other functions as needed

pool = PoolManager(maxsize=10)
class CustomChromeDriver(uc.Chrome):
    def __init__(self, *args, **kwargs):
        super(CustomChromeDriver, self).__init__(*args, **kwargs)
        self.register_cdp_listeners()
        self.set_page_load_timeout(Config.get_max_page_load_time())
        self.set_window_size(640, 480)
        self._user_media_update = None
        self._user_media_response = None
        self._tweet_response_queue: Queue = Queue()
        

    
    def register_cdp_listeners(self):
        self.execute_cdp_cmd("Network.enable", {})
        self.add_cdp_listener("Network.responseReceived", self.log)

   


   
    def get_status_code(self) -> Optional[int]:
        return _get_status_code(self)

    def has_connection(self) -> bool:
        return _has_connection(self)

    def get_tweets_queue(self) -> Queue[dict]:
        return self._tweet_response_queue

    def get_tweets_media(self):
        return self._user_media_response

    def safely_access_nested_dict(self, data_dict, key_list):
        """
        Attempts to get the value from a nested dictionary using a list of keys.

        :param data_dict: The dictionary to get data from.
        :param key_list: A list of keys representing the path to the desired value.
        :return: The value if all keys exist, None if any key was missing.
        """
        try:
            for key in key_list:
                data_dict = data_dict[key]
            return data_dict
        except (KeyError, TypeError):
            print(f"Failed to access nested dict with key list: {key_list}")
            return None

    def log(self, response) -> None:
        if response["params"]["type"] == "XHR":
            request_url = response["params"]["response"]["url"]
            if "UserTweets?" in request_url:
                request_id = response["params"]["requestId"]
                print(request_id)
                body = self.execute_cdp_cmd(
                    "Network.getResponseBody", {"requestId": request_id}
                )
                tweet_responses = json.loads(body["body"])
                key_path = [
                    "data",
                    "user",
                    "result",
                    "timeline_v2",
                    "timeline",
                    "instructions",
                ]
                if (
                    self.safely_access_nested_dict(tweet_responses, key_path)
                    is not None
                ):
                    instructions =  tweet_responses["data"]["user"]["result"]["timeline_v2"]["timeline"]["instructions"]
                    for instruction in instructions:
                        if 'type' in instruction:
                            if instruction['type'] == 'TimelineAddEntries':
                                self._tweet_response_queue.put(instruction["entries"])
                else:
                    print("No tweets found")

                print("updated tweets")

            elif "UserMedia?" in request_url:
                request_id = response["params"]["requestId"]
                body = self.execute_cdp_cmd(
                    "Network.getResponseBody", {"requestId": request_id}
                )
                self._user_media_response = body
                self._user_media_update = time.time()
                print("updated userMedia")


def create_undetected_driver(user_folder_name, profile_folder_name) -> webdriver.Chrome:

    capabilities = DesiredCapabilities.CHROME
    capabilities["goog:loggingPrefs"] = {"performance": "ALL"}
    # chromeOptions = webdriver.ChromeOptions()
    chrome_options = uc.ChromeOptions()

    # Get current working directory
    cwd = os.getcwd()

    # Define paths for user data and profile directories
    users_path = os.path.join(cwd, "chrome", "users", user_folder_name)
    profiles_path = os.path.join(cwd, "chrome", "profiles", profile_folder_name)

    # Check if the directory exists, create it if not
    for path in [users_path, profiles_path]:
        if not os.path.exists(path):
            os.makedirs(path)

    # Add arguments to chrome options
    chrome_options.add_argument(f"--user-data-dir={users_path}")
    
        # General options to avoid pop-ups and unnecessary dialogs
    chrome_options.add_argument("--no-first-run")
    chrome_options.add_argument("--no-default-browser-check")
    chrome_options.add_argument("--disable-infobars")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-popup-blocking")
    
    
    # Additional arguments for automation and privacy
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    # chrome_options.add_argument(f"--profile-directory={profiles_path}")

    # driver = webdriver.Chrome()
    # driver = uc.Chrome(enable_cdp_events=True)
    driver = CustomChromeDriver(
        options=chrome_options,
        desired_capabilities=capabilities,
        enable_cdp_events=True
    )

    driver.execute_cdp_cmd("Network.enable", {})

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
