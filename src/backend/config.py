import json
from dotenv import load_dotenv
from backend.crawler_sys.utils.backup import next_zip_num, init_backup_dirs
import os


class Config:
    __CONFIG = None
    _next_backup_zip_id = None

    def __new__(cls):
        raise TypeError("Static classes cannot be instantiated")

    @staticmethod
    def init() -> None:
        Config.Load()
        init_backup_dirs(Config.get_raw_backup_dir(), Config.get_backup_dir())
        Config._next_backup_zip_id = next_zip_num()

    @staticmethod
    def db_name() -> str:
        return Config.__CONFIG["DB"]["NAME"]

    def overwrite_db_name(new_name: str) -> None:
        Config.__CONFIG["DB"]["NAME"] = new_name

    @staticmethod
    def db_host() -> str:
        return os.getenv("DB_HOST")

    @staticmethod
    def db_port() -> int:
        return Config.__CONFIG["DB"]["PORT"]

    @staticmethod
    def db_user() -> str:
        return os.getenv("DB_USER")

    @staticmethod
    def db_password() -> str:
        return os.getenv("DB_PASSWORD")

    @staticmethod
    def get_profile_min_update_time_hours() -> int:
        return Config.__CONFIG["CRAWLER"]["PROFILE_MIN_UPDATE_TIME"]

    @staticmethod
    def crawler_threads() -> str:
        return Config.__CONFIG["CRAWLER"]["NUM_THREADS"]

    @staticmethod
    def get_version() -> str:
        return Config.__CONFIG["VERSION"]

    @staticmethod
    def get_sleep_time() -> int:
        return Config.__CONFIG["CRAWLER"]["SLEEP_TIME"]

    @staticmethod
    def get_max_page_load_time() -> int:
        return Config.__CONFIG["CRAWLER"]["MAX_PAGE_LOAD_TIME"]

    @staticmethod
    def next_run_backup_zip_id() -> int:
        return Config._next_backup_zip_id

    @staticmethod
    def get_max_url_page_error() -> int:
        return Config.__CONFIG["CRAWLER"]["MAX_URL_PAGE_ERROR"]

    @staticmethod
    def max_profile_tweet_crawl_depth() -> int:
        return Config.__CONFIG["CRAWLER"]["MAX_TWEET_CRAWL_DEPTH"]

    @staticmethod
    def email_key() -> str:
        return os.getenv("EMAIL_KEY")
    
    @staticmethod
    def api_secret_key() -> str:
        return os.getenv("API_SECRET")

    @staticmethod
    def get_gpt_org_id() -> str:
        return os.getenv("GPT_ORG_ID")
    

    @staticmethod
    def get_gpt_api_key() -> str:
        return os.getenv("GPT_API_KEY")
    
    @staticmethod
    def get_gpt_project_id() -> str:
        return os.getenv("GPT_PROJ_ID")

    @staticmethod
    def get_backup_dir() -> str:
        return Config.__CONFIG["BACKUP"]["DIR"]

    @staticmethod
    def get_raw_backup_dir() -> str:
        return Config.__CONFIG["BACKUP"]["RAW_DIR"]

    @staticmethod
    def load_env() -> None:
        load_dotenv()

    @staticmethod
    def Load():
        print(os.getcwd())
        with open("config/main_config.json", "r") as f:
            test = f.read()
            Config.__CONFIG = json.loads(test)
        load_dotenv()


