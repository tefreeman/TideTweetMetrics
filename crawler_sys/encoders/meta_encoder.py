from datetime import datetime
from utils.error_sys import Error
from .twitter_api_encoder import DataEncoder
from config import Config


class MetaData(DataEncoder):
    def __init__(self, as_json=None) -> None:

        self._object = {}
        self._errors: list[Error] = []

        if as_json != None:
            self._object = self.from_json_dict(as_json)

    # Attaches the imeta to the object
    def attach(self, object: dict):
        if "imeta" in object:
            raise Exception("imeta already exists in object")

        object["imeta"] = self.to_json_dict()

    def get_created(self):
        return self._object["created"]

    def get_owner_id(self) -> int:
        return self._object["oid"]

    def get_update_id(self):
        return self._object["uid"]

    def get_errors(self) -> list[Error]:
        return self._errors

    def get_version(self):
        return self._object["version"]

    def get_backup_file_id(self):
        return self._object["bfi"]

    def set_as_new(self):
        self._set_created(datetime.now())
        self._set_version_to_current()
        self._set_update_id(None)

    def set_domain(self, domain: str):
        self._object["domain"] = domain

    def set_as_update(self, owner_id: str):
        self._set_owner_id(owner_id)
        self._set_version_to_current()

    def _set_created(self, created: datetime):
        self._object["created"] = created

    def _set_owner_id(self, owner_id):
        self._object["oid"] = owner_id

    def _set_update_id(self, update_id):
        self._object["uid"] = update_id

    def set_errors(self, errors):
        self._errors = [error for error in errors if error != None]

    def _set_version(self, version):
        self._object["version"] = version

    def _set_version_to_current(self):
        self._object["version"] = Config.get_version()

    def set_backup_file_id(self, backup_file_id):
        self._object["bfi"] = backup_file_id

    def _errors_to_json(self):
        return [error.to_json() for error in self._errors]

    def _from_json_dict(self, data: dict) -> dict:
        self._object = data
        self._errors = [Error(from_json=error) for error in data["errors"]]

    def _changes_from_json_dict(self) -> dict:
        raise Exception("Metadata does not support this method")

    def _to_json_dict(self):
        self._object["errors"] = self._errors_to_json()
        self._object["zid"] = Config.next_run_backup_zip_id()
        return self._object

    def _changes_to_json_dict(self):
        self._object["errors"] = self._errors_to_json()
        self._object["zid"] = Config.next_run_backup_zip_id()
        return self._object
