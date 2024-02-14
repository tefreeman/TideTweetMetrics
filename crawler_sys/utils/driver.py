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
    #chrome_options = uc.ChromeOptions()
    driver = webdriver.Chrome()
    #driver = uc.Chrome(enable_cdp_events=True)
    #driver = uc.Chrome(options=chrome_options, desired_capabilities=capabilities)
    
    # additional method via monkey patching
    driver.get_status_code: Callable[[], Optional[int]] = lambda: _get_status_code(driver)
    driver.has_connection: Callable[[], bool] = lambda: _has_connection(driver)
    driver.set_window_size(640,480)
    
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


def _has_connection(self: webdriver.Chrome) -> bool:
    try:
        self.driver.find_element_by_xpath('//span[@jsselect="heading" and @jsvalues=".innerHTML:msg"]')
        return False
    except: return True