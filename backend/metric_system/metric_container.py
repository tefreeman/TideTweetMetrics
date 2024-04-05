from metric_system.metric import Metric

class MetricContainer:
    def __init__(self):
        self._metrics: dict[str, dict[str, Metric]] = {}
        
    def add_metric(self, metric: Metric):
        if metric.get_metric_name() not in self._metrics:
            self._metrics[metric.get_metric_name()] = {}
            
        self._metrics[metric.get_metric_name()][metric.get_owner()] = metric
    
    def get_metrics(self) -> dict[str, dict[str, Metric]]:
        return self._metrics
    
    def get_owned_metric(self, metric_name: str, owner: str) -> Metric:
        return self._metrics[metric_name][owner]
    
    def get_metric(self, metric_name: str) -> dict[str, Metric]:
        return self._metrics[metric_name]
    