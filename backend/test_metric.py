from metrics.common.total import TotalMetric
from metrics.common.average_likes_metric import AverageLikesMetric
from metrics.metrics_compiler import StatMetricCompiler
from config import Config

# must be called to init database connection
Config.init()

# The compiler is responsible for running the metrics on the data
m_compile = StatMetricCompiler()

# add your metric like this
m_compile.AddMetric(AverageLikesMetric())

# progrmatic way to add total on different properties
m_compile.AddMetric(TotalMetric("Likes", "get_like_count"))
m_compile.AddMetric(TotalMetric("Retweets", "get_retweet_count"))
m_compile.AddMetric(TotalMetric("Replies", "get_reply_count"))
m_compile.AddMetric(TotalMetric("Quotes", "get_quote_count"))

test = m_compile.Process()
print(test)
