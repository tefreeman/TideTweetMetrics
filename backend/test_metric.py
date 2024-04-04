from backend.metric_system.metric import ComputableMetric, Metric, MetricGenerator
from backend.metric_system.helpers.profile.tweet_analytics_helper import TweetAnalyticsHelper
from backend.metric_system.metrics.cmetric_word_frequency import WordFrequencyMetric
from backend.metric_system.generators.standard_profile_stat_gen import StandardProfileStatGenerator
from backend.metric_system.metrics_compiler import StatMetricCompiler
from backend.config import Config
import numpy as np

Config.init()



smc = StatMetricCompiler(True)


smc.add_metric_generator(StandardProfileStatGenerator())
smc.add_uncompiled_metric(WordFrequencyMetric())
    
smc.Process()


out = smc.to_json()


print("done")
