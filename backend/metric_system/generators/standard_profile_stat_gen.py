from typing import Callable, Any, List, Dict
import numpy as np
from backend.metric_system.metric import MetricGenerator, Metric
from backend.metric_system.helpers.profile.tweet_property_array import TweetPropertyArray
from backend.metric_system.helpers.profile.profile_with_tweet_properties import ProfileWithTweetProperties
from backend.metric_system.helpers.profile.tweet_analytics_helper import TweetAnalyticsHelper

# Define statistics names along with their corresponding functions.
STAT_NAMES = [
    ('mean', np.mean),
    ('std', np.std),
    ('min', np.min),
    ('max', np.max),
    ('sum', np.sum),
    ('count', len),
    ('median', np.median),
    ('25th_percentile', lambda x: np.percentile(x, 25)),
    ('75th_percentile', lambda x: np.percentile(x, 75))
]

class StandardProfileStatGenerator(MetricGenerator):
    """Generates standard statistical metrics for profiles."""

    def generate_metrics(self, stat_helper: TweetAnalyticsHelper, previous_metrics: Dict[str, Metric]) -> List[Metric]:
        """Generate metrics for all profiles."""
        return StandardProfileStatGenerator.gen_standard_stats_for_all_profiles(stat_helper)
    
    @staticmethod
    def gen_standard_stats_for_all_profiles(pta: TweetAnalyticsHelper) -> List[Metric]:
        """Generate standard stats for all profiles in the analytics data."""
        metrics = []
        for profile_plus in pta.get_all_profiles().values():
            metrics += StandardProfileStatGenerator.gen_standard_stats_for_profile(profile_plus)
        return metrics

    @staticmethod
    def gen_standard_stats_for_profile(profile_plus: ProfileWithTweetProperties) -> List[Metric]:
        """Generate standard stats for a single profile."""
        metrics = []
        # tpas = Tweet Property Arrays
        tpas = profile_plus.get_all_stats()
        for tpa in tpas.values():
            for stat_name, stat_func in STAT_NAMES:
                metric = Metric(profile_plus.get_username(), f"{tpa.property_name}_{stat_name}")            
                if tpa.get_count() > 0:
                    metric.metric_encoder.set_dataset([stat_func(tpa.get_arr())])                    
                metrics.append(metric)
        return metrics
