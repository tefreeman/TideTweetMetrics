import numpy as np
from numpy.typing import NDArray
from backend.encoders.tweet_encoder import Tweet
from typing import Callable, Any

class TweetPropertyArray:
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
        
    def process_tweet(self, tweet: Tweet):
        self.internal_arr[self.count] = self.extractor_func(tweet)
        self.count += 1
        
    def get_property_name(self):
        return self.property_name
    
    def get_arr(self) -> NDArray:
        return self.internal_arr
    