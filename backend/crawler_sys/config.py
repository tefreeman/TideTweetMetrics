import json
from utils.backup import next_zip_num, init_backup_dirs

__CONFIG = None
_next_backup_zip_id = None

class Config:

    def __new__(cls):
        raise TypeError("Static classes cannot be instantiated")

    @staticmethod
    def init() -> None:
        global _next_backup_zip_id
        Config.Load()
        init_backup_dirs(Config.get_raw_backup_dir(), Config.get_backup_dir())
        _next_backup_zip_id = next_zip_num()

    @staticmethod
    def db_name() -> str:
        return __CONFIG["DB"]["NAME"]

    @staticmethod
    def db_host() -> str:
        return __CONFIG["DB"]["HOST"]

    @staticmethod
    def db_port() -> int:
        return __CONFIG["DB"]["PORT"]

    @staticmethod
    def db_user() -> str:
        return __CONFIG["DB"]["USER"]

    @staticmethod
    def db_password() -> str:
        return __CONFIG["DB"]["PASSWORD"]

    @staticmethod
    def get_profile_min_update_time_hours() -> int:
        return __CONFIG["CRAWLER"]["PROFILE_MIN_UPDATE_TIME"]

    @staticmethod
    def crawler_threads() -> str:
        return __CONFIG["CRAWLER"]["NUM_THREADS"]

    @staticmethod
    def get_version() -> str:
        return __CONFIG["VERSION"]

    @staticmethod
    def get_sleep_time() -> int:
        return __CONFIG["CRAWLER"]["SLEEP_TIME"]

    @staticmethod
    def get_max_page_load_time() -> int:
        return __CONFIG["CRAWLER"]["MAX_PAGE_LOAD_TIME"]

    @staticmethod
    def next_run_backup_zip_id() -> int:
        return _next_backup_zip_id

    @staticmethod
    def get_max_url_page_error() -> int:
        return __CONFIG["CRAWLER"]["MAX_URL_PAGE_ERROR"]

    @staticmethod
    def max_profile_tweet_crawl_depth() -> int:
        return __CONFIG["CRAWLER"]["MAX_TWEET_CRAWL_DEPTH"]

    @staticmethod
    def get_backup_dir() -> str:
        return __CONFIG["BACKUP"]["DIR"]

    def get_raw_backup_dir() -> str:
        return __CONFIG["BACKUP"]["RAW_DIR"]

    @staticmethod
    def Load():
        global __CONFIG
        with open("main_config.json", "r") as f:
            test = f.read()
            __CONFIG = json.loads(test)
