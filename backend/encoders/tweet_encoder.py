from .twitter_api_encoder import (
    DataEncoder,
    IncompleteBuildException,
    ReferencedTweetType,
)
from .meta_encoder import MetaData
from datetime import datetime
import re
import pytz


class Tweet(DataEncoder):
    def __init__(self, as_json:dict=None, changes_json=None, ignore_required=False) -> None:
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

        if as_json != None:
            self.from_json_dict(as_json)
        if changes_json != None:
            self.changes_from_json_dict(changes_json)

    def ensure_required_fields_set(self):
        if self.ignore_required:
            return
        if not self._required_fields.issubset(self._set_fields):
            missing_fields = self._required_fields - self._set_fields
            raise IncompleteBuildException(
                f"Missing required fields before build: {missing_fields}"
            )

    def _from_json_dict(self, data: dict):
        self._object = data["data"]
        self._includes = data["includes"]
        self._meta = MetaData(as_json=data["imeta"])

    def _changes_from_json_dict(self, data: dict):
        pass

    def _to_json_dict(self) -> dict:
        self.ensure_required_fields_set()
        return_object = {"data": self._object, "includes": self._includes}
        self._meta.attach(return_object)
        return return_object

    def _changes_to_json_dict(self) -> dict:
        self.ensure_required_fields_set()
        metrics = self._object["public_metrics"]
        metrics["timestamp"] = datetime.now()
        self.get_meta_ref().attach(metrics)
        return metrics

    def _extract_id_from_url(self, url: str) -> str:
        match = re.search(r"/status/(\d+)", url)
        if match:
            return match.group(1)
        else:
            return url

    def set_id(self, url: str | None):
        self._object["id"] = self._extract_id_from_url(url)
        if url != None or url != "":
            self._set_fields.add("id")

    def get_id(self) -> str | None:
        return self._object["id"]

    def set_text(self, text: str):
        self._object["text"] = text
        self._set_fields.add("text")

    def get_text(self) -> str:
        return self._object["text"]

    def set_post_date(self, date: str):
        date_format = "%b %d, %Y · %I:%M %p"
        parsed_date = datetime.strptime(date.split(" UTC")[0], date_format)
        parsed_date = parsed_date.replace(tzinfo=pytz.UTC)
        self._object["created_at"] = parsed_date
        if date != None and date != "":
            self._set_fields.add("created_at")

    def get_post_date(self):
        return self._object["created_at"]
    

    def set_author(self, username: str):
        if username.startswith("@"):
            username = username[1:]
        self._object["author_id"] = username.lower()
        if username != None and username != "":
            self._set_fields.add("author_id")

    def get_author(self):
        return self._object["author_id"]

    def set_public_metrics(self, retweet_count, reply_count, like_count, quote_count):
        self._object["public_metrics"] = {}
        self._object["public_metrics"]["retweet_count"] = int(
            retweet_count.replace(",", "")
        )
        self._object["public_metrics"]["reply_count"] = int(
            reply_count.replace(",", "")
        )
        self._object["public_metrics"]["like_count"] = int(like_count.replace(",", ""))
        self._object["public_metrics"]["quote_count"] = int(
            quote_count.replace(",", "")
        )
        self._set_fields.add("public_metrics")

    def get_public_metrics(self):
        return self._object["public_metrics"]

    def get_like_count(self):
        return self._object["public_metrics"]["like_count"]

    def get_retweet_count(self):
        return self._object["public_metrics"]["retweet_count"]

    def get_reply_count(self):
        return self._object["public_metrics"]["reply_count"]

    def get_quote_count(self):
        return self._object["public_metrics"]["quote_count"]

    def set_entities(self, content_links, content_text: str):
        entities = {
            "annotations": [],
            "cashtags": [],
            "hashtags": [],
            "mentions": [],
            "urls": [],
        }
        for content_link in content_links:
            if content_link["text"][0] == "@":
                entities["mentions"].append(
                    {
                        "tag": content_link["text"][1:],
                        "start": content_text.find(content_link["text"]),
                        "end": content_text.find(content_link["text"])
                        + len(content_link["text"]),
                    }
                )
            elif content_link["text"][0] == "#":
                entities["hashtags"].append(
                    {
                        "tag": content_link["text"][1:],
                        "start": content_text.find(content_link["text"]),
                        "end": content_text.find(content_link["text"])
                        + len(content_link["text"]),
                    }
                )
            elif content_link["text"][0] == "$":
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
        return self._object["entities"]

    def get_annotations(self):
        return self._object["entities"]["annotations"]

    def get_cashtags(self):
        return self._object["entities"]["cashtags"]

    def get_hashtags(self):
        return self._object["entities"]["hashtags"]

    def get_mentions(self):
        return self._object["entities"]["mentions"]

    def get_urls(self):
        return self._object["entities"]["urls"]

    def set_attachments(self, photos, videos, cards):
        self._object["attachments"] = {}
        self._object["attachments"]["photos"] = photos
        self._object["attachments"]["videos"] = videos
        self._object["attachments"]["cards"] = cards
        self._set_fields.add("attachments")

    def get_photos(self):
        return self._object["attachments"]["photos"]

    def get_videos(self):
        return self._object["attachments"]["videos"]

    def get_cards(self):
        return self._object["attachments"]["cards"]

    def get_attachments(self):
        return self._object["attachments"]

    # Version 2 of the Twitter API has a new field called "referenced_tweets" that can be set
    # For some reason this field is an array and an object in Twitter API docs
    # We will implement it as an object
    # https://developer.twitter.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-recent

    def set_refenced_tweet(self, referenced_tweet_id, tweet_type: ReferencedTweetType):
        if isinstance(tweet_type, ReferencedTweetType) == False:
            raise ValueError("tweet_type must be an instance of ReferencedTweetType")

        self._object["referenced_tweet"] = {}

        if tweet_type.value != "none":
            self._object["referenced_tweet"]["id"] = referenced_tweet_id
            self._object["referenced_tweet"]["type"] = tweet_type.value

        self._set_fields.add("referenced_tweet")

    def get_referenced_tweet(self):
        return self._object["referenced_tweet"]

    def get_meta_ref(self) -> MetaData:
        return self._meta
