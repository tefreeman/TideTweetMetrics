from datetime import datetime
from crawler_sys.utils.error_sys import Error
from .twitter_api_encoder import DataEncoder
from config import Config

class MetaData(DataEncoder):
    def __init__(self, as_json=None) -> None:
        
        self._object = {}
        self._errors: list[Error] = []
        
        if as_json != None:
            self._object = self.decode_from_dict(as_json)
            
    def get_created(self):
        return self._object["created"]

    def get_update_id(self):
        return self._object["uid"]

    def get_errors(self) -> list[Error]:
        return self._errors

    def get_version(self):
        return self._object["version"]

    def get_backup_file_id(self):
        return self._object["bfi"]

    def set_created(self, created: datetime):
        self._object["created"] = created

    def set_update_id(self, update_id):
        self._object["uid"] = update_id

    def set_errors(self, errors):
         self._errors = [error for error in errors if error != None]

    def set_version_to_current(self):
        self._object["version"] = Config.get_version()

    def set_backup_file_id(self, backup_file_id):
        self._object["bfi"] = backup_file_id

    def _decode_as_dict(self, data: dict) -> dict:
        self._object = data 
        self._errors = [Error(from_json=error) for error in data["errors"]]
    
    def _decode_changes_as_dict(self) -> dict:
        pass
    
    def _encode_as_dict(self):
        self._object["errors"] = [error.to_json() for error in self._errors]
        return self._object
    
    def _encode_changes_as_dict(self):
        return self._encode_as_dict()