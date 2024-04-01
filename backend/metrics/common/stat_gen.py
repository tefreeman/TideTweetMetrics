from ..metrics import Metric 
from encoders.tweet_encoder import Tweet
from encoders.profile_encoder import Profile
import numpy as np
from typing import Callable, Any


# TODO: make this faster by using numpy arrays and not computing the statistics all at once
class StatGenMetric(Metric):
    def __init__(self, prop_name:str, data_extractor_func: Callable[[Tweet], Any], dtype):
        super().__init__("statgen_" + prop_name,  update_over_tweets=True, update_over_profiles=True, encoder_count=9)
        self.data_extractor_func = data_extractor_func
        self.prop_name = prop_name
        self.dtype = dtype
        self.profiles = {}

    def update_by_profile(self, profile):
        self.profiles[profile.get_username()] = []

    def compute_profile_statistics(self, profile_data):
            if len(profile_data) == 0:
                return None
            return {
                'mean': np.mean(profile_data).item(),
                'std': np.std(profile_data).item(),
                'min': np.min(profile_data).item(),
                'max': np.max(profile_data).item(),
                'sum': np.sum(profile_data).item(),
                'count': len(profile_data),
                'median': np.median(profile_data).item(),
                '25th_percentile': np.percentile(profile_data, 25).item(),
                '75th_percentile': np.percentile(profile_data, 75).item(),
            }
            
    def update_metric_encoders(self, profile_stats):
        stats_names = ['mean', 'std', 'min', 'max', 'sum', 'count', 'median', '25th_percentile', '75th_percentile']
        for i, stat in enumerate(stats_names):
            self.metric_encoders[i].set_name(f"{self.prop_name}_{stat}")
            self.metric_encoders[i].set_axis_titles(["Profile", f"{self.prop_name}_{stat}"])
            for profile, stats in profile_stats.items():
                if stats:  # Only update if stats are not None
                    self.metric_encoders[i].add_dataset(profile, [(stats[stat],)])

    def update_by_tweet(self, tweet):
        # Fix if its not in profiles:
        if tweet.get_author() not in self.profiles:
            return

        self.profiles[tweet.get_author()].append(self.data_extractor_func(tweet))
                     
    def final_update(self, tweet_stats, profile_stats):
        profile_stats_out = {}
        for profile, data in self.profiles.items():
            profile_stats = self.compute_profile_statistics(data)
            if profile_stats:
                profile_stats_out[profile] = profile_stats
        
        self.update_metric_encoders(profile_stats_out)