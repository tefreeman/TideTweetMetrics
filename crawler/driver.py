import json
from typing import Callable, Optional
import undetected_chromedriver as uc
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import time

#TODO: Implement a method to create a driver that is undetected
# This method should return a webdriver.Chrome object
# Create other functions as needed

def create_undetected_driver()-> webdriver.Chrome:
    
    capabilities = DesiredCapabilities.CHROME
    capabilities['goog:loggingPrefs'] = {'performance': 'ALL'}
    #chromeOptions = webdriver.ChromeOptions()
    #driver = uc.Chrome(enable_cdp_events=True)
    driver = uc.Chrome(options=uc.ChromeOptions())
    
    # additional method via monkey patching
    driver.get_status_code: Callable[[], Optional[int]] = lambda: _get_status_code(driver)
    return driver

def _get_status_code(self: webdriver.Chrome) -> Optional[int]:
    for entry in self.get_log('performance'):
        for k, v in entry.items():
            if k == 'message' and 'status' in v:
                msg = json.loads(v)['message']['params']
                for mk, mv in msg.items():
                    if mk == 'response':
                        response_url = mv['url']
                        response_status = mv['status']
                        if response_url == self.current_url:
                            return response_status

