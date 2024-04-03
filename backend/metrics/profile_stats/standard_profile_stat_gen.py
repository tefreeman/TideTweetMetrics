from ..metrics import Metric 
from backend.encoders.tweet_encoder import Tweet
import numpy as np
from typing import Callable, Any
from backend.metrics.profile_stats.tweet_property_array import TweetPropertyArray
from backend.metrics.profile_stats.profile_with_tweet_properties import ProfileWithTweetProperties
from backend.metrics.profile_stats.tweet_property_profile_compiler import TweetPropertyProfileCompiler


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
    
    

def gen_standard_stats_for_profile(profile_plus: ProfileWithTweetProperties) -> list[Metric]:
    metrics: list[Metric] = []
    tpas = profile_plus.get_all_stats() #tpas = TweetPropertyArrays
    for key, tpa in tpas.items():
        for stat_name, stat_func in stat_names:
            metric = Metric(f"{tpa.property_name}_{stat_name}")
            metric.metric_encoder.set_axis_titles(["username", f"{tpa.property_name}_{stat_name}"])
            
            if len(tpa.get_arr()) > 0:
                metric.metric_encoder.set_dataset(profile_plus.get_username(), [stat_func(tpa.get_arr())])
                
            metrics.append(metric)

        return metrics
