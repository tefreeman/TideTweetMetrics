from backend.metric_system.helpers.profile.tweet_analytics_helper import TweetAnalyticsHelper
from backend.metric_system.generators.gen_standard_profile_stat_gen import BasicMetricGenerator
from backend.metric_system.compiler.metrics_compiler import StatMetricCompiler
from backend.config import Config
import numpy as np

Config.init()

test = StatMetricCompiler(True)
test.pre_process()

ctp = test.get_preprossed_compiler()
bmg = BasicMetricGenerator()

all_props = ctp.get_all_common_tweet_properties()

for prop in all_props:
    metrics = bmg.generate_metrics(all_props[prop])
    for metric in metrics:
        test.add_pre_processed_metric(metric)


test.process()

print("done")

