from metrics.common.stat_gen import StatGenMetric
from metrics.metrics_compiler import StatMetricCompiler
from config import Config
import numpy as np

# must be called to init database connection
Config.init()

# The compiler is responsible for running the metrics on the data
m_compile = StatMetricCompiler()


m_compile.AddMetric(
    StatGenMetric("tweet_likes", lambda tweet: tweet.get_like_count(), np.int32)
)
m_compile.AddMetric(
    StatGenMetric("tweet_retweets", lambda tweet: tweet.get_retweet_count(), np.int32)
)
m_compile.AddMetric(
    StatGenMetric("tweet_replies", lambda tweet: tweet.get_reply_count(), np.int32)
)
m_compile.AddMetric(
    StatGenMetric("tweet_quotes", lambda tweet: tweet.get_quote_count(), np.int32)
)
m_compile.AddMetric(StatGenMetric("tweet_count", lambda tweet: 1, np.int32))
m_compile.AddMetric(
    StatGenMetric("tweet_chars", lambda tweet: len(tweet.get_text()), np.int32)
)
m_compile.AddMetric(
    StatGenMetric("tweet_words", lambda tweet: len(tweet.get_text().split()), np.int32)
)

m_compile.AddMetric(
    StatGenMetric(
        "tweet_annotations", lambda tweet: len(tweet.get_annotations()), np.int32
    )
)
m_compile.AddMetric(
    StatGenMetric("tweet_cashtags", lambda tweet: len(tweet.get_cashtags()), np.int32)
)
m_compile.AddMetric(
    StatGenMetric("tweet_hashtags", lambda tweet: len(tweet.get_hashtags()), np.int32)
)
m_compile.AddMetric(
    StatGenMetric("tweet_mentions", lambda tweet: len(tweet.get_mentions()), np.int32)
)
m_compile.AddMetric(
    StatGenMetric("tweet_urls", lambda tweet: len(tweet.get_urls()), np.int32)
)

m_compile.AddMetric(
    StatGenMetric("tweet_photos", lambda tweet: len(tweet.get_photos()), np.int32)
)
m_compile.AddMetric(
    StatGenMetric("tweet_videos", lambda tweet: len(tweet.get_videos()), np.int32)
)
m_compile.AddMetric(
    StatGenMetric("tweet_cards", lambda tweet: len(tweet.get_cards()), np.int32)
)

m_compile.AddMetric(
    StatGenMetric(
        "tweet_referenced_tweets",
        lambda tweet: len(tweet.get_referenced_tweet()),
        np.int32,
    )
)

test = m_compile.Process()
print(test)
