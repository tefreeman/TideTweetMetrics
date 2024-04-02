
from ..metrics import Metric 
from backend.encoders.tweet_encoder import Tweet
from  backend.encoders.profile_encoder import Profile
import numpy as np
from typing import Callable, Any
from backend.metrics.common_tweet_property import CommonTweetProperty
from backend.metrics.pre_compiler import TweetDataCompiler
from numpy.typing import NDArray


def build_arr(target_ctp: CommonTweetProperty) -> NDArray:
    target_arr = []
    for data in target_ctp.get_all_np_arrays().values():
        if len(data) == 0:
            pass
        
        target_arr.extend(data.tolist())
        
    return np.array(target_arr)


# Pearson correlation coefficient
class BasicCorrelationGenerator:
    def __init__(self):
        self.target_stats = [
            "tweet_likes"
        ]

    def generate_correlation(self, pre_compile: TweetDataCompiler) -> list[Metric]:
        metrics: list[Metric] = []
        for target_stat in self.target_stats:
            target_ctp: CommonTweetProperty = pre_compile.get_common_tweet_property(target_stat)
            target_arr = build_arr(target_ctp)
            
            for ctp in pre_compile.get_all_common_tweet_properties().values():
                if ctp == target_ctp:
                    continue
                
                ctp_arr = build_arr(ctp)
                corr = np.corrcoef(target_arr, ctp_arr)
                
                metric = Metric(f"PCC_{target_ctp.property_name}_{ctp.property_name}")
                metric.metric_encoder.set_axis_titles([f"{target_ctp.property_name}", f"{ctp.property_name}"])
                metric.metric_encoder.add_dataset("PCC correlation", [corr[0][1]])
                
                metrics.append(metric)
                
        
        return metrics