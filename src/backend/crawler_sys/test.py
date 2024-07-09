import asyncio
import base64
import nodriver as uc
import time
from nodriver import cdp
import json


class RequestMonitor:
    def __init__(self):
        self.requests = []
        self.last_request = None
        self.lock = asyncio.Lock()

    async def listen(self, page, url_substr):
        async def handler(evt):
            async with self.lock:
                if evt.response.encoded_data_length > 0 and evt.type_ is cdp.network.ResourceType.XHR and evt.response.url.find(url_substr) != -1:
                    # print(f"EVENT PERCEIVED BY BROWSER IS:- {evt.type_}") # If unsure about event or to check behaviour of browser
                    self.requests.append([evt.response.url, evt.request_id])
                    self.last_request = time.time()

        page.add_handler(cdp.network.ResponseReceived, handler)

    async def receive(self, page):
        responses = []
        retries = 0
        max_retries = 5

        # Wait at least 2 seconds after the last XHR request to get some more
        while True:
            if self.last_request is None or retries > max_retries:
                break

            if time.time() - self.last_request <= 2:
                retries += 1
                await asyncio.sleep(2)
                continue
            else:
                break

        await page  # Waiting for page operation to complete.

        # Loop through gathered requests and get its response body
        async with self.lock:
            for request in self.requests:
                try:
                    res = await page.send(cdp.network.get_response_body(request[1]))
                    if res is None:
                        continue
                    responses.append({
                        'url': request[0],
                        'body': res[0],  # Assuming res[0] is the response body
                        'is_base64': res[1]  # Assuming res[1] indicates if response is base64 encoded
                    })
                except Exception as e:
                    print("Error getting body", e)

        return responses

async def main():
    # start the browser
    request_mon = RequestMonitor()
    driver = await uc.start()
    page = await driver.get("https://twitter.com")

    await request_mon.listen(page)


    await page.get_content()

    # click on login button
    login = await page.select('[data-testid="loginButton"]')
    await login.click()

    # enter email
    email_input = await page.select('input[autocomplete="username"]')
    await email_input.send_keys("trevorefreeman@gmail.com")

    # next button
    next_btn = await page.find_element_by_text("Next")
    await next_btn.click()

    # enter password
    try:
        password_input = await page.select('input[autocomplete="current-password"]', timeout=2)
        await password_input.send_keys("Tuckfuck55!")

    except Exception as e:
        phone_verf = await page.select('[data-testid="ocfEnterTextTextInput"]')
        await phone_verf.send_keys("2053351103")


            # next button
        next_btn = await page.find_element_by_text("Next")
        await next_btn.click()

        password_input = await page.select('input[autocomplete="current-password"]')
        await password_input.send_keys("Tuckfuck55!")

    # log in button
    login_btn = await page.select('button[data-testid="LoginForm_Login_Button"]')
    await login_btn.click()

    await asyncio.sleep(7)

    responses = await request_mon.receive(page)

    print("responses!")

    #verfication [data-testid="ocfEnterTextTextInput"]


    await asyncio.sleep(1000)

if __name__ == "__main__":
    # since asyncio.run never worked (for me)
    # i use
    uc.loop().run_until_complete(main())