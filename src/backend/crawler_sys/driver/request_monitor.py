import asyncio
import nodriver as uc
import time
from nodriver import cdp


class RequestMonitor:
    def __init__(self, url_substrs):
        self.requests = []
        self.last_request = None
        self.url_substrs = url_substrs
        self.lock = asyncio.Lock()

    async def listen(self, page):
        async def handler(evt):
            async with self.lock:
                if evt.response.encoded_data_length > 0 and evt.type_ is cdp.network.ResourceType.XHR:
                    if any([substr in evt.response.url for substr in self.url_substrs]):
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