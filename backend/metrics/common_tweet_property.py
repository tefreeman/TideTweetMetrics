import numpy as np
from numpy.typing import NDArray
from backend.encoders.tweet_encoder import Tweet
from typing import Callable, Any

class CommonTweetProperty:
    def __init__(self, property_name: str, extractor_func: Callable[[Tweet], Any], dtype: np.dtype):
        self.property_name = property_name
        self.extractor_func: Callable[[Tweet], Any] = extractor_func
        self.dtype = dtype
        self.count = 0
        
        self.internal_arr: tuple[np.array | None]= None
        self.profiles = {}
        
    def init_profile(self, tweet_len: int):
        self.count = 0            
        self.internal_arr = np.zeros(tweet_len, dtype=self.dtype)
    
    def finish_profile(self, profile_name: str):
        self.profiles[profile_name] = self.internal_arr
        self.internal_arr = None
        
    def process_tweet(self, tweet: Tweet):
        self.internal_arr[self.count] = self.extractor_func(tweet)
        self.count += 1
        
    def get_property_name(self):
        return self.property_name
    
    def get_np_array_by_profile(self, profile_name: str) -> NDArray:
        return self.profiles[profile_name]
    
    def get_all_np_arrays(self) -> dict[str, NDArray]:
        return self.profiles