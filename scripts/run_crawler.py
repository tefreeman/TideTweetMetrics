from backend.crawler_sys.main import crawl_job

"""
    FIXES:
    If: urllib.error.HTTPError: HTTP Error 404: Not Found then you must modify the Chrome Undetected Driver package (like the link below)
    https://stackoverflow.com/questions/78009548/selenium-urllib-error-httperror-http-error-404-not-found

    Settings to modify how many crawlers are spawned can be found in main_config.json

    This system was jerry rigged to work for Twitter after Twitter proxies went offline so many features are not implemented
    and many of the control parameters are not used. This system is not meant to be used in a production environment.


"""
crawl_job()