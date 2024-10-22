from __future__ import annotations
from typing import Dict, TYPE_CHECKING
import logging

if TYPE_CHECKING:
    from backend.metric_system.metric import Metric


class MetricContainer:
    """
    This class is used to store metrics that have been processed.
    Other Metrics can get access to this class to retrieve other metrics.
    See metric.py for more information.
    """

    def __init__(self):
        self._metrics: Dict[str, Dict[str, Metric]] = {}

    def add_metric(self, metric: Metric):
        """
        Adds a metric to the container. Informs user if the metric has already been added.

        Args:
            metric (Metric): The metric to be added.
        """
        metric_name = metric.get_metric_name()
        if metric_name not in self._metrics:
            self._metrics[metric_name] = {}
            logging.debug(f"Added {metric_name} to list of metrics")
        else:
            logging.debug(f"Metric {metric_name} already added to list of metrics")
        self._metrics[metric_name][metric.get_owner()] = metric

    def remove_error_metrics(self):
        """
        Removes error metrics from the container.
        """
        for metric_name, owner_metrics in list(self._metrics.items()):
            for owner, metric in list(owner_metrics.items()):
                if metric.is_error():
                    logging.debug(
                        f"Removing {metric_name} with owner {owner} from error metrics"
                    )
                    del self._metrics[metric_name][owner]
                    if not self._metrics[
                        metric_name
                    ]:  # if no more owners, remove the metric
                        del self._metrics[metric_name]

    def get_metrics(self) -> Dict[str, Dict[str, Metric]]:
        """
        Returns all the metrics in the container.

        Returns:
            Dict[str, Dict[str, Metric]]: A dictionary containing all the metrics.
        """
        return self._metrics

    def get_owned_metric(self, metric_name: str, owner: str) -> Metric:
        """
        Returns the metric owned by the specified owner.

        Args:
            metric_name (str): The name of the metric.
            owner (str): The owner of the metric.

        Returns:
            Metric: The metric owned by the specified owner.
        """
        return self._metrics[metric_name][owner]

    def get_metric(self, metric_name: str) -> Dict[str, Metric]:
        """
        Returns the metric with the specified name.

        Args:
            metric_name (str): The name of the metric.

        Returns:
            Dict[str, Metric]: A dictionary containing the metric.
        """
        return self._metrics[metric_name]
