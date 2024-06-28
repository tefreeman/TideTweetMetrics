from backend.metric_system.generators.gen_standard_profile_stat_over_time import (
    StandardProfileStatOverTimeGenerator,
)
from backend.metric_system.generators.gen_standard_profile_stat_over_time_weekly import StandardProfileStatOverWeekGeneratorWeekly
from backend.metric_system.generators.gen_likes_per_follower_normalized import GenLikesPerFollowerNormalized
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

from pathlib import Path

def build_metrics(output_file: str, debug_mode = False):
    """
    Build metrics for TideTweetMetrics.

    This function compiles various metrics using the StatMetricCompiler class and saves the result as a JSON file.

    Args:
        output_file (str): The path to the output file where the metric JSON will be saved.

    Returns:
        str: The metric JSON as a string.
    """
    smc = StatMetricCompiler(debug_mode)
    smc.add_metric(GenLikesPerFollower())
    smc.add_metric(StandardProfileStatGenerator())
    smc.add_metric(WordFrequencyMetric())
    smc.add_metric(StandardProfileStatOverTimeGenerator())
    smc.add_metric(PearsonCorrelationProfileStatGenerator())
    smc.add_metric(StandardProfileStatOverWeekGeneratorWeekly())
    smc.add_metric(GenLikesPerFollowerNormalized())

    smc.process()

    metric_json = smc.to_json()

        # Get the script directory and resolve the relative path
    script_dir = Path(__file__).parent.parent
    full_output_path = script_dir / "out" / output_file  # This combines the script directory with the relative output path

    if full_output_path:
        with open(full_output_path, "w") as f:
            f.write(metric_json)

    return metric_json

