from .twitter_api_encoder import DataEncoder, IncompleteBuildException
from .meta_encoder import MetaData
from datetime import datetime

class Profile(DataEncoder):
    def __init__(self, as_json=None, changes_json=None) -> None:
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
            self.decode_from_dict(as_json)
        if changes_json != None:
            self.decode_changes_from_dict(changes_json)

    def raise_unless_required_fields_set(self):
        if not self._required_fields.issubset(self._set_fields):
            missing_fields = self._required_fields - self._set_fields
            raise IncompleteBuildException(
                f"Missing required fields before build: {missing_fields}"
            )

    def _encode_as_dict(self) -> dict:
        self.raise_unless_required_fields_set()
        return self._object

    def _encode_changes_as_dict(self) -> dict:
        self.raise_unless_required_fields_set()
        metrics = self._object["public_metrics"]
        metrics["imeta"] = {"username": self._object["username"]}
        metrics["timestamp"] = datetime.now()
        return metrics

    def set_name(self, name: str):
        self._object["name"] = name
        self._set_fields.add("name")

    def get_name(self):
        return self._object["name"]

    def set_username(self, username: str):
        if username.startswith("@"):
            username = username[1:]
        self._object["username"] = username.lower()
        if username != None and username != "":
            self._set_fields.add("username")

    def get_username(self):
        return self._object["username"]

    def set_description(self, description: str):
        self._object["description"] = description
        self._set_fields.add("description")

    def get_description(self):
        return self._object["description"]

    def set_location(self, location: str):
        self._object["location"] = location
        self._set_fields.add("location")

    def get_location(self):
        return self._object["location"]

    def set_url(self, url: str):
        self._object["url"] = url
        self._set_fields.add("url")

    def get_url(self):
        return self._object["url"]

    def set_verified(self, verified: bool):
        self._object["verified"] = verified
        self._set_fields.add("verified")

    def get_verified(self):
        return self._object["verified"]

    def set_created_at(self, created_at: str):
        self._object["created_at"] = created_at
        self._set_fields.add("created_at")

    def get_created_at(self):
        return self._object["created_at"]

    def set_profile_image_url(self, profile_image_url: str):
        self._object["profile_image_url"] = profile_image_url
        self._set_fields.add("profile_image_url")

    def get_profile_image_url(self):
        return self._object["profile_image_url"]

    def set_public_metrics(
        self, followers_count, following_count, tweet_count, like_count
    ):
        self._object["public_metrics"] = {}

        self._object["public_metrics"]["followers_count"] = int(
            followers_count.replace(",", "")
        )
        self._object["public_metrics"]["following_count"] = int(
            following_count.replace(",", "")
        )
        self._object["public_metrics"]["tweet_count"] = int(
            tweet_count.replace(",", "")
        )
        self._object["public_metrics"]["like_count"] = int(like_count.replace(",", ""))

        self._set_fields.add("public_metrics")

    def get_public_metrics(self):
        return self._object["public_metrics"]

    def set_errors(self, errors):
        self._meta.set_errors(errors)
        
        