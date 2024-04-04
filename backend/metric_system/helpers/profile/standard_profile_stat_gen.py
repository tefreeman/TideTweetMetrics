from backend.metric_system.metric import Metric
from backend.encoders.tweet_encoder import Tweet
import numpy as np
from typing import Callable, Any
from backend.metric_system.helpers.profile.tweet_property_array import TweetPropertyArray
from backend.metric_system.helpers.profile.profile_with_tweet_properties import ProfileWithTweetProperties
from backend.metric_system.helpers.profile.profile_tweet_analytics import ProfileTweetAnalytics


stat_names = [
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
    
def gen_standard_stats_for_all_profiles(pta: ProfileTweetAnalytics) -> list[Metric]:
    metrics: list[Metric] = []
    for profile_plus in pta.get_all_profiles().values():
        metrics += gen_standard_stats_for_profile(profile_plus)
    return metrics
    
    

def gen_standard_stats_for_profile(profile_plus: ProfileWithTweetProperties) -> list[Metric]:
    metrics: list[Metric] = []
    tpas = profile_plus.get_all_stats() #tpas = TweetPropertyArrays
    for tpa in tpas.values():
        for stat_name, stat_func in stat_names:
            metric = Metric(profile_plus.get_username(), f"{tpa.property_name}_{stat_name}")            
            if len(tpa.get_arr()) > 0:
                metric.metric_encoder.set_dataset([stat_func(tpa.get_arr())])
                
            metrics.append(metric)

        return metrics
