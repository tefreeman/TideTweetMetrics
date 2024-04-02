from backend.metrics.pre_compiler import TweetDataCompiler
from backend.metrics.common.basic_metric_generator import BasicMetricGenerator
from backend.metrics.metrics_compiler import StatMetricCompiler
from backend.metrics.common.basic_correlation_generator import BasicCorrelationGenerator
from backend.config import Config
import numpy as np

Config.init()

test = StatMetricCompiler()
test.pre_process()

pre_compiled = test.get_preprossed_compiler()
bmg = BasicMetricGenerator()

all_props = pre_compiled.get_all_common_tweet_properties()

bcg = BasicCorrelationGenerator()
correlation_metrics = bcg.generate_correlation(pre_compiled)
for metric in correlation_metrics:
    test.add_pre_processed_metric(metric)

for prop in all_props:
    metrics = bmg.generate_metrics(all_props[prop])
    for metric in metrics:
        test.add_pre_processed_metric(metric)




test.Process()

print("done")

