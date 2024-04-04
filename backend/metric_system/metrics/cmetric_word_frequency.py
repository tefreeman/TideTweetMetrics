from backend.metric_system.metric import ComputableMetric
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.corpus import words
import nltk


class WordFrequencyMetric(ComputableMetric):
    def __init__(self, return_count=10):
        super().__init__(owner="none", metric_name="tweet_word_frequency", do_update_over_tweet=True)
        nltk.download('stopwords')
        nltk.download('punkt')
        nltk.download('words')
        
        self.return_count = return_count
        self.words = {}
        self.count = 0
        self.stop_words = set(stopwords.words('english'))
        self.english_words = set(words.words())
   
    
    def update_over_tweet(self, tweet):
        self.count += 1
        words = word_tokenize(tweet.get_text())
        filtered_text = [word for word in words if word.lower() not in self.stop_words]
        
        filtered_english_words = [word for word in filtered_text if word in self.english_words]
        for word in filtered_english_words:
            if word in self.words:
                self.words[word] += 1
            else:
                self.words[word] = 1
                
    def final_update(self, stat_helper, previous_metrics):
        values = [(key, val) for key, val in self.words.items()]
        values.sort(key=lambda x: x[1], reverse=True)
        self.metric_encoder.set_dataset(values[:self.return_count])
        
        self.words = {}
        self.stop_words = None
        self.english_words = None