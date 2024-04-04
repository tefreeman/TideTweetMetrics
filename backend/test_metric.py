from backend.metrics.metrics import ComputableMetric, Metric, MetricGenerator
from backend.metrics.profile_stats.profile_tweet_analytics import ProfileTweetAnalytics
from backend.metrics.likes_per_tweet_len import WordFrequencyMetric
from backend.metrics.profile_stats.standard_profile_stat_gen import gen_standard_stats_for_all_profiles
from backend.metrics.metrics_compiler import StatMetricCompiler
from backend.config import Config
import numpy as np

Config.init()



smc = StatMetricCompiler()
pta = ProfileTweetAnalytics()
pta.compute_stats_for_all_profiles()
pta.compute_global_stats_over_all_profiles()
metrics = gen_standard_stats_for_all_profiles(pta)

for metric in metrics:
    smc.add_metric(metric)
    

wfm = WordFrequencyMetric()
smc.add_metric(wfm)

smc.Process()





print("done")
