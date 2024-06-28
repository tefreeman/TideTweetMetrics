# List of domain entries
from typing import TypedDict
from account import Account
import database as db
import queue


class TwitterAccountManager:
    """
    Manages Twitter accounts for crawling.

    Attributes:
        _up_accounts (queue.Queue[Account]): Queue of active accounts.
        _down_accounts (queue.Queue[Account]): Queue of inactive accounts.
    """

    def __init__(self) -> None:
        """
        Initializes the TwitterAccountManager object.

        It initializes the queues for active and inactive accounts and loads the accounts from the database.
        """
        self._up_accounts: queue.Queue[Account] = queue.Queue()
        self._down_accounts: queue.Queue[Account] = queue.Queue()

        self._load_accounts()

    def make_account_meta(self, account: dict) -> Account:
        """
        Creates an Account object from a dictionary.

        Args:
            account (dict): Dictionary containing account information.

        Returns:
            Account: An Account object created from the dictionary.
        """
        return Account(
            username=account["username"],
            password=account["password"],
            is_working=account["is_working"],
            lifetime_views=account["total_tweets_viewed"],
        )

    def _load_accounts(self):
        """
        Loads accounts from the database and populates the queues.

        It retrieves account information from the database, creates Account objects, and adds them to the appropriate queue.
        """
        account_dict: list[dict] = db.get_twitter_crawling_accounts()
        accounts = [self.make_account_meta(account) for account in account_dict]
        for account in accounts:
            if account.is_working:
                self._up_accounts.put(account)
            else:
                self._down_accounts.put(account)

    def _reload_bad_accounts(self):
        """
        Reloads inactive accounts into the active accounts queue.

        It moves accounts from the inactive accounts queue to the active accounts queue.
        """
        print("Reloading bad accounts")
        while not self._down_accounts.empty():
            account = self._down_accounts.get()
            self._up_accounts.put(account)

    def get_account(self) -> Account:
        """
        Retrieves an active account from the queue.

        Returns:
            Account: An active Account object.
        """
        try:
            return self._up_accounts.get(timeout=10)
        except queue.Empty:
            self._reload_bad_accounts()
            return self._up_accounts.get(timeout=10)

    def return_online(self, account: Account):
        """
        Marks an account as online and saves it to the database.

        Args:
            account (Account): The Account object to mark as online.
        """
        account.is_working = True
        db.save_crawl_account(account)
        self._up_accounts.put(account)

    def return_offline(self, account: Account):
        """
        Marks an account as offline and saves it to the database.

        Args:
            account (Account): The Account object to mark as offline.
        """
        account.is_working = False
        db.save_crawl_account(account.to_dict())
        self._down_accounts.put(account)
