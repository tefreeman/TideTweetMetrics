from backend.metric_system.metric import OverTweetMetric, ComputableMetric, Metric
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.corpus import words
import nltk


class WordFrequencyMetric(OverTweetMetric):
    def __init__(self, return_count=10):
        Metric.__init__(self, owner="none", metric_name="tweet_word_frequency")
        nltk.download('stopwords')
        nltk.download('punkt')
        nltk.download('words')
        
        self.return_count = return_count
        self.words = {}
        self.count = 0
        self.stop_words = set(stopwords.words('english'))
        self.english_words = set(words.words())
   
    
    def tweet_update(self, tweet):
        self.count += 1
        words = word_tokenize(tweet.get_text())
        filtered_text = [word for word in words if word.lower() not in self.stop_words]
        
        filtered_english_words = [word for word in filtered_text if word in self.english_words]
        for word in filtered_english_words:
            if word in self.words:
                self.words[word] += 1
            else:
                self.words[word] = 1
                
    def final_update(self, stat_helper):
        values = [(key, val) for key, val in self.words.items()]
        values.sort(key=lambda x: x[1], reverse=True)

        self.set_data(values[:self.return_count])
        
        self.words = {}
        self.stop_words = None
        self.english_words = None