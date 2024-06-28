from datetime import datetime
from backend.crawler_sys.utils.error_sys import Error
from .twitter_api_encoder import DataEncoder

class MetaData(DataEncoder):
    """
    Class representing metadata for an object.

    Args:
        as_json (dict): Optional. JSON representation of the metadata.

    Attributes:
        _object (dict): Dictionary representing the metadata.
        _errors (list[Error]): List of errors associated with the metadata.

    """

    def __init__(self, as_json=None) -> None:
        self._object = {}
        self._errors: list[Error] = []

        if as_json != None:
            self.from_json_dict(as_json)

    def attach(self, object: dict):
        """
        Attaches the metadata to the object.

        Args:
            object (dict): The object to attach the metadata to.

        """
        if "imeta" in object:
            # TODO: Trevor, check this
            # raise Exception("imeta already exists in object")
            pass

        object["imeta"] = self.to_json_dict()

    def get_created(self):
        """
        Returns the creation date of the object.

        Returns:
            datetime: The creation date of the object.

        """
        return self._object["created"]

    def get_owner_id(self) -> int:
        """
        Returns the owner ID of the object.

        Returns:
            int: The owner ID of the object.

        """
        return self._object["oid"]

    def get_update_id(self):
        """
        Returns the update ID of the object.

        Returns:
            Any: The update ID of the object.

        """
        return self._object["uid"]

    def get_errors(self) -> list[Error]:
        """
        Returns the list of errors associated with the metadata.

        Returns:
            list[Error]: The list of errors associated with the metadata.

        """
        return self._errors

    def get_version(self):
        """
        Returns the version of the object.

        Returns:
            Any: The version of the object.

        """
        return self._object["version"]

    def get_backup_file_id(self):
        """
        Returns the backup file ID of the object.

        Returns:
            Any: The backup file ID of the object.

        """
        return self._object["bfi"]

    def set_as_new(self):
        """
        Sets the metadata as new.

        """
        self._set_created(datetime.now())
        self._set_version_to_current()
        self._set_update_id(None)

    def set_domain(self, domain: str):
        """
        Sets the domain of the object.

        Args:
            domain (str): The domain of the object.

        """
        self._object["domain"] = domain

    def set_as_update(self, owner_id: str):
        """
        Sets the metadata as an update.

        Args:
            owner_id (str): The owner ID of the object.

        """
        self._set_owner_id(owner_id)
        self._set_version_to_current()

    def _set_created(self, created: datetime):
        """
        Sets the 'created' attribute of the object.

        Parameters:
            created (datetime): The datetime object representing the creation time.

        Returns:
            None
        """
        self._object["created"] = created

    def _set_owner_id(self, owner_id):
        """
        Set the owner ID for the object.

        :param owner_id: The ID of the owner.
        :type owner_id: int
        """
        self._object["oid"] = owner_id

    def _set_update_id(self, update_id):
        """
        Set the update ID for the object.

        :param update_id: The update ID to set.
        :type update_id: int
        """
        self._object["uid"] = update_id

    def set_errors(self, errors):
        """
        Set the errors for the encoder.

        :param errors: A list of errors.
        :type errors: list
        """
        self._errors = [error for error in errors if error != None]

    def _set_version(self, version):
        """
        Set the version of the object.

        :param version: The version to set.
        :type version: str
        """
        self._object["version"] = version

    def _set_version_to_current(self):
        """
        Set the version of the object to the current version.

        This method sets the version of the object to the current version. The current version is obtained from the `config.get_version()` method.

        Parameters:
            self (MetaEncoder): The MetaEncoder object.

        Returns:
            None
        """
        self._object["version"] = (
            ""  # TODO: Implement versioning should be set to config.get_version()
        )

    def set_backup_file_id(self, backup_file_id):
        """
        Set the backup file ID for the meta encoder.

        :param backup_file_id: The backup file ID to set.
        :type backup_file_id: str
        """
        self._object["bfi"] = backup_file_id

    def _errors_to_json(self):
        """
        Converts the errors to a JSON format.

        Returns:
            list: A list of JSON objects representing the errors.
        """
        return [error.to_json() for error in self._errors]

    def _from_json_dict(self, data: dict) -> dict:
        """
        Convert a dictionary representation of the object from JSON.

        Args:
            data (dict): The dictionary containing the JSON data.

        Returns:
            dict: The converted object.

        """
        self._object = data
        self._errors = [Error(from_json=error) for error in data["errors"]]

    def _changes_from_json_dict(self) -> dict:
        """
        Convert the changes from a JSON dictionary to a Python dictionary.

        This method is not supported for metadata encoders and will raise an exception.

        Raises:
            Exception: This method is not supported for metadata encoders.

        Returns:
            dict: An empty dictionary.
        """
        raise Exception("Metadata does not support this method")

    # TODO fix "zid". Should be set to config.get_zid()
    def _to_json_dict(self):
        """
        Convert the object to a JSON dictionary.

        Returns:
            dict: A dictionary representation of the object.
        """
        self._object["errors"] = self._errors_to_json()
        self._object["zid"] = ""
        return self._object

    def _changes_to_json_dict(self):
        """
        Converts the changes to a JSON dictionary.

        This method adds the errors and zid attributes to the JSON dictionary.

        Returns:
            dict: The JSON dictionary with the changes.
        """
        self._object["errors"] = self._errors_to_json()
        self._object["zid"] = ""
        return self._object
