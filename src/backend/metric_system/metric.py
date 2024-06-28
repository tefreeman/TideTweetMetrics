"""
This module contains the definition of various metric classes used in the TideTweetMetrics backend system.

Classes:
- Metric: Base class for metrics.
- ComputableMetric: Base class for metrics that can be computed.
- OverTweetMetric: Metric class that can be computed from tweet data.
- DependentMetric: Class representing a metric that depends on other metrics.
- MetricGenerator: Base class for generating and validating metrics.
"""

from backend.encoders.tweet_encoder import Tweet
from backend.encoders.profile_encoder import Profile
from backend.encoders.metric_encoder import MetricEncoder
from backend.metric_system.helpers.profile.tweet_analytics_helper import TweetAnalyticsHelper
from backend.metric_system.compiler.metric_container import MetricContainer
from abc import ABC, abstractmethod

# All needed logging for this file is covered by raised exceptions

class Metric(ABC):
    """
    Base class for metrics.
    
    :param owner: The owner of the metric.
    :type owner: str
    :param metric_name: The name of the metric.
    :type metric_name: str
    """
    def __init__(self, owner: str, metric_name: str):
        self.metric_encoder: MetricEncoder = MetricEncoder()
        self._metric_name = metric_name
        self._owner = owner
        self._error = False
        
    def get_metric_name(self) -> str:
        """
        Returns the name of the metric.

        :return: The name of the metric.
        :rtype: str
        """
        return self._metric_name
    
    def get_owner(self) -> str:
        """
        Returns the owner of the metric.

        :return: The owner of the metric.
        :rtype: str
        """
        return self._owner

    def get_data(self):
        """
        Returns the data associated with the metric.

        Returns:
        - Any: The data associated with the metric.
        """
        return self.metric_encoder.get_dataset()
    
    def set_data(self, data):
        """
        Sets the data associated with the metric.

        Parameters:
        - data (Any): The data to be set.

        Returns:
        - None
        """
        return self.metric_encoder.set_dataset(data)

    def is_error(self) -> bool:
        """
        Checks if the metric has encountered an error.

        Returns:
        - bool: True if the metric has encountered an error, False otherwise.
        """
        return self._error
    
    def flag_as_error(self):
        """
        Flags the metric as having encountered an error.

        Returns:
        - None
        """
        self._error = True
    

class ComputableMetric(Metric, ABC):
    """
    Abstract base class for metrics that require computation.
    
    This class extends :class:`Metric` and adds an abstract method `final_update`
    which subclasses must implement to perform their final computation step.
    """
    
    @abstractmethod
    def final_update(self, stat_helper: TweetAnalyticsHelper):
        """
        Perform the final update on the metric using the provided TweetAnalyticsHelper.

        This method should be implemented by subclasses to finalize the computation
        of the metric based on accumulated data and the provided analytics helper.

        :param stat_helper: An instance of TweetAnalyticsHelper to assist in the final computation of the metric.
        :type stat_helper: TweetAnalyticsHelper
        :raises Exception: Raises an exception indicating the method has not been implemented.
        """
        raise Exception("Method not implemented")


class OverTweetMetric(ComputableMetric):
    """
    Abstract base class for metrics that are computed over individual tweets.
    
    Subclasses of this class should implement the `tweet_update` method
    to update the metric based on an individual tweet's data.
    """
    
    @abstractmethod
    def tweet_update(self, tweet: Tweet):
        """
        Update the metric based on data from an individual tweet.

        This method should be implemented by subclasses to update the metric's
        computation based on the content or metadata of a given tweet.

        :param tweet: An instance of a Tweet to be used for updating the metric.
        :type tweet: Tweet
        :raises Exception: Raises an exception indicating the method has not been implemented.
        """
        raise Exception("Method not implemented")

    
