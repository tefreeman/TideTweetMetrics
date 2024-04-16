class LinkHandler:
    def __init__(self, account: str, domain=None) -> None:
        self._account = account
        self._domain = None
        self._in_use = False
        self._failures = 0

    def get(self) -> str:
        if self._in_use:
            raise Exception("PageLink is in use")
        self._in_use = True
        return self._make_url()

    def set_domain(self, domain: str) -> None:
        self._domain = domain

    def get_domain(self) -> str:
        return self._domain

    def failure_count(self) -> int:
        return self._failures

    def return_failure(self):
        self._in_use = False
        self._failures += 1
        self._domain = None

    def _make_url(self) -> str:
        if self._domain is None:
            raise Exception("No domain set")
        if self._account is None:
            raise Exception("No account set")
        return f"{self._domain}/{self._account}"
