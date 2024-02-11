from selenium.common.exceptions import TimeoutException
from enum import Enum

class ErrorType(Enum):
    PARSING_ERROR = 1
    MIRROR_ERROR = 2
    HTTP_ERROR = 3

class Error:
    _parsing_error_set = {"IncompleteException"}
    _mirror_error_set = {"TimeoutException", "ErrorPanelFound", "BadHTTPResponseCode"}
    _internet_error_set = {}

    def __init__(self, error_name) -> None:
        self.error_name = error_name
        self.error_type = self._find_error_type()

    def _find_error_type(self) -> ErrorType:
        if self.error_name in Error._parsing_error_set:
            return ErrorType.PARSING_ERROR
        elif self.error_name in Error._mirror_error_set:
            return ErrorType.MIRROR_ERROR
        elif self.error_name in Error._internet_error_set:
            return ErrorType.HTTP_ERROR
    
    def get_error_type(self) -> ErrorType:
        return self.error_type
    
    def to_json(self) -> dict:
        return {"error_name": self.error_name, "error_type": self.error_type.name}   

try:
    raise TimeoutException
except TimeoutException as e:
    Error(e.__class__.__name__)