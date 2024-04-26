from backend.metric_system.build import build_metrics
from backend.config import Config

Config.init()

build_metrics("full_metric_output.json", debug_mode=False)