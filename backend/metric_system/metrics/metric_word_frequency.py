from backend.metric_system.metric import OverTweetMetric, ComputableMetric, Metric
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.corpus import words
from backend.metric_system.helpers.key_map import NONE_PROFILE_NAME
import nltk
import logging


"""
This file contains the implementation of the `WordFrequencyMetric` class, which is a metric that calculates the frequency of words in tweets.
The `WordFrequencyMetric` class inherits from the `OverTweetMetric` class and implements the `tweet_update` and `final_update` methods.
The `WordFrequencyMetric` class uses the NLTK library to tokenize the tweets, filter out stop words, and calculate the frequency of each word.
"""


class WordFrequencyMetric(OverTweetMetric):
    """
    A metric that calculates the frequency of words in tweets.

    Args:
        return_count (int): The number of most frequent words to return.

    Attributes:
        return_count (int): The number of most frequent words to return.
        words (dict): A dictionary to store the frequency of each word.
        count (int): The total number of tweets processed.
        stop_words (set): A set of stop words to filter out from the tweets.
        english_words (set): A set of English words; the tweet words must be in this set.

    """

    def __init__(self, return_count=10):
        Metric.__init__(
            self, owner="_words", metric_name="tweet_word_frequency"
        )
        nltk.download("stopwords")
        nltk.download("punkt")
        nltk.download("words")

        self.return_count = return_count
        self.words = {}
        self.count = 0
        self.stop_words = set(stopwords.words("english"))
        self.english_words = set(words.words())

    def tweet_update(self, tweet):
        """
        Updates the word frequency count based on a new tweet.

        Args:
            tweet (Tweet): The tweet object.

        """
        self.count += 1
        words = word_tokenize(tweet.get_text())
        filtered_text = [word for word in words if word.lower() not in self.stop_words]

        filtered_english_words = [
            word for word in filtered_text if word in self.english_words
        ]

        for word in filtered_english_words:
            if word in self.words:
                self.words[word] += 1
            else:
                self.words[word] = 1

        logging.debug(
            f"original words: {words}, filtered words: {filtered_english_words})"
        )

    def final_update(self, stat_helper):
        """
        Performs the final update and sets the metric data.

        Args:
            stat_helper (StatHelper): The helper object for computing statistics.

        """
        values = [(key, val) for key, val in self.words.items()]
        values.sort(key=lambda x: x[1], reverse=True)

        self.set_data(values[: self.return_count])

        self.words = {}

        # memory clearing
        self.stop_words = None
        self.english_words = None
