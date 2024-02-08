from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
import time

driver = webdriver.Chrome()

driver.get("https://nitter.soopy.moe/alabama_cs")
elements = driver.find_elements(By.CLASS_NAME, "timeline-item")

    

time.sleep(20)
