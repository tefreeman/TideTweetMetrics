import json


class MetricEncoder:
    """
    The MetricEncoder class is responsible for encoding metric data into a specific format.

    Attributes:
        _dataset (list): The dataset containing the metric data.
        _dimension (int): The dimension of the metric data.

    Methods:
        set_dataset(data: list[any]) -> None:
            Sets the dataset with the given metric data.

        get_dataset() -> list[tuple]:
            Returns the dataset containing the metric data.

        get_dimension() -> int:
            Returns the dimension of the metric data.

        as_dict() -> tuple[str, str]:
            Returns the metric data as a dictionary.

    Example Usage:
        encoder = MetricEncoder()
        encoder.set_dataset([["all time", 245], ["last three months", 100], ["last week", 20]])
        dataset = encoder.get_dataset()
        dimension = encoder.get_dimension()
        metric_dict = encoder.as_dict()
    """

    def __init__(self) -> None:
        self._dataset = None
        self._dimension = 0

    def set_dataset(self, data: list[any]) -> None:
        """
        Sets the dataset with the given metric data.
            example data: [["all time", 245], ["last three months", 100], ["last week", 20]]
        Args:
            data (list[any]): The metric data to be set.

        Returns:
            None
        """
        if isinstance(data, list):
            if isinstance(data[0], tuple):
                self.max_dimension_dimension = len(data[0])
            else:
                self.max_dimension = 1
        else:
            self.max_dimension = 0  # 0 = scalar

        self._dataset = data

    def get_dataset(self) -> list[tuple]:
        """
        Returns the dataset containing the metric data.

        Returns:
            list[tuple]: The dataset containing the metric data.
        """
        return self._dataset

    def get_dimension(self) -> int:
        """
        Returns the dimension of the metric data.

        Returns:
            int: The dimension of the metric data.
        """
        return self._dimension

    def as_dict(self) -> tuple[str, str]:
        """
        Returns the metric data as a dictionary.

        Returns:
            tuple[str, str]: The metric data as a dictionary.


        Raises:
            Exception: If no data has been added to the encoder.
        """
        if self._dataset is None:
            raise Exception("No data has been added to the encoder")
        return self._dataset
