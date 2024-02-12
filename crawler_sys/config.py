import json


class Config:
    __CONFIG = None
    
    def __new__(cls):
        raise TypeError('Static classes cannot be instantiated')
    
    @staticmethod
    def db_name() -> str:
        return Config.__CONFIG["DB"]["NAME"]

    @staticmethod
    def db_host() -> str:
        return Config.__CONFIG["DB"]["HOST"]
    
    @staticmethod
    def db_port() -> int:
        return Config.__CONFIG["DB"]["PORT"]

    @staticmethod
    def db_user() -> str:
        return Config.__CONFIG["DB"]["USER"]

    @staticmethod
    def db_password() -> str:
        return Config.__CONFIG["DB"]["PASSWORD"]


    @staticmethod
    def crawler_threads() -> str:
        return Config.__CONFIG["CRAWLER"]["NUM_THREADS"]
    
    @staticmethod
    def get_version() -> str:
        return Config.__CONFIG["VERSION"]
    
    @staticmethod
    def Load():
        with open("config.json", "r") as f:
            test = f.read()
            Config.__CONFIG = json.loads(test)
        

    
    

