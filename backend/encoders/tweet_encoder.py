from .twitter_api_encoder import (
    DataEncoder,
    IncompleteBuildException,
    ReferencedTweetType,
)
from .meta_encoder import MetaData
from datetime import datetime
import re
import pytz
import logging


class Tweet(DataEncoder):
    """
    Represents a tweet object and provides methods to manipulate and access its data.

    Args:
        as_json (dict, optional): A dictionary representing the tweet object in JSON format. Defaults to None.
        changes_json (dict, optional): A dictionary representing the changes made to the tweet object in JSON format. Defaults to None.
        ignore_required (bool, optional): If True, ignores the required fields check. Defaults to False.
    """

    def __init__(
        self, as_json: dict = None, changes_json=None, ignore_required=False
    ) -> None:
        self._object = {}
        self._includes = {}
        self._meta = MetaData()
        self._set_fields = set()
        self.ignore_required = ignore_required
        self._required_fields = {
            "id",
            "text",
            "created_at",
            "author_id",
            "public_metrics",
            "entities",
            "attachments",
        }
        self._public_metric_keys = {
            "retweet_count",
            "reply_count",
            "like_count",
            "quote_count",
        }
        self._entity_keys = {"annotations", "cashtags", "hashtags", "mentions", "urls"}
        self._attachment_keys = {"photos", "videos", "cards"}

        if as_json != None:
            self._from_json_dict(as_json)
        if changes_json != None:
            self.changes_from_json_dict(changes_json)

    def ensure_required_fields_set(self):
        """
        Checks if all the required fields are set.

        Raises:
            IncompleteBuildException: If any required field is missing.
        """
        if self.ignore_required:
            logging.info("required fields are being ignored")
            return
        if not self._required_fields.issubset(self._set_fields):
            missing_fields = self._required_fields - self._set_fields
            raise IncompleteBuildException(
                f"Missing required fields before build: {missing_fields}"
            )
        logging.debug("required fields are set")

    def _from_json_dict(self, data: dict):
        """
        Initializes the tweet object from a JSON dictionary.

        Args:
            data (dict): A dictionary representing the tweet object in JSON format.
        """
        self._object = data["data"]
        self._includes = data["includes"]
        self._meta = MetaData(as_json=data["imeta"])
        for field in data["data"].keys():
            if field == "public_metrics":
                if data["data"]["public_metrics"].keys() >= self._public_metric_keys:
                    logging.debug("setting field public_metrics")
                    self._set_fields.add("public_metrics")
                else:
                    logging.warning(
                        "public_metrics does not contain all required parts"
                    )
            elif field == "entities":
                if data["data"]["entities"].keys() >= self._entity_keys:
                    logging.debug("setting field entities")
                    self._set_fields.add("entities")
                else:
                    logging.warning("entities does not contain all required parts")
            elif field == "attachments":
                if data["data"]["attachments"].keys() >= self._attachment_keys:
                    logging.debug("setting field attachments")
                    self._set_fields.add("attachments")
                else:
                    logging.warning("attachments does not contain all required parts")
            else:
                logging.debug(f"setting field {field}")
                self._set_fields.add(field)

    def _changes_from_json_dict(self, data: dict):
        """
        Updates the tweet object with changes from a JSON dictionary.

        Args:
            data (dict): A dictionary representing the changes made to the tweet object in JSON format.
        """
        pass

    def _to_json_dict(self) -> dict:
        """
        Converts the tweet object to a JSON dictionary.

        Returns:
            dict: A dictionary representing the tweet object in JSON format.
        """
        self.ensure_required_fields_set()
        return_object = {"data": self._object, "includes": self._includes}
        self._meta.attach(return_object)
        return return_object

    def _changes_to_json_dict(self) -> dict:
        """
        Converts the changes made to the tweet object to a JSON dictionary.

        Returns:
            dict: A dictionary representing the changes made to the tweet object in JSON format.
        """
        self.ensure_required_fields_set()
        metrics = self._object["public_metrics"]
        metrics["timestamp"] = datetime.now()
        self.get_meta_ref().attach(metrics)
        return metrics

    def _extract_id_from_url(self, url: str) -> str:
        """
        Extracts the tweet ID from a tweet URL.

        Args:
            url (str): The URL of the tweet.

        Returns:
            str: The tweet ID.
        """
        match = re.search(r"/status/(\d+)", url)
        if match:
            return match.group(1)
        else:
            logging.warning("Match not found. Returning url")
            return url

    def set_id(self, id: str):
        """
        Sets the ID of the tweet.

        Args:
            id (str | None): The ID of the tweet. If None, the ID is not set.
        """
        self._object["id"] = id
        if id != None and id != "":
            self._set_fields.add("id")
        else:
            logging.warning("ID is None or blank. id is not being set")

    def get_id(self) -> str | None:
        """
        Returns the ID of the tweet.

        Returns:
            str | None: The ID of the tweet.
        """
        return self._object["id"]

    def set_text(self, text: str):
        """
        Sets the text of the tweet.

        Args:
            text (str): The text of the tweet.
        """
        self._object["text"] = text
        self._set_fields.add("text")

    def get_text(self) -> str:
        """
        Returns the text of the tweet.

        Returns:
            str: The text of the tweet.
        """
        return self._object["text"]

    def set_post_date(self, date: str):
        """
        Sets the post date of the tweet.

        Args:
            date (str): The post date of the tweet in the format "EEE MMM dd HH:mm:ss Z yyyy" or "%b %d, %Y · %I:%M %p".
        """

        # Define different possible formats
        formats = [
            "%a %b %d %H:%M:%S %z %Y",
            "%b %d, %Y · %I:%M %p",
            "%b %d, %Y · %I:%M %p %Z",  # Added this line to handle the specific input format
        ]

        for date_format in formats:
            try:
                parsed_date = datetime.strptime(date, date_format)

                # If the timezone information is not provided, assume UTC
                if (
                    parsed_date.tzinfo is None
                    or parsed_date.tzinfo.utcoffset(parsed_date) is None
                ):
                    parsed_date = parsed_date.replace(tzinfo=pytz.UTC)

                self._object["created_at"] = parsed_date
                if date != "" and date is not None:
                    self._set_fields.add("created_at")

                return  # Exit the function once a valid format has been found and processed
            except ValueError:
                pass  # Ignore exceptions for unmatched formats

        logging.warning("date is either None or blank. created_at is not being added.")

    def get_post_date(self):
        """
        Returns the post date of the tweet.

        Returns:
            datetime: The post date of the tweet.
        """
        return self._object["created_at"]

    def set_author(self, username: str):
        """
        Sets the author of the tweet.

        Args:
            username (str): The username of the author.
        """
        if username.startswith("@"):
            username = username[1:]
        self._object["author_id"] = username.lower()
        if username != None and username != "":
            self._set_fields.add("author_id")
        else:
            logging.warning(
                "username is either None or blank. author_id is not being added"
            )

    def get_author(self):
        """
        Returns the author of the tweet.

        Returns:
            str: The username of the author.
        """
        return self._object["author_id"]

    def set_public_metrics(self, retweet_count, reply_count, like_count, quote_count):
        """
        Sets the public metrics of the tweet.

        Args:
            retweet_count (int): The number of retweets.
            reply_count (int): The number of replies.
            like_count (int): The number of likes.
            quote_count (int): The number of quotes.
        """
        self._object["public_metrics"] = {}

        self._object["public_metrics"]["retweet_count"] = retweet_count

        self._object["public_metrics"]["reply_count"] = reply_count
        self._object["public_metrics"]["like_count"] = like_count
        self._object["public_metrics"]["quote_count"] = quote_count

        self._set_fields.add("public_metrics")

    def get_public_metrics(self):
        """
        Returns the public metrics of the tweet.

        Returns:
            dict: A dictionary containing the public metrics of the tweet.
        """
        return self._object["public_metrics"]

    def get_like_count(self):
        """
        Returns the number of likes of the tweet.

        Returns:
            int: The number of likes.
        """
        return self._object["public_metrics"]["like_count"]

    def get_retweet_count(self):
        """
        Returns the number of retweets of the tweet.

        Returns:
            int: The number of retweets.
        """
        return self._object["public_metrics"]["retweet_count"]

    def get_reply_count(self):
        """
        Returns the number of replies of the tweet.

        Returns:
            int: The number of replies.
        """
        return self._object["public_metrics"]["reply_count"]

    def get_quote_count(self):
        """
        Returns the number of quotes of the tweet.

        Returns:
            int: The number of quotes.
        """
        return self._object["public_metrics"]["quote_count"]

    def set_entities_direct(self, entities: dict):
        """
        Sets the entities of the tweet.

        Args:
            entities (dict): A dictionary containing the entities of the tweet.
        """
        self._object["entities"] = entities
        self._set_fields.add("entities")

    def set_entities(self, content_links, content_text: str):
        """
        Sets the entities of the tweet.

        Args:
            content_links (list): A list of dictionaries representing the content links in the tweet.
            content_text (str): The text of the tweet.

        Example:
            tweet = Tweet()

            content_links = [
                {"text": "@user1", "href": "https://twitter.com/user1"},
                {"text": "#hashtag1", "href": "https://twitter.com/hashtag/hashtag1"},
                {"text": "$cashtag1", "href": "https://twitter.com/cashtag/cashtag1"},
                {"text": "https://example.com", "href": "https://example.com"},
            ]
            content_text = "This is a tweet with @user1, #hashtag1, $cashtag1, and a link https://example.com"
            tweet.set_entities(content_links, content_text)
        """
        entities = {
            "annotations": [],
            "cashtags": [],
            "hashtags": [],
            "mentions": [],
            "urls": [],
        }
        for content_link in content_links:
            if content_link["text"][0] == "@":
                logging.debug(f"adding mention {content_link['text']}")
                entities["mentions"].append(
                    {
                        "tag": content_link["text"][1:],
                        "start": content_text.find(content_link["text"]),
                        "end": content_text.find(content_link["text"])
                        + len(content_link["text"]),
                    }
                )
            elif content_link["text"][0] == "#":
                logging.debug(f"adding hashtag {content_link['text']}")
                entities["hashtags"].append(
                    {
                        "tag": content_link["text"][1:],
                        "start": content_text.find(content_link["text"]),
                        "end": content_text.find(content_link["text"])
                        + len(content_link["text"]),
                    }
                )
            elif content_link["text"][0] == "$":
                logging.debug(f"adding cashtag {content_link['text']}")
                entities["cashtags"].append(
                    {
                        "tag": content_link["text"][1:],
                        "start": content_text.find(content_link["text"]),
                        "end": content_text.find(content_link["text"])
                        + len(content_link["text"]),
                    }
                )
            else:
                display_url = content_link["text"]
                logging.debug(f"adding url with display {display_url}")
                entities["urls"].append(
                    {
                        "url": content_link["href"],
                        "display_url": display_url,
                        "start": content_text.find(display_url),
                        "end": content_text.find(display_url) + len(display_url),
                    }
                )

        self._object["entities"] = entities
        self._set_fields.add("entities")

    def get_entities(self):
        """
        Returns the entities of the tweet.

        Returns:
            dict: A dictionary containing the entities of the tweet.
        """
        return self._object["entities"]

    def get_annotations(self):
        """
        Returns the annotations of the tweet.

        Returns:
            list: A list of dictionaries representing the annotations in the tweet.
        """
        return self._object["entities"]["annotations"]

    def get_cashtags(self):
        """
        Returns the cashtags of the tweet.

        Returns:
            list: A list of dictionaries representing the cashtags in the tweet.
        """
        return self._object["entities"]["cashtags"]

    def get_hashtags(self):
        """
        Returns the hashtags of the tweet.

        Returns:
            list: A list of dictionaries representing the hashtags in the tweet.
        """
        return self._object["entities"]["hashtags"]

    def get_mentions(self):
        """
        Returns the mentions of the tweet.

        Returns:
            list: A list of dictionaries representing the mentions in the tweet.
        """
        return self._object["entities"]["mentions"]

    def get_urls(self):
        """
        Returns the URLs of the tweet.

        Returns:
            list: A list of dictionaries representing the URLs in the tweet.
        """
        return self._object["entities"]["urls"]

    def set_attachments(self, photos, videos, cards):
        """
        Sets the attachments of the tweet.

        Args:
            photos (list): A list of dictionaries representing the photos in the tweet.
            videos (list): A list of dictionaries representing the videos in the tweet.
            cards (list): A list of dictionaries representing the cards in the tweet.
        """
        self._object["attachments"] = {}
        self._object["attachments"]["photos"] = photos
        self._object["attachments"]["videos"] = videos
        self._object["attachments"]["cards"] = cards
        self._set_fields.add("attachments")

    def get_photos(self):
        """
        Returns the photos of the tweet.

        Returns:
            list: A list of dictionaries representing the photos in the tweet.
        """
        return self._object["attachments"]["photos"]

    def get_videos(self):
        """
        Returns the videos of the tweet.

        Returns:
            list: A list of dictionaries representing the videos in the tweet.
        """
        return self._object["attachments"]["videos"]

    def get_cards(self):
        """
        Returns the cards of the tweet.

        Returns:
            list: A list of dictionaries representing the cards in the tweet.
        """
        return self._object["attachments"]["cards"]

    def get_attachments(self):
        """
        Returns the attachments of the tweet.

        Returns:
            dict: A dictionary containing the attachments of the tweet.
        """
        return self._object["attachments"]

    def set_referenced_tweet(
        self, referenced_tweet_id, tweet_type: ReferencedTweetType
    ):
        """
        Sets the referenced tweet for the current tweet.

        Parameters:
            referenced_tweet_id (str): The ID of the referenced tweet.
            tweet_type (ReferencedTweetType): The type of the referenced tweet.

        Raises:
            ValueError: If tweet_type is not an instance of ReferencedTweetType.

        Returns:
            None

        Note:
            Version 2 of the Twitter API has a new field called "referenced_tweets" that can be set.
            For some reason, this field is an array and an object in the Twitter API docs.
            We will implement it as an object.
            https://developer.twitter.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-recent
        """
        if isinstance(tweet_type, ReferencedTweetType) == False:
            raise ValueError("tweet_type must be an instance of ReferencedTweetType")

        self._object["referenced_tweet"] = {}

        if tweet_type.value != "none":
            logging.debug(
                f"referenced tweet found with id {referenced_tweet_id} and type {tweet_type.value}"
            )
            self._object["referenced_tweet"]["id"] = referenced_tweet_id
            self._object["referenced_tweet"]["type"] = tweet_type.value
        else:
            logging.debug("no referenced tweets")

        self._set_fields.add("referenced_tweet")

    def get_referenced_tweet(self):
        return self._object["referenced_tweet"]

    def get_meta_ref(self) -> MetaData:
        return self._meta
