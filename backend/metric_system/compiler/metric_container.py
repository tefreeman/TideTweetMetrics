from __future__ import annotations
from typing import Dict

class MetricContainer:
    def __init__(self):
        # Use 'Metric' as a string for type hint
        self._metrics: Dict[str, Dict[str, 'Metric']] = {}
        
    def add_metric(self, metric: 'Metric'):
        if metric.get_metric_name() not in self._metrics:
            self._metrics[metric.get_metric_name()] = {}
            
        self._metrics[metric.get_metric_name()][metric.get_owner()] = metric
    
    def get_metrics(self) -> Dict[str, Dict[str, 'Metric']]:
        return self._metrics
    
    def get_owned_metric(self, metric_name: str, owner: str) -> 'Metric':
        return self._metrics[metric_name][owner]
    
    def get_metric(self, metric_name: str) -> Dict[str, 'Metric']:
        return self._metrics[metric_name]
