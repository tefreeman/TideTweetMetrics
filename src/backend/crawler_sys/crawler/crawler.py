from transitions import Machine, State
import asyncio
from backend.crawler_sys.driver.driver import Driver
from nodriver import Browser, Tab


class Crawler:
    states = [
        State(name='error', on_enter=['on_error']),
        State(name='start_browser', on_enter=['on_start_browser']),
        State(name='next_target', on_enter=['on_next_target']),
        State(name='login', on_enter=['on_login'])
    ]

    def __init__(self, driver: Driver) -> None:
        self.driver = driver
        self.browser: Browser = None
        self.page: Tab = None

        self.machine = Machine(model=self, states=Crawler.states, initial='start_browser')
        self.machine.add_transition(trigger='to_next_target', source='start_browser', dest='next_target')
        self.machine.add_transition(trigger='fail_to_next_target', source='next_target', dest='login')
        self.machine.add_transition(trigger='login_success', source='login', dest='next_target')
        self.machine.add_transition(trigger='login_failure', source='login', dest='error')
        self.machine.add_transition(trigger='to_error', source='*', dest='error')


    async def on_start_browser(self):
        try:
            success = await start_browser(self)
            if success:
                self.to_next_target()
            else:
                self.to_error()
            
        except Exception as e:
            print(f"Error starting browser: {e}")
            self.error()


    async def on_next_target(self):
        success = await next_target(self)

        if success:
            self.fail_to_next_target()
        
        else:
            self.fail_to_next_target()

    async def on_login(self):
        success = await login(self)
        if success:
            self.login_success()
        else:
            self.login_failure()


async def start_browser(crawler: Crawler):
    print("Starting browser")
    crawler.browser = await crawler.driver.start_window()
    return True



async def next_target(crawler: Crawler):
    print("Executing next_target")
    crawler.page = await crawler.browser.get("https://x.com/")

    return False

    if page.status == 200:
        return True
    return False

async def login(crawler):
    print("Executing login")
    page: Tab = crawler.page

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

async def run_crawler():
    crawler = Crawler(Driver())

    while True:
        await asyncio.sleep(1)
        if crawler.state == 'start_browser':
            await crawler.on_start_browser()
        if crawler.state == 'next_target':
            await crawler.on_next_target()
        elif crawler.state == 'login':
            await crawler.on_login()

if __name__ == "__main__":
    asyncio.run(run_crawler())
