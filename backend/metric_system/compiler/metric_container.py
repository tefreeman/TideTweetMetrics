from __future__ import annotations
from typing import Dict
import logging

class MetricContainer:
    def __init__(self):
        # Use 'Metric' as a string for type hint
        self._metrics: Dict[str, Dict[str, 'Metric']] = {}
        
    def add_metric(self, metric: 'Metric'):
        if metric.get_metric_name() not in self._metrics:
            self._metrics[metric.get_metric_name()] = {}
            logging.debug(f"Added {metric.get_metric_name()} to list of metrics")
        else:
            logging.warning(f"Metric {metric.get_metric_name()} already added to list of metrics. Original is being replaced.")
            
        self._metrics[metric.get_metric_name()][metric.get_owner()] = metric
    
    def remove_error_metrics(self):
        keys_to_remove = []
        for metric_name, owner_metrics in self._metrics.items():
            for owner, metric in owner_metrics.items():
                if metric.is_error():
                    keys_to_remove.append((metric_name, owner))
        
        if len(keys_to_remove) > 0:
            logging.warning("There are error metrics. Set logger to the debug level to see which ones.")
        for key in keys_to_remove:
            logging.debug(f"Removing {key[0]} with owner {key[1]} from error metrics")
            del self._metrics[key[0]][key[1]]
            
    def get_metrics(self) -> Dict[str, Dict[str, 'Metric']]:
        return self._metrics
    
    def get_owned_metric(self, metric_name: str, owner: str) -> 'Metric':
        return self._metrics[metric_name][owner]
    
    def get_metric(self, metric_name: str) -> Dict[str, 'Metric']:
        return self._metrics[metric_name]
