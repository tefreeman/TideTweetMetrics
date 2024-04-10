from backend.metric_system.generators.gen_standard_profile_stat_over_time import StandardProfileStatOverTimeGenerator
from backend.metric_system.metrics.metric_word_frequency import WordFrequencyMetric
from backend.metric_system.generators.gen_standard_profile_stat_gen import StandardProfileStatGenerator
from backend.metric_system.generators.gen_likes_per_follower import GenLikesPerFollower
from backend.metric_system.generators.gen_pearson_correlation_stat_generator import PearsonCorrelationProfileStatGenerator
from backend.metric_system.compiler.metrics_compiler import StatMetricCompiler
from backend.config import Config



def build_metrics(output_file: str):
    smc = StatMetricCompiler()
    smc.add_metric(GenLikesPerFollower())
    smc.add_metric(StandardProfileStatGenerator())
    smc.add_metric(WordFrequencyMetric())
    smc.add_metric(StandardProfileStatOverTimeGenerator())
    smc.add_metric(PearsonCorrelationProfileStatGenerator())
    
    
    smc.process()


    metric_json = smc.to_json()
    if output_file:
        with open(output_file, "w") as f:
            f.write(metric_json)
    
    # see ex_metric_output.json for an example of the output
    return metric_json


