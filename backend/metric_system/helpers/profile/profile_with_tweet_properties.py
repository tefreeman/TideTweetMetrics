from backend.encoders.profile_encoder import Profile
from backend.encoders.tweet_encoder import Tweet
import numpy as np
from datetime import datetime
import logging


def _default_property_extractor():
       return (
            ("tweet_likes", lambda tweet: tweet.get_like_count()),
            ("tweet_retweets", lambda tweet: tweet.get_retweet_count()),
            ("tweet_replies", lambda tweet: tweet.get_reply_count()),
            ("tweet_quotes", lambda tweet: tweet.get_quote_count()),
            ("tweet_count", lambda tweet: 1),
            ("tweet_chars", lambda tweet: len(tweet.get_text())),
            ("tweet_words", lambda tweet: len(tweet.get_text().split())),
            ("tweet_annotations", lambda tweet: len(tweet.get_annotations())),
            ("tweet_cashtags", lambda tweet: len(tweet.get_cashtags())),
            ("tweet_hashtags", lambda tweet: len(tweet.get_hashtags())),
            ("tweet_mentions", lambda tweet: len(tweet.get_mentions())),
            ("tweet_urls", lambda tweet: len(tweet.get_urls())),
            ("tweet_photos", lambda tweet: len(tweet.get_photos())),
            ("tweet_videos", lambda tweet: len(tweet.get_videos())),
            ("tweet_cards", lambda tweet: len(tweet.get_cards())),
            (
                "tweet_referenced_tweets",
                lambda tweet: len(tweet.get_referenced_tweet()),
                np.int32,
            ),
            ('post_date_hour', lambda tweet: tweet.get_post_date().hour),
            ('post_date_day', lambda tweet: tweet.get_post_date().weekday())
       )
       
class ProfileWithTweetProperties(Profile):
    _properties_to_extract = _default_property_extractor()
    _properties_to_list = [prop[0] for prop in _properties_to_extract]
    _property_to_index = {prop[0]: i for i, prop in enumerate(_properties_to_extract)}
    
    def __init__(self, as_json: dict = None) -> None:
        super().__init__(as_json=as_json)
        self._tweet_data_matrix = None
        self._tweet_hour_epoch_times = None
        self._count = 0
        self._is_sorted = True
    
    def _initialize_np_array(self, tweet_count):  
        self._tweet_data_matrix = np.zeros((len(ProfileWithTweetProperties._properties_to_extract), tweet_count), dtype=np.int16)
        self._tweet_hour_epoch_times = np.zeros(tweet_count, dtype=np.int32)
    
    def _expand_np_array(self, new_tweet_count):
        current_capacity = self._tweet_data_matrix.shape[1]
        required_capacity = self._count + new_tweet_count
        
        if required_capacity > current_capacity:
            logging.debug(f"required_capacity ({required_capacity}) > current_capacity ({current_capacity})")
            self._tweet_hour_epoch_times = np.hstack((self._tweet_hour_epoch_times, np.zeros(new_tweet_count, dtype=np.int32)))
            additional_columns_needed = required_capacity - current_capacity
            additional_columns = np.zeros((len(ProfileWithTweetProperties._properties_to_extract), additional_columns_needed), dtype=np.int16)
            self._tweet_data_matrix = np.hstack((self._tweet_data_matrix, additional_columns))
        
    def build_stats(self, tweets: list[Tweet], is_sorted):
        if not is_sorted:
            self._is_sorted = False
            
        if self._tweet_data_matrix is None:
            self._initialize_np_array(len(tweets))
        else:
            self._expand_np_array(len(tweets))
            
        for tweet_cnt, tweet in enumerate(tweets):
            tweet_index = tweet_cnt + self._count
            for prop_i, item in enumerate(ProfileWithTweetProperties._properties_to_extract):
                extractor_function = item[1]
                logging.debug(f"_tweet_data_matrix[{prop_i}][{tweet_index}] is being set")
                self._tweet_data_matrix[prop_i][tweet_index] = extractor_function(tweet)
                logging.debug(f"epoch_time = {int(tweet.get_post_date().timestamp() / 60)}")
                self._tweet_hour_epoch_times[tweet_index] = int(tweet.get_post_date().timestamp() / 60)
        
        self._count += len(tweets)

    def get_tweets_between_dates(self, start_date: datetime, end_date: datetime):
        if not self._is_sorted:
            np.sort(self._tweet_hour_epoch_times)
            self._is_sorted = True
            
        start_epoch = int(start_date.timestamp() / 60)
        logging.debug(f"start epoch = {start_epoch}")
        end_epoch = int(end_date.timestamp() / 60)
        logging.debug(f"end epoch = {end_epoch}")
        
        start_index = np.searchsorted(self._tweet_hour_epoch_times, start_epoch)
        logging.debug(f"start index = {start_index}")
        end_index = np.searchsorted(self._tweet_hour_epoch_times, end_epoch)
        logging.debug(f"end index = {end_index}")
        
        return self._tweet_data_matrix[:, start_index:end_index]
    
    @staticmethod
    def get_properties_list():
        return ProfileWithTweetProperties._properties_to_list

    def merge_public_metrics(self, other_profile):
        self.set_public_metrics(
            followers_count=self.get_followers_count() + other_profile.get_followers_count(),
            following_count=self.get_following_count() + other_profile.get_following_count(),
            tweet_count=self.get_tweet_count() + other_profile.get_tweet_count(),
            like_count=self.get_like_count() + other_profile.get_like_count(),
        )
    def get_tweet_property(self, property_name: str):
        return self._tweet_data_matrix[ProfileWithTweetProperties._property_to_index[property_name]]
    
    def get_tweet_likes_np_array(self):
        return self._tweet_data_matrix[0]
    
    def get_tweet_retweets_np_array(self):
        return self._tweet_data_matrix[1]

    def get_tweet_replies_np_array(self):
        return self._tweet_data_matrix[2]
    
    def get_tweet_quotes_np_array(self):
        return self._tweet_data_matrix[3]
    
    def get_tweet_count_np_array(self):
        return self._tweet_data_matrix[4]
    
    def get_tweet_chars_np_array(self):
        return self._tweet_data_matrix[5]
    
    def get_tweet_words_np_array(self):
        return self._tweet_data_matrix[6]
    
    def get_tweet_annotations_np_array(self):
        return self._tweet_data_matrix[7]
    
    def get_tweet_cashtags_np_array(self):
        return self._tweet_data_matrix[8]
    
    def get_tweet_hashtags_np_array(self):
        return self._tweet_data_matrix[9]
    
    def get_tweet_mentions_np_array(self):
        return self._tweet_data_matrix[10]
    
    def get_tweet_urls_np_array(self):
        return self._tweet_data_matrix[11]
    
    def get_tweet_photos_np_array(self):
        return self._tweet_data_matrix[12]
    
    def get_tweet_videos_np_array(self):
        return self._tweet_data_matrix[13]
    
    def get_tweet_cards_np_array(self):
        return self._tweet_data_matrix[14]
    
    def get_tweet_referenced_tweets_np_array(self):
        return self._tweet_data_matrix[15]
    
    def get_tweet_post_date_hour_np_array(self):
        return self._tweet_data_matrix[16]
    
    def get_tweet_post_date_day_np_array(self):
        return self._tweet_data_matrix[17]
    
    def get_tweet_data_matrix(self):
        return self._tweet_data_matrix
