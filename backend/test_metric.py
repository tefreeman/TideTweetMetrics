from backend.metrics.tweet_property_profile_compiler import TweetPropertyProfileCompiler
from backend.metrics.basic_metric_generator import generate_metrics
from backend.metrics.metrics_compiler import StatMetricCompiler
from backend.metrics.common.basic_correlation_generator import BasicCorrelationGenerator
from backend.config import Config
import numpy as np

Config.init()

test = TweetPropertyProfileCompiler()

test.compute_stats_for_all_profiles()

output = {}

for k, v in test.get_all_profiles().items():
    output[k] = generate_metrics(v)
    
+print("done")
