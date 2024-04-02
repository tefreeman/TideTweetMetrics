from ..metrics import Metric 
from backend.encoders.tweet_encoder import Tweet
from  backend.encoders.profile_encoder import Profile
import numpy as np
from typing import Callable, Any
from backend.metrics.common_tweet_property import CommonTweetProperty



class BasicMetricGenerator:
    def __init__(self) -> None:
        self.stat_names = [
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
        
    
    def generate_metrics(self, ctp: CommonTweetProperty) -> list[Metric]:
        metrics: list[Metric] = []
        for stat_name, stat_func in self.stat_names:
            metric = Metric(f"{ctp.property_name}_{stat_name}")
            metric.metric_encoder.set_axis_titles(["username", f"{ctp.property_name}_{stat_name}"])
            
            for user, data in ctp.get_all_np_arrays().items():
                if len(data) > 0:
                    metric.metric_encoder.add_dataset(user, [(stat_func(data),)])
                
            metrics.append(metric)
        
        return metrics
    