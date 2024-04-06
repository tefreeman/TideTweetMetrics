from backend.metric_system.metric import ComputableMetric, Metric, MetricGenerator
from backend.metric_system.helpers.profile.tweet_analytics_helper import TweetAnalyticsHelper
from backend.metric_system.metrics.metric_word_frequency import WordFrequencyMetric
from backend.metric_system.generators.gen_standard_profile_stat_gen import StandardProfileStatGenerator
from backend.metric_system.generators.gen_likes_per_follower import GenLikesPerFollower
from backend.metric_system.generators.gen_pearson_correlation_stat_generator import PearsonCorrelationProfileStatGenerator
from backend.metric_system.compiler.metrics_compiler import StatMetricCompiler
from backend.config import Config
from datetime import datetime, timedelta
import numpy as np

Config.init()



smc = StatMetricCompiler()

smc.add_metric(GenLikesPerFollower())
smc.add_metric(StandardProfileStatGenerator())
#smc.add_metric(WordFrequencyMetric())

smc.add_metric(PearsonCorrelationProfileStatGenerator())
smc.process()




print("done")
