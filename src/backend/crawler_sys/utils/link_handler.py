class LinkHandler:
    """
    A class that handles generating URLs for a given account and domain.

    Attributes:
        _account (str): The account associated with the URL.
        _domain (str): The domain associated with the URL.
        _in_use (bool): Indicates whether the LinkHandler is currently in use.
        _failures (int): The number of failures encountered by the LinkHandler.
    """

    def __init__(self, account: str, domain=None) -> None:
        """
        Initializes a new instance of the LinkHandler class.

        Args:
            account (str): The account associated with the URL.
            domain (str, optional): The domain associated with the URL. Defaults to None.
        """
        self._account = account
        self._domain = None
        self._in_use = False
        self._failures = 0

    def get(self) -> str:
        """
        Returns a URL for the account and domain.

        Raises:
            Exception: If the LinkHandler is already in use.
            Exception: If no domain is set.
            Exception: If no account is set.

        Returns:
            str: The generated URL.
        """
        if self._in_use:
            raise Exception("PageLink is in use")
        self._in_use = True
        return self._make_url()

    def set_domain(self, domain: str) -> None:
        """
        Sets the domain for the LinkHandler.

        Args:
            domain (str): The domain to set.
        """
        self._domain = domain

    def get_domain(self) -> str:
        """
        Returns the domain associated with the LinkHandler.

        Returns:
            str: The domain associated with the LinkHandler.
        """
        return self._domain

    def failure_count(self) -> int:
        """
        Returns the number of failures encountered by the LinkHandler.

        Returns:
            int: The number of failures encountered.
        """
        return self._failures

    def return_failure(self):
        """
        Resets the LinkHandler after a failure.
        """
        self._in_use = False
        self._failures += 1
        self._domain = None

    def _make_url(self) -> str:
        """
        Generates a URL using the account and domain.

        Raises:
            Exception: If no domain is set.
            Exception: If no account is set.

        Returns:
            str: The generated URL.
        """
        if self._domain is None:
            raise Exception("No domain set")
        if self._account is None:
            raise Exception("No account set")
        return f"{self._domain}/{self._account}"
