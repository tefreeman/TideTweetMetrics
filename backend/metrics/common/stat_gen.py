from ..metrics import Metric 
from encoders.tweet_encoder import Tweet
from encoders.profile_encoder import Profile
import numpy as np
from typing import Callable, Any

class StatGenMetric(Metric):
    def __init__(self, prop_name:str, data_extractor_func: Callable[[Tweet], Any], dtype):
        super().__init__("StatGen_" + prop_name,  update_over_tweets=True, update_over_profiles=True, encoder_count=9)
        self.data_extractor_func = data_extractor_func
        self.prop_name = prop_name
        self.dtype = dtype
        self.profiles = {}

    def UpdateByProfile(self, profile):
        self.profiles[profile.get_username()] = []
        
    def UpdateByTweet(self, tweet):
        # Fix if its not in profiles:
        if tweet.get_author() not in self.profiles:
            return

        self.profiles[tweet.get_author()].append(self.data_extractor_func(tweet))
                 
        
    def FinalUpdate(self, tweet_stats, profile_stats):
        profile_out_mean = {}
        profile_out_std = {}
        profile_out_min = {}
        profile_out_max = {}
        profile_out_sum = {}
        profile_out_count = {}
        profile_out_median = {}
        profile_out_25th_percentile = {}
        profile_out_75th_percentile = {}
        
        for profile in self.profiles.keys():
            if len(self.profiles[profile]) == 0:
                continue
            profile_out_mean[profile] = np.mean(self.profiles[profile]).item()
            profile_out_std[profile] = np.std(self.profiles[profile]).item()
            profile_out_min[profile] = np.min(self.profiles[profile]).item()
            profile_out_max[profile] = np.max(self.profiles[profile]).item()
            profile_out_sum[profile]= np.sum(self.profiles[profile]).item()
            profile_out_count[profile] = len(self.profiles[profile])
            profile_out_median[profile] = np.median(self.profiles[profile]).item()
            profile_out_25th_percentile[profile] = np.percentile(self.profiles[profile], 25).item()
            profile_out_75th_percentile[profile] = np.percentile(self.profiles[profile], 75).item()

        
        # Build up the metric encoder
        self.metric_encoders[0].set_name("Profiles_" + self.prop_name + "_mean")
        self.metric_encoders[0].set_axis_titles(["Profile ", self.prop_name + "_mean"])
        for p in profile_out_mean:            
            self.metric_encoders[0].add_dataset(p, (profile_out_mean[p],))
        self.metric_encoders[1].set_name("Profiles_" + self.prop_name + "_std")
        self.metric_encoders[1].set_axis_titles(["Profile ", self.prop_name + "_std"])          
        for p in profile_out_std:            
            self.metric_encoders[1].add_dataset(p, (profile_out_std[p],))
        self.metric_encoders[2].set_name("Profiles_" + self.prop_name + "_min")
        self.metric_encoders[2].set_axis_titles(["Profile ", self.prop_name + "_min"])
        for p in profile_out_min:            
            self.metric_encoders[2].add_dataset(p, (profile_out_min[p],))
        self.metric_encoders[3].set_name("Profiles_" + self.prop_name + "_max")
        self.metric_encoders[3].set_axis_titles(["Profile ", self.prop_name + "_max"])
        for p in profile_out_max:            
            self.metric_encoders[3].add_dataset(p, (profile_out_max[p],))
        self.metric_encoders[4].set_name("Profiles_" + self.prop_name + "_sum")
        self.metric_encoders[4].set_axis_titles(["Profile ", self.prop_name + "_sum"])
        for p in profile_out_sum:            
            self.metric_encoders[4].add_dataset(p, (profile_out_sum[p],))
    
        self.metric_encoders[5].set_name("Profiles_" + self.prop_name + "_count")
        self.metric_encoders[5].set_axis_titles(["Profile ", self.prop_name + "_count"])
        for p in profile_out_count:            
            self.metric_encoders[5].add_dataset(p, (profile_out_count[p],))
        
        self.metric_encoders[6].set_name("Profiles_" + self.prop_name + "_median")
        self.metric_encoders[6].set_axis_titles(["Profile ", self.prop_name + "_median"])
        for p in profile_out_median:            
            self.metric_encoders[6].add_dataset(p, (profile_out_median[p],))
            
    
        self.metric_encoders[7].set_name("Profiles_" + self.prop_name + "_25th_percentile")
        self.metric_encoders[7].set_axis_titles(["Profile ", self.prop_name + "_25th_percentile"])
        for p in profile_out_25th_percentile:            
            self.metric_encoders[7].add_dataset(p, (profile_out_25th_percentile[p],))
            
        self.metric_encoders[8].set_name("Profiles_" + self.prop_name + "_75th_percentile")
        self.metric_encoders[8].set_axis_titles(["Profile ", self.prop_name + "_75th_percentile"])
        for p in profile_out_75th_percentile:            
            self.metric_encoders[8].add_dataset(p, (profile_out_75th_percentile[p],))