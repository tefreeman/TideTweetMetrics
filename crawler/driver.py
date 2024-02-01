from selenium import webdriver



#TODO: Implement a method to create a driver that is undetected
# This method should return a webdriver.Chrome object
# Create other functions as needed

def create_undetected_driver()-> webdriver.Chrome:
    chromeOptions = webdriver.ChromeOptions()
    return webdriver.Chrome()