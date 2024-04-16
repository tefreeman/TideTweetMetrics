from backend.metric_system.generators.gen_standard_profile_stat_over_time import (
    StandardProfileStatOverTimeGenerator,
)
from backend.metric_system.generators.gen_standard_profile_stat_over_time_weekly import StandardProfileStatOverWeekGeneratorWeekly
from backend.metric_system.metrics.metric_word_frequency import WordFrequencyMetric
from backend.metric_system.generators.gen_standard_profile_stat_gen import (
    StandardProfileStatGenerator,
)
from backend.metric_system.generators.gen_likes_per_follower import GenLikesPerFollower
from backend.metric_system.generators.gen_pearson_correlation_stat_generator import (
    PearsonCorrelationProfileStatGenerator,
)
from backend.metric_system.compiler.metrics_compiler import StatMetricCompiler
from backend.config import Config


def build_metrics(output_file: str):
    """
    Build metrics for TideTweetMetrics.

    This function compiles various metrics using the StatMetricCompiler class and saves the result as a JSON file.

    Args:
        output_file (str): The path to the output file where the metric JSON will be saved.

    Returns:
        str: The metric JSON as a string.
    """
    smc = StatMetricCompiler()
    smc.add_metric(GenLikesPerFollower())
    smc.add_metric(StandardProfileStatGenerator())
    smc.add_metric(WordFrequencyMetric())
    smc.add_metric(StandardProfileStatOverTimeGenerator())
    smc.add_metric(PearsonCorrelationProfileStatGenerator())
    smc.add_metric(StandardProfileStatOverWeekGeneratorWeekly())

    smc.process()

    metric_json = smc.to_json()
    if output_file:
        with open(output_file, "w") as f:
            f.write(metric_json)

    return metric_json

