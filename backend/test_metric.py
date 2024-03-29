from metrics.common.average_likes_metric import *
from metrics.metrics_compiler import StatMetricCompiler
from config import Config

# must be called to init database connection
Config.init()

# The compiler is responsible for running the metrics on the data
m_compile = StatMetricCompiler()

# add your metric like this
m_compile.AddMetric(AverageLikesMetric())


test = m_compile.Process()
print(test)
