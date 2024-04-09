from .twitter_api_encoder import DataEncoder, IncompleteBuildException
from .meta_encoder import MetaData
from datetime import datetime


class Profile(DataEncoder):
    def __init__(self, as_json=None, changes_json=None) -> None:
        """
        Initialize a Profile object.

        Parameters:
        - as_json (dict): A dictionary representing the profile data.
        - changes_json (dict): A dictionary representing the changes made to the profile data.
        """
        self._object = {}
        self._set_fields = set()
        self._meta = MetaData()
        self._required_fields = {
            "name",
            "description",
            "username",
            "location",
            "url",
            "description",
            "verified",
            "created_at",
            "profile_image_url",
            "public_metrics",
        }

        if as_json != None:
            self.from_json_dict(as_json)

        if changes_json != None:
            self.changes_from_json_dict(changes_json)

    def raise_unless_required_fields_set(self):
        """
        Raise an exception if any required fields are missing.
        """
        if not self._required_fields.issubset(self._set_fields):
            missing_fields = self._required_fields - self._set_fields

            raise IncompleteBuildException(
                f"Missing required fields before build: {missing_fields}"
            )

    def _to_json_dict(self) -> dict:
        """
        Convert the Profile object to a JSON dictionary.

        Returns:

        - dict: A dictionary representing the Profile object.
        """
        self.raise_unless_required_fields_set()
        self._meta.attach(self._object)
        return self._object

    def _changes_to_json_dict(self) -> dict:
        """
        Convert the changes made to the Profile object to a JSON dictionary.

        Returns:

        - dict: A dictionary representing the changes made to the Profile object.

        """

        self.raise_unless_required_fields_set()
        metrics = self._object["public_metrics"]
        metrics["timestamp"] = datetime.now()
        self.get_meta_ref().attach(metrics)
        return metrics

    def _from_json_dict(self, data: dict):
        """
        Populate the Profile object from a JSON dictionary.


        Parameters:
        - data (dict): A dictionary representing the profile data.
        """
        self._object = data
        self._meta = MetaData(data["imeta"])

    def _changes_from_json_dict(self, data: dict):
        """

        Populate the changes made to the Profile object from a JSON dictionary.

        Parameters:
        - data (dict): A dictionary representing the changes made to the profile data.
        """
        pass

    def set_name(self, name: str):
        """
        Set the name of the profile.


        Parameters:
        - name (str): The name of the profile.
        """
        self._object["name"] = name
        self._set_fields.add("name")

    def get_name(self):
        """

        Get the name of the profile.

        Returns:
        - str: The name of the profile.
        """
        return self._object["name"]

    def set_username(self, username: str):
        """
        Set the username of the profile.

        Parameters:
        - username (str): The username of the profile.
        """

        if username.startswith("@"):
            username = username[1:]
        self._object["username"] = username.lower()
        if username != None and username != "":
            self._set_fields.add("username")

    def get_username(self):
        """

        Get the username of the profile.

        Returns:
        - str: The username of the profile.
        """
        return self._object["username"]

    def set_description(self, description: str):
        """
        Set the description of the profile.


        Parameters:
        - description (str): The description of the profile.
        """
        self._object["description"] = description
        self._set_fields.add("description")

    def get_description(self):
        """

        Get the description of the profile.

        Returns:
        - str: The description of the profile.
        """
        return self._object["description"]

    def set_location(self, location: str):
        """
        Set the location of the profile.


        Parameters:
        - location (str): The location of the profile.
        """
        self._object["location"] = location
        self._set_fields.add("location")

    def get_location(self):
        """

        Get the location of the profile.

        Returns:
        - str: The location of the profile.
        """
        return self._object["location"]

    def set_url(self, url: str):
        """
        Set the URL of the profile.


        Parameters:
        - url (str): The URL of the profile.
        """
        self._object["url"] = url
        self._set_fields.add("url")

    def get_url(self):
        """

        Get the URL of the profile.

        Returns:
        - str: The URL of the profile.
        """
        return self._object["url"]

    def set_verified(self, verified: bool):
        """
        Set the verification status of the profile.


        Parameters:
        - verified (bool): The verification status of the profile.
        """
        self._object["verified"] = verified
        self._set_fields.add("verified")

    def get_verified(self):
        """

        Get the verification status of the profile.

        Returns:
        - bool: The verification status of the profile.
        """
        return self._object["verified"]

    def set_created_at(self, created_at: str):
        """
        Set the creation date of the profile.


        Parameters:
        - created_at (str): The creation date of the profile.
        """
        self._object["created_at"] = created_at
        self._set_fields.add("created_at")

    def get_created_at(self):
        """

        Get the creation date of the profile.

        Returns:
        - str: The creation date of the profile.
        """
        return self._object["created_at"]

    def set_profile_image_url(self, profile_image_url: str):
        """
        Set the profile image URL of the profile.


        Parameters:
        - profile_image_url (str): The profile image URL of the profile.
        """
        self._object["profile_image_url"] = profile_image_url
        self._set_fields.add("profile_image_url")

    def get_profile_image_url(self):
        """

        Get the profile image URL of the profile.

        Returns:
        - str: The profile image URL of the profile.
        """
        return self._object["profile_image_url"]

    def set_public_metrics(
        self, followers_count, following_count, tweet_count, like_count
    ):
        """
        Set the public metrics of the profile.

        Parameters:
        - followers_count (int or str): The number of followers.
        - following_count (int or str): The number of accounts being followed.
        - tweet_count (int or str): The number of tweets.
        - like_count (int or str): The number of likes.
        """
        self._object["public_metrics"] = {}

        if (
            isinstance(followers_count, str)
            and isinstance(following_count, str)
            and isinstance(tweet_count, str)
            and isinstance(like_count, str)
        ):
            self._object["public_metrics"]["followers_count"] = int(
                followers_count.replace(",", "")
            )
            self._object["public_metrics"]["following_count"] = int(
                following_count.replace(",", "")
            )
            self._object["public_metrics"]["tweet_count"] = int(
                tweet_count.replace(",", "")
            )
            self._object["public_metrics"]["like_count"] = int(
                like_count.replace(",", "")
            )
            self._set_fields.add("public_metrics")

        elif (
            isinstance(followers_count, int)
            and isinstance(following_count, int)
            and isinstance(tweet_count, int)
            and isinstance(like_count, int)
        ):
            self._object["public_metrics"]["followers_count"] = followers_count
            self._object["public_metrics"]["following_count"] = following_count
            self._object["public_metrics"]["tweet_count"] = tweet_count
            self._object["public_metrics"]["like_count"] = like_count
            self._set_fields.add("public_metrics")

        else:
            raise ValueError("Invalid type for public metrics")

    def get_public_metrics(self):
        """

        Get the public metrics of the profile.

        Returns:
        - dict: A dictionary representing the public metrics of the profile.
        """
        return self._object["public_metrics"]

    def get_followers_count(self):
        """

        Get the number of followers.

        Returns:
        - int: The number of followers.
        """
        return self._object["public_metrics"]["followers_count"]

    def get_following_count(self):
        """

        Get the number of accounts being followed.

        Returns:
        - int: The number of accounts being followed.
        """
        return self._object["public_metrics"]["following_count"]

    def get_tweet_count(self):
        """

        Get the number of tweets.

        Returns:
        - int: The number of tweets.
        """
        return self._object["public_metrics"]["tweet_count"]

    def get_like_count(self):
        """

        Get the number of likes.

        Returns:
        - int: The number of likes.
        """
        return self._object["public_metrics"]["like_count"]

    def get_meta_ref(self) -> MetaData:
        """
        Get the reference to the MetaData object.

        Returns:
        - MetaData: The reference to the MetaData object.
        """
        return self._meta