class DependentMetric:
    """
    Manages metrics that depend on other metrics for their computation.

    This class keeps track of dependencies among metrics and interfaces with a container
    of pre-computed metrics to fetch specific metrics based on those dependencies.

    :ivar _dependencies: A set containing the names of metrics this metric depends on.
    :vartype _dependencies: set[str]
    :ivar _pre_computed_metrics: Container holding pre-computed metrics. Initially None.
    :vartype _pre_computed_metrics: MetricContainer or None
    """

    def __init__(self) -> None:
        """
        Initializes the DependentMetric with an empty set of dependencies and no metric container.
        """
        self._dependencies: set[str] = set()
        self._pre_computed_metrics: MetricContainer = None

    def set_metric_container(self, metric_container: MetricContainer):
        """
        Sets the metric container that holds pre-computed metrics.

        :param metric_container: The container of pre-computed metrics.
        :type metric_container: MetricContainer
        """
        self._pre_computed_metrics = metric_container

    def add_dependency(self, metric_name: str):
        """
        Adds a single metric to the set of dependencies.

        :param metric_name: The name of the metric to add.
        :type metric_name: str
        """
        self._dependencies.add(metric_name)

    def add_dependencies(self, metric_names: set[str]):
        """
        Adds multiple metrics to the set of dependencies.

        :param metric_names: A set of names of metrics to add.
        :type metric_names: set[str]
        """
        self._dependencies.update(metric_names)

    def is_a_dependency(self, metric_name: str) -> bool:
        """
        Checks if a given metric name is among the dependencies.

        :param metric_name: The name of the metric to check.
        :type metric_name: str
        :return: True if the metric is a dependency, False otherwise.
        :rtype: bool
        """
        return metric_name in self._dependencies

    def get_dependencies(self) -> set[str]:
        """
        Returns the set of all dependencies.

        :return: The set of metric names that are dependencies.
        :rtype: set[str]
        """
        return self._dependencies

    def get_metric(self, metric_name: str) -> dict[str, Metric]:
        """
        Retrieves a specific metric from the pre-computed metric container, given its name.

        :param metric_name: The name of the metric to retrieve.
        :type metric_name: str
        :return: The requested metric.
        :rtype: dict[str, Metric]
        :raises ValueError: If the requested metric is not a dependency.
        """
        if metric_name not in self._dependencies:
            raise ValueError(f"Metric '{metric_name}' is not a dependency.")

        return self._pre_computed_metrics.get_metric(metric_name)

    
    
# For creating many metrics at once
class MetricGenerator(ABC):
    """
    Base class for generating and validating metrics based on provided statistics helper.

    :param expected_metric_names: A list of names for the metrics that are expected to be generated.
    :type expected_metric_names: list[str]
    """
    def __init__(self, expected_metric_names: list[str]) -> None:
        self._expected_metric_names = set(expected_metric_names)
        
    def get_expected_metric_names(self) -> set[str]:
        """
        Do not override. Returns the set of expected metric names that were provided during initialization.

        :return: A set containing the names of metrics that are expected to be generated.
        :rtype: set[str]
        """
        return self._expected_metric_names
    
    def generate_and_validate(self, stat_helper: TweetAnalyticsHelper) -> list[Metric]:
        """
        Do not override. Generates metrics using the provided statistics helper and validates the generated metrics against the expected metric names. Raises a ValueError if there is a discrepancy.

        :param stat_helper: An instance of TweetAnalyticsHelper used to assist in the generation of metrics.
        :type stat_helper: TweetAnalyticsHelper
        :return: A list of generated Metric objects that match the expected metric names.
        :rtype: list[Metric]
        :raises ValueError: If there is a discrepancy between the generated metric names and the expected metric names, indicating either missing or unexpected metrics.
        """
        metrics: list[Metric] = self.generate_metrics(stat_helper)
        generated_metric_names = set([metric.get_metric_name() for metric in metrics])
        
        if generated_metric_names != self._expected_metric_names:
            missing = self._expected_metric_names - generated_metric_names
            unexpected = generated_metric_names - self._expected_metric_names
            raise ValueError(f"Discrepancy in generated metrics. Missing: {missing}, Unexpected: {unexpected}")
                
        return metrics
    
    @abstractmethod
    def generate_metrics(self, stat_helper: TweetAnalyticsHelper) -> list[Metric]:
        """
        Override this. Abstract method to be implemented by subclasses for generating metrics.

        :param stat_helper: An instance of TweetAnalyticsHelper used to assist in the generation of metrics.
        :type stat_helper: TweetAnalyticsHelper
        :return: A list of generated Metric objects.
        :rtype: list[Metric]
        """
        pass
    


