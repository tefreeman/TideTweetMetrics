import json
from backend.crawler_sys.utils.backup import next_zip_num, init_backup_dirs

__CONFIG = None
_next_backup_zip_id = None


class Config:
    """
    This class represents the configuration settings for the crawler system.
    It provides methods to access and retrieve various configuration parameters.
    """

    def __new__(cls):
        """
        Raises a TypeError if an attempt is made to instantiate the Config class.
        Static classes cannot be instantiated.
        """
        raise TypeError("Static classes cannot be instantiated")

    @staticmethod
    def init() -> None:
        """
        Initializes the configuration settings.
        Loads the configuration from the main_config.json file.
        Initializes backup directories and sets the next backup zip ID.
        """
        global _next_backup_zip_id
        Config.Load()
        init_backup_dirs(Config.get_raw_backup_dir(), Config.get_backup_dir())
        _next_backup_zip_id = next_zip_num()

    @staticmethod
    def db_name() -> str:
        """
        Returns the name of the database.
        """
        return __CONFIG["DB"]["NAME"]

    @staticmethod
    def db_host() -> str:
        """
        Returns the host of the database.
        """
        return __CONFIG["DB"]["HOST"]

    @staticmethod
    def db_port() -> int:
        """
        Returns the port of the database.
        """
        return __CONFIG["DB"]["PORT"]

    @staticmethod
    def db_user() -> str:
        """
        Returns the user of the database.
        """
        return __CONFIG["DB"]["USER"]

    @staticmethod
    def db_password() -> str:
        """
        Returns the password of the database.
        """
        return __CONFIG["DB"]["PASSWORD"]

    @staticmethod
    def get_profile_min_update_time_hours() -> int:
        """
        Returns the minimum update time for a profile in hours.
        """
        return __CONFIG["CRAWLER"]["PROFILE_MIN_UPDATE_TIME"]

    @staticmethod
    def crawler_threads() -> str:
        """
        Returns the number of crawler threads.
        """
        return __CONFIG["CRAWLER"]["NUM_THREADS"]

    @staticmethod
    def get_version() -> str:
        """
        Returns the version of the crawler system.
        """
        return __CONFIG["VERSION"]

    @staticmethod
    def get_sleep_time() -> int:
        """
        Returns the sleep time between crawler requests in seconds.
        """
        return __CONFIG["CRAWLER"]["SLEEP_TIME"]

    @staticmethod
    def get_max_page_load_time() -> int:
        """
        Returns the maximum page load time for a URL in seconds.
        """
        return __CONFIG["CRAWLER"]["MAX_PAGE_LOAD_TIME"]

    @staticmethod
    def next_run_backup_zip_id() -> int:
        """
        Returns the next backup zip ID.
        """
        return _next_backup_zip_id

    @staticmethod
    def get_max_url_page_error() -> int:
        """
        Returns the maximum number of URL page errors allowed.
        """
        return __CONFIG["CRAWLER"]["MAX_URL_PAGE_ERROR"]

    @staticmethod
    def max_profile_tweet_crawl_depth() -> int:
        """
        Returns the maximum depth for crawling tweets of a profile.
        """
        return __CONFIG["CRAWLER"]["MAX_TWEET_CRAWL_DEPTH"]

    @staticmethod
    def get_backup_dir() -> str:
        """
        Returns the backup directory path.
        """
        return __CONFIG["BACKUP"]["DIR"]

    def get_raw_backup_dir() -> str:
        """
        Returns the raw backup directory path.
        """
        return __CONFIG["BACKUP"]["RAW_DIR"]

    @staticmethod
    def Load():
        """
        Loads the configuration settings from the main_config.json file.
        """
        global __CONFIG
        with open("main_config.json", "r") as f:
            test = f.read()
            __CONFIG = json.loads(test)
