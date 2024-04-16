# List of domain entries
from typing import TypedDict
from account import Account
import database as db
import queue


class TwitterAccountManager:
    def __init__(self) -> None:
        self._up_accounts: queue.Queue[Account] = queue.Queue()
        self._down_accounts: queue.Queue[Account] = queue.Queue()

        self._load_accounts()

    def make_account_meta(self, account: dict) -> Account:
        return Account(
            username=account["username"],
            password=account["password"],
            is_working=account["is_working"],
            total_tweets_viewed=account["total_tweets_viewed"]
        )

    def _load_accounts(self):
        account_dict: list[dict] = db.get_twitter_crawling_accounts()
        accounts = [self.make_account_meta(account) for account in account_dict]
        for account in accounts:
            if account.is_working:
                self._up_accounts.put(account)
            else:
                self._down_accounts.put(account)

    def _reload_bad_accounts(self):
        print("Reloading bad accounts")
        while not self._down_accounts.empty():
            account = self._down_accounts.get()
            self._up_accounts.put(account)

    def get_account(self) -> Account:
        try:
            return self._up_accounts.get(timeout=10)
        except queue.Empty:
            self._reload_bad_accounts()
            return self._up_accounts.get(timeout=10)

    def return_online(self, account: Account):
        account.is_working = True
        db.save_crawl_account(account)
        self._up_accounts.put(account)

    def return_offline(self, account: Account):
        account.is_working = False
        db.save_crawl_account(account.to_dict())
        self._down_accounts.put(account)
