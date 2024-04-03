from backend.metrics.profile_stats.tweet_property_profile_compiler import TweetPropertyProfileCompiler
from backend.metrics.profile_stats.standard_profile_stat_gen import BasicMetricGenerator
from backend.metrics.metrics_compiler import StatMetricCompiler
from backend.config import Config
import numpy as np

Config.init()

test = StatMetricCompiler()
test.pre_process()

ctp = test.get_preprossed_compiler()
bmg = BasicMetricGenerator()

all_props = ctp.get_all_common_tweet_properties()

for prop in all_props:
    metrics = bmg.generate_metrics(all_props[prop])
    for metric in metrics:
        test.add_pre_processed_metric(metric)


test.Process()

print("done")

