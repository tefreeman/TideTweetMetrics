import unittest
from backend.encoders.tweet_encoder import Tweet
from backend.encoders.meta_encoder import MetaData
from backend.encoders.profile_encoder import Profile
from unittest import TestCase
from tests.backend.metric_system import test_metric_system_helper as helper
import json
from nltk.corpus import words
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import nltk


class TestMetricWordFrequency(TestCase):
    def setUp(self):
        with open("ex_testing_metric_out.json", "r") as file:
            self.data = json.load(file)

        # Get the text from all six Tweets from the helper class
        self.helper_obj = helper.TestMetricSystemHelper()
        self.tweet1Text = self.helper_obj.ReturnP1Tweet1().get_text()
        self.tweet2Text = self.helper_obj.ReturnP1Tweet2().get_text()
        self.tweet3Text = self.helper_obj.ReturnP1Tweet3().get_text()
        self.tweet4Text = self.helper_obj.ReturnP2Tweet1().get_text()
        self.tweet5Text = self.helper_obj.ReturnP2Tweet2().get_text()
        self.tweet6Text = self.helper_obj.ReturnP2Tweet3().get_text()
        # Combine these into one string, separating each text with a space
        self.allTweets = (
            self.tweet1Text
            + " "
            + self.tweet2Text
            + " "
            + self.tweet3Text
            + " "
            + self.tweet4Text
            + " "
            + self.tweet5Text
            + " "
            + self.tweet6Text
        )
        nltk.download("stopwords")
        nltk.download("punkt")
        nltk.download("words")

        self.words = {}
        self.count = 0
        self.stop_words = set(stopwords.words("english"))
        self.english_words = set(words.words())

    def test_dynamic(self):
        # Use nltk to tokenize and filter all the words in the allTweets string.
        # We are filtering out all stopwords and all non-English words.
        # We are also converting all words to lowercase.
        self.count += 1
        words = word_tokenize(self.allTweets)
        filtered_text = [word for word in words if word.lower() not in self.stop_words]

        filtered_english_words = [
            word for word in filtered_text if word in self.english_words
        ]

        for word in filtered_english_words:
            if word in self.words:
                self.words[word] += 1
            else:
                self.words[word] = 1

        values = [(key, val) for key, val in self.words.items()]
        values.sort(key=lambda x: x[1], reverse=True)

        self.words = {}

        # memory clearing
        self.stop_words = None
        self.english_words = None

        values_str = str(values[:10]).replace("(", "[").replace(")", "]")

        # print(values_str)
        # print(str(self.data["tweet_word_frequency"]["_none"]))
        self.assertEqual(str(self.data["tweet_word_frequency"]["_none"]), values_str)

    def test_hardcoded(self):
        # Hardcoded input
        words = [
            ["profile", 6],
            ["text", 6],
            ["cool", 3],
            ["Elon", 3],
            ["epic", 3],
            ["random", 3],
            ["create", 3],
            ["variation", 3],
            ["writing", 2],
            ["even", 2],
        ]

        self.assertEqual(self.data["tweet_word_frequency"]["_none"], words)


# Main
if __name__ == "__main__":
    unittest.main()
