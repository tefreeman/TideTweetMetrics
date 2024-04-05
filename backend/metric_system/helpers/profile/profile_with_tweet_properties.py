from backend.encoders.profile_encoder import Profile
from backend.encoders.tweet_encoder import Tweet
import numpy as np


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
       )
       
class ProfileWithTweetProperties(Profile):
    _properties_to_extract = _default_property_extractor()
    _properties_to_list = [prop[0] for prop in _properties_to_extract]
    _property_to_index = {prop[0]: i for i, prop in enumerate(_properties_to_extract)}
    
    def __init__(self, as_json: dict = None) -> None:
        super().__init__(as_json=as_json)
        self._tweet_data_matrix = None
    
    
    def _initialize_properties(self, tweet_count):  
        self._tweet_data_matrix = np.zeros((len(ProfileWithTweetProperties._properties_to_extract), tweet_count), dtype=np.int16)
    
    
    def build_stats(self, tweets: list[Tweet]):
        self._initialize_properties(len(tweets))
        for tweet_cnt, tweet in enumerate(tweets):
            for prop_i, val in enumerate(ProfileWithTweetProperties._properties_to_extract):
                self._tweet_data_matrix[prop_i][tweet_cnt] = val[1](tweet)

    @staticmethod
    def get_properties_list():
        return ProfileWithTweetProperties._properties_to_list
    
    def get_tweet_property(self, property_name: str):
        return self._tweet_data_matrix[ProfileWithTweetProperties._property_to_index[property_name]]
    
    def get_tweet_likes_np_array(self):
        return self._tweet_data_matrix[:, 0]
    
    def get_tweet_retweets_np_array(self):
        return self._tweet_data_matrix[:, 1]

    def get_tweet_replies_np_array(self):
        return self._tweet_data_matrix[:, 2]
    
    def get_tweet_quotes_np_array(self):
        return self._tweet_data_matrix[:, 3]
    
    def get_tweet_count_np_array(self):
        return self._tweet_data_matrix[:, 4]
    
    def get_tweet_chars_np_array(self):
        return self._tweet_data_matrix[:, 5]
    
    def get_tweet_words_np_array(self):
        return self._tweet_data_matrix[:, 6]
    
    def get_tweet_annotations_np_array(self):
        return self._tweet_data_matrix[:, 7]
    
    def get_tweet_cashtags_np_array(self):
        return self._tweet_data_matrix[:, 8]
    
    def get_tweet_hashtags_np_array(self):
        return self._tweet_data_matrix[:, 9]
    
    def get_tweet_mentions_np_array(self):
        return self._tweet_data_matrix[:, 10]
    
    def get_tweet_urls_np_array(self):
        return self._tweet_data_matrix[:, 11]
    
    def get_tweet_photos_np_array(self):
        return self._tweet_data_matrix[:, 12]
    
    def get_tweet_videos_np_array(self):
        return self._tweet_data_matrix[:, 13]
    
    def get_tweet_cards_np_array(self):
        return self._tweet_data_matrix[:, 14]
    
    def get_tweet_referenced_tweets_np_array(self):
        return self._tweet_data_matrix[:, 15]
    
    def get_tweet_data_matrix(self):
        return self._tweet_data_matrix
