from backend.middleware.requests.upload_metrics import upload_metrics
from backend.metric_system.build import build_metrics
from backend.config import Config
from time import sleep

Config.init()
build_metrics('full_metric_output.json')
sleep(2)
upload_metrics('full_metric_output.json')

