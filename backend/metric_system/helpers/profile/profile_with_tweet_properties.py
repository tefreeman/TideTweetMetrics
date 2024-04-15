from backend.encoders.profile_encoder import Profile
from backend.encoders.tweet_encoder import Tweet
import numpy as np
from datetime import datetime
import logging

"""
This module contains the implementation of the ProfileWithTweetProperties class,
which is a subclass of the Profile class. It provides additional functionality
for extracting and storing tweet properties from a list of tweets.
"""


# This is the tweet properties that is extracted from the tweet database
# and stored in Np arrays
def _default_property_extractor():
    """
    Default property extractor function that defines the properties to be extracted
    from a tweet and stored in Numpy arrays.

    Returns:
        A tuple of property names and corresponding extractor functions.
    """
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
        ("post_date_hour", lambda tweet: tweet.get_post_date().hour),
        ("post_date_day", lambda tweet: tweet.get_post_date().weekday()),
    )


class ProfileWithTweetProperties(Profile):
    """
    A subclass of the Profile class that provides additional functionality for
    extracting and storing tweet properties from a list of tweets.
    """

    _properties_to_extract = _default_property_extractor()
    _properties_to_list = [prop[0] for prop in _properties_to_extract]
    _property_to_index = {prop[0]: i for i, prop in enumerate(_properties_to_extract)}

    def __init__(self, as_json: dict = None) -> None:
        """
        Initializes a new instance of the ProfileWithTweetProperties class.

        Args:
            as_json: A dictionary containing the profile data in JSON format.
        """
        super().__init__(as_json=as_json)
        self._tweet_data_matrix = None
        self._tweet_hour_epoch_times = None
        self._count = 0
        self._is_sorted = True

    def _initialize_np_array(self, tweet_count):
        """
        Initializes the Numpy arrays for storing tweet properties.

        Args:
            tweet_count: The number of tweets to be stored.
        """
        self._tweet_data_matrix = np.zeros(
            (len(ProfileWithTweetProperties._properties_to_extract), tweet_count),
            dtype=np.int16,
        )
        self._tweet_hour_epoch_times = np.zeros(tweet_count, dtype=np.int32)

    def _expand_np_array(self, new_tweet_count):
        """
        Expands the Numpy arrays to accommodate additional tweets.

        Args:
            new_tweet_count: The number of new tweets to be added.
        """
        current_capacity = self._tweet_data_matrix.shape[1]
        required_capacity = self._count + new_tweet_count

        if required_capacity > current_capacity:
            logging.debug(
                f"required_capacity ({required_capacity}) > current_capacity ({current_capacity})"
            )
            self._tweet_hour_epoch_times = np.hstack(
                (
                    self._tweet_hour_epoch_times,
                    np.zeros(new_tweet_count, dtype=np.int32),
                )
            )
            additional_columns_needed = required_capacity - current_capacity
            additional_columns = np.zeros(
                (
                    len(ProfileWithTweetProperties._properties_to_extract),
                    additional_columns_needed,
                ),
                dtype=np.int16,
            )
            self._tweet_data_matrix = np.hstack(
                (self._tweet_data_matrix, additional_columns)
            )

    def build_stats(self, tweets: list[Tweet], is_sorted):
        """
        Builds the tweet statistics by extracting and storing the tweet properties.

        Args:
            tweets: A list of Tweet objects.
            is_sorted: A boolean indicating whether the tweets are sorted by post date.
        """
        if not is_sorted:
            self._is_sorted = False

        if self._tweet_data_matrix is None:
            self._initialize_np_array(len(tweets))
        else:
            self._expand_np_array(len(tweets))

        for tweet_cnt, tweet in enumerate(tweets):
            tweet_index = tweet_cnt + self._count
            for prop_i, item in enumerate(
                ProfileWithTweetProperties._properties_to_extract
            ):
                extractor_function = item[1]
                logging.debug(
                    f"_tweet_data_matrix[{prop_i}][{tweet_index}] is being set"
                )
                self._tweet_data_matrix[prop_i][tweet_index] = extractor_function(tweet)
                logging.debug(
                    f"epoch_time = {int(tweet.get_post_date().timestamp() / 60)}"
                )
                self._tweet_hour_epoch_times[tweet_index] = int(
                    tweet.get_post_date().timestamp() / 60
                )

        self._count += len(tweets)

    def get_index_between_dates(
        self, start_date: datetime, end_date: datetime
    ) -> tuple[int, int]:
        """
        Gets the start and end indices of tweets between the specified dates.

        Args:
            start_date: The start date.
            end_date: The end date.

        Returns:
            A tuple containing the start and end indices.
        """
        if not self._is_sorted:
            self._tweet_hour_epoch_times.sort()
            self._is_sorted = True

        start_epoch = int(start_date.timestamp() / 60)
        logging.debug(f"start epoch = {start_epoch}")
        end_epoch = int(end_date.timestamp() / 60)
        logging.debug(f"end epoch = {end_epoch}")

        start_index = np.searchsorted(self._tweet_hour_epoch_times, start_epoch)
        logging.debug(f"start index = {start_index}")
        end_index = np.searchsorted(self._tweet_hour_epoch_times, end_epoch)
        logging.debug(f"end index = {end_index}")

        return start_index, end_index

    @staticmethod
    def get_properties_list():
        """

        Gets the list of tweet properties.

        Returns:
            A list of tweet property names.
        """
        return ProfileWithTweetProperties._properties_to_list

    def merge_public_metrics(self, other_profile):
        """
        Merges the public metrics of the current profile with another profile.

        Args:
            other_profile: Another ProfileWithTweetProperties object.
        """
        self.set_public_metrics(
            followers_count=self.get_followers_count()
            + other_profile.get_followers_count(),
            following_count=self.get_following_count()
            + other_profile.get_following_count(),
            tweet_count=self.get_tweet_count() + other_profile.get_tweet_count(),
            like_count=self.get_like_count() + other_profile.get_like_count(),
        )

    def get_tweet_property(self, property_name: str):
        """
        Gets the Numpy array for the specified tweet property.

        Args:
            property_name: The name of the tweet property.

        Returns:
            The Numpy array containing the values of the tweet property.
        """
        return self._tweet_data_matrix[
            ProfileWithTweetProperties._property_to_index[property_name]
        ]

    def get_tweet_likes_np_array(self):
        """
        Gets the Numpy array for the tweet likes.

        Returns:
            The Numpy array containing the tweet likes.
        """
        return self._tweet_data_matrix[0]

    def get_tweet_retweets_np_array(self):
        """

        Gets the Numpy array for the tweet retweets.

        Returns:
            The Numpy array containing the tweet retweets.
        """
        return self._tweet_data_matrix[1]

    def get_tweet_replies_np_array(self):
        """
        Gets the Numpy array for the tweet replies.

        Returns:
            The Numpy array containing the tweet replies.
        """
        return self._tweet_data_matrix[2]

    def get_tweet_quotes_np_array(self):
        """
        Gets the Numpy array for the tweet quotes.

        Returns:
            The Numpy array containing the tweet quotes.
        """
        return self._tweet_data_matrix[3]

    def get_tweet_count_np_array(self):
        """
        Gets the Numpy array for the tweet count.

        Returns:
            The Numpy array containing the tweet count.
        """
        return self._tweet_data_matrix[4]

    def get_tweet_chars_np_array(self):
        """
        Gets the Numpy array for the tweet characters.

        Returns:
            The Numpy array containing the tweet characters.
        """
        return self._tweet_data_matrix[5]

    def get_tweet_words_np_array(self):
        """
        Gets the Numpy array for the tweet words.

        Returns:
            The Numpy array containing the tweet words.
        """
        return self._tweet_data_matrix[6]

    def get_tweet_annotations_np_array(self):
        """
        Gets the Numpy array for the tweet annotations.

        Returns:
            The Numpy array containing the tweet annotations.
        """
        return self._tweet_data_matrix[7]

    def get_tweet_cashtags_np_array(self):
        """
        Gets the Numpy array for the tweet cashtags.

        Returns:
            The Numpy array containing the tweet cashtags.
        """
        return self._tweet_data_matrix[8]

    def get_tweet_hashtags_np_array(self):
        """
        Gets the Numpy array for the tweet hashtags.

        Returns:
            The Numpy array containing the tweet hashtags.
        """
        return self._tweet_data_matrix[9]

    def get_tweet_mentions_np_array(self):
        """
        Gets the Numpy array for the tweet mentions.

        Returns:
            The Numpy array containing the tweet mentions.
        """
        return self._tweet_data_matrix[10]

    def get_tweet_urls_np_array(self):
        """
        Gets the Numpy array for the tweet URLs.

        Returns:
            The Numpy array containing the tweet URLs.
        """
        return self._tweet_data_matrix[11]

    def get_tweet_photos_np_array(self):
        """
        Gets the Numpy array for the tweet photos.

        Returns:
            The Numpy array containing the tweet photos.
        """
        return self._tweet_data_matrix[12]

    def get_tweet_videos_np_array(self):
        """
        Gets the Numpy array for the tweet videos.

        Returns:
            The Numpy array containing the tweet videos.
        """
        return self._tweet_data_matrix[13]

    def get_tweet_cards_np_array(self):
        """
        Gets the Numpy array for the tweet cards.

        Returns:
            The Numpy array containing the tweet cards.
        """
        return self._tweet_data_matrix[14]

    def get_tweet_referenced_tweets_np_array(self):
        """
        Gets the Numpy array for the referenced tweets.

        Returns:
            The Numpy array containing the referenced tweets.
        """
        return self._tweet_data_matrix[15]

    def get_tweet_post_date_hour_np_array(self):
        """
        Gets the Numpy array for the tweet post date hour.

        Returns:
            The Numpy array containing the tweet post date hour.
        """
        return self._tweet_data_matrix[16]

    def get_tweet_post_date_day_np_array(self):
        """
        Gets the Numpy array for the tweet post date day.

        Returns:
            The Numpy array containing the tweet post date day.
        """
        return self._tweet_data_matrix[17]

    def get_tweet_data_matrix(self):
        """
        Gets the Numpy array containing the tweet data.

        Returns:
            The Numpy array containing the tweet data.
        """
        return self._tweet_data_matrix
