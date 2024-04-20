from selenium.common.exceptions import TimeoutException
from enum import Enum


class ErrorType(Enum):
    PARSING_ERROR = 1
    MIRROR_ERROR = 2
    HTTP_ERROR = 3


class Error:
    """
    Represents an error that can occur during the crawling process.
    """

    _parsing_error_set = {"IncompleteException"}
    _mirror_error_set = {
        "TimeoutException",
        "ErrorPanelFound",
        "BadHTTPResponseCode",
        "NoHTTPResponseCode",
    }
    _internet_error_set = {}

    def __init__(self, error_name=None, from_json=None) -> None:
        """
        Initializes a new instance of the Error class.

        Args:
            error_name (str, optional): The name of the error. Defaults to None.
            from_json (dict, optional): A dictionary containing the error details. Defaults to None.
        """
        if error_name != None:
            self.error_name = error_name
            self.error_type = self._find_error_type()

        elif from_json != None:
            self.init_from_json(from_json)

    def _find_error_type(self) -> ErrorType:
        """
        Finds the error type based on the error name.

        Returns:
            ErrorType: The error type.
        """
        if self.error_name in Error._parsing_error_set:
            return ErrorType.PARSING_ERROR
        elif self.error_name in Error._mirror_error_set:
            return ErrorType.MIRROR_ERROR
        elif self.error_name in Error._internet_error_set:
            return ErrorType.HTTP_ERROR
        else:
            return None

    def get_error_type(self) -> ErrorType:
        """
        Gets the error type.

        Returns:
            ErrorType: The error type.
        """
        return self.error_type

    def to_json(self) -> dict:
        """
        Converts the error object to a JSON dictionary.

        Returns:
            dict: The JSON representation of the error object.
        """
        err_type = self.error_type
        return {
            "name": self.error_name,
            "type": self.error_type.name if err_type != None else None,
        }

    def init_from_json(self, json: dict):
        """
        Initializes the error object from a JSON dictionary.

        Args:
            json (dict): A dictionary containing the error details.
        """
        self.error_name = json["name"]
        self.error_type = self._find_error_type()
