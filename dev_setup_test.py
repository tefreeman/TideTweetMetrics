from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
import time

driver = webdriver.Chrome()
driver.get("https://www.shitexpress.com/")

elem = driver.find_element(By.ID, "preorder-toggle")
driver.execute_script("window.scrollTo(0, 500)")
time.sleep(1)
elem.click()
name = driver.find_element(By.ID, "order-name")
name.send_keys("Trevor Freeman")
time.sleep(5)
driver.close()