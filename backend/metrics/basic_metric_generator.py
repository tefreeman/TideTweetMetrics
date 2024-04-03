from .metrics import Metric 
from backend.encoders.tweet_encoder import Tweet
import numpy as np
from typing import Callable, Any
from backend.metrics.tweet_property_array import TweetPropertyArray
from backend.metrics.profile_with_tweet_properties import ProfileWithTweetProperties



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


def generate_metrics(profile_plus: ProfileWithTweetProperties) -> list[Metric]:
    metrics: list[Metric] = []
    ctps = profile_plus.get_all_stats()
    for k, ctp in ctps.items():
        for stat_name, stat_func in stat_names:
            metric = Metric(f"{ctp.property_name}_{stat_name}")
            metric.metric_encoder.set_axis_titles(["username", f"{ctp.property_name}_{stat_name}"])
            
            if len(ctp.get_arr()) > 0:
                metric.metric_encoder.add_dataset(profile_plus.get_username(), [stat_func(ctp.get_arr())])
                
            metrics.append(metric)

        return metrics
