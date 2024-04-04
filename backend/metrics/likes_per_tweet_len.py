from backend.metrics.metrics import ComputableMetric


class WordFrequencyMetric(ComputableMetric):
    def __init__(self):
        super().__init__(owner="none", metric_name="tweet_word_frequency", do_update_over_tweet=True)
        self.words = {}
        self.count = 0

    def update_over_tweet(self, tweet):
        self.count += 1
        for word in tweet.get_text().split():
            word = word.strip().lower()
            if word not in self.words and len(word) > 0:
                self.words[word] = 1
            else:
                self.words[word] += 1

    def final_update(self, stat_helper, previous_metrics):
        self.metric_encoder.set_dataset(self.words)