import nodriver as uc
from backend.crawler_sys.driver.request_monitor import RequestMonitor

# will flesh out with config and profile settings
class Driver:
    def __init__(self) -> None:  
        self._driver: uc.Browser = None
        self._req_mon = RequestMonitor(["UserTweets?"])

    async def start_window(self):
        self._driver = await uc.start()
        await self.init_listeners(self._driver.main_tab, )
        return self._driver

    def stop(self):
        self._driver.stop()

    async def init_listeners(self, main_tab):
        await self._req_mon.listen(main_tab)

    



