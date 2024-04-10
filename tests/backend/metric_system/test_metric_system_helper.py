from backend.encoders.tweet_encoder import Tweet
from backend.encoders.meta_encoder import MetaData
from backend.encoders.profile_encoder import Profile
from backend.encoders.twitter_api_encoder import ReferencedTweetType
import numpy as np


class TestMetricSystemHelper:
    def ReturnP1Tweet1(self) -> Tweet:
        tweet1 = Tweet()
        tweet1.set_id("1111111001")
        tweet1.set_text(
            "1st Tweet for 1st profile for test_metric_system. Disney is cool. Elon Musk is epic."
        )
        tweet1.set_post_date("Mar 10, 2020 · 04:30 PM UTC")
        tweet1.set_author("1st_profile")
        tweet1.set_public_metrics("10", "10", "10", "10")
        content_links = [
            {"text": "@user1", "href": "https://twitter.com/user1"},
            {"text": "#hashtag1", "href": "https://twitter.com/hashtag/hashtag1"},
            {"text": "$cashtag1", "href": "https://twitter.com/cashtag/cashtag1"},
            {"text": "https://example.com", "href": "https://example.com"},
        ]
        content_text = "This is a tweet with @user1, #hashtag1, $cashtag1, and a link https://example.com"
        tweet1.set_entities(content_links, content_text)
        tweet1.set_attachments([""], [""], [""])
        tweet1.set_referenced_tweet("", ReferencedTweetType.NONE)
        return tweet1

    def ReturnP1Tweet2(self) -> Tweet:
        tweet2 = Tweet()
        tweet2.set_id("1111111002")
        tweet2.set_text(
            "2nd Tweet for 1st profile for test_metric_system. Disney is cool. Elon Musk is epic. Extra text."
        )
        tweet2.set_post_date("Mar 10, 2020 · 05:30 PM UTC")
        tweet2.set_author("1st_profile")
        tweet2.set_public_metrics("20", "20", "20", "20")
        content_links = [
            {"text": "@user2", "href": "https://twitter.com/user2"},
            {"text": "#hashtag2", "href": "https://twitter.com/hashtag/hashtag2"},
            {"text": "$cashtag2", "href": "https://twitter.com/cashtag/cashtag2"},
            {"text": "https://example2.com", "href": "https://example2.com"},
        ]
        content_text = "This is a tweet with @user2, #hashtag2, $cashtag2, and a link https://example2.com"
        tweet2.set_entities(content_links, content_text)
        tweet2.set_attachments([""], [""], [""])
        tweet2.set_referenced_tweet("", ReferencedTweetType.NONE)
        return tweet2

    def ReturnP1Tweet3(self) -> Tweet:
        tweet3 = Tweet()
        tweet3.set_id("1111111003")
        tweet3.set_text(
            "3rd Tweet for 1st profile for test_metric_system. Disney is cool. Elon Musk is epic. Extra text. Extra text."
        )
        tweet3.set_post_date("Mar 10, 2021 · 06:30 PM UTC")
        tweet3.set_author("1st_profile")
        tweet3.set_public_metrics("30", "30", "30", "30")
        content_links = [
            {"text": "@user3", "href": "https://twitter.com/user3"},
            {"text": "#hashtag3", "href": "https://twitter.com/hashtag/hashtag3"},
            {"text": "$cashtag3", "href": "https://twitter.com/cashtag/cashtag3"},
            {"text": "https://example3.com", "href": "https://example3.com"},
        ]
        content_text = "This is a tweet with @user3, #hashtag3, $cashtag3, and a link https://example3.com"
        tweet3.set_entities(content_links, content_text)
        tweet3.set_attachments([""], [""], [""])
        tweet3.set_referenced_tweet("", ReferencedTweetType.NONE)
        return tweet3

    def ReturnP2Tweet1(self) -> Tweet:
        tweet1 = Tweet()
        tweet1.set_id("1111112001")
        tweet1.set_text(
            "1st Tweet for 2nd profile for test_metric_system. This is random text to create more variation."
        )
        tweet1.set_post_date("Mar 10, 2021 · 07:30 PM UTC")
        tweet1.set_author("2nd_profile")
        tweet1.set_public_metrics("40", "40", "40", "40")
        content_links = [
            {"text": "@user4", "href": "https://twitter.com/user4"},
            {"text": "#hashtag4", "href": "https://twitter.com/hashtag/hashtag4"},
            {"text": "$cashtag4", "href": "https://twitter.com/cashtag/cashtag4"},
            {"text": "https://example4.com", "href": "https://example4.com"},
        ]
        content_text = "This is a tweet with @user4, #hashtag4, $cashtag4, and a link https://example4.com"
        tweet1.set_entities(content_links, content_text)
        tweet1.set_attachments([""], [""], [""])
        tweet1.set_referenced_tweet("", ReferencedTweetType.NONE)
        return tweet1

    def ReturnP2Tweet2(self) -> Tweet:
        tweet2 = Tweet()
        tweet2.set_id("1111112002")
        tweet2.set_text(
            "2nd Tweet for 2nd profile for test_metric_system. This is random text to create more variation. And now I am writing even more."
        )
        tweet2.set_post_date("Mar 10, 2022 · 08:30 PM UTC")
        tweet2.set_author("2nd_profile")
        tweet2.set_public_metrics("50", "50", "50", "50")
        content_links = [
            {"text": "@user5", "href": "https://twitter.com/user5"},
            {"text": "#hashtag5", "href": "https://twitter.com/hashtag/hashtag5"},
            {"text": "$cashtag5", "href": "https://twitter.com/cashtag/cashtag5"},
            {"text": "https://example5.com", "href": "https://example5.com"},
        ]
        content_text = "This is a tweet with @user5, #hashtag5, $cashtag5, and a link https://example5.com"
        tweet2.set_entities(content_links, content_text)
        tweet2.set_attachments([""], [""], [""])
        tweet2.set_referenced_tweet("", ReferencedTweetType.NONE)
        return tweet2

    def ReturnP2Tweet3(self) -> Tweet:
        tweet3 = Tweet()
        tweet3.set_id("1111112003")
        tweet3.set_text(
            "3rd Tweet for 2nd profile for test_metric_system. This is random text to create more variation. And now I am writing even more. It will be interesting to see what nltk does with this."
        )
        tweet3.set_post_date("Mar 10, 2022 · 09:30 PM UTC")
        tweet3.set_author("2nd_profile")
        tweet3.set_public_metrics("60", "60", "60", "60")
        content_links = [
            {"text": "@user6", "href": "https://twitter.com/user6"},
            {"text": "#hashtag6", "href": "https://twitter.com/hashtag/hashtag6"},
            {"text": "$cashtag6", "href": "https://twitter.com/cashtag/cashtag6"},
            {"text": "https://example6.com", "href": "https://example6.com"},
        ]
        content_text = "This is a tweet with @user6, #hashtag6, $cashtag6, and a link https://example6.com"
        tweet3.set_entities(content_links, content_text)
        tweet3.set_attachments([""], [""], [""])
        tweet3.set_referenced_tweet("", ReferencedTweetType.NONE)
        return tweet3

    def ReturnP1T1Metrics(self) -> np.array:
        return np.array([10, 10, 10, 10])

    def ReturnProfile1(self) -> Profile:
        profile1 = Profile()
        profile1.set_username("1st_profile")
        profile1.set_name("Test Profile 1")
        profile1.set_created_at("Mar 9, 2024")
        profile1.set_description("Test Profile 1 Description")
        profile1.set_location("Test Profile 1 Location")
        profile1.set_verified(False)
        profile1.set_public_metrics("1000", "2000", "3500", "4500")
        profile1.set_profile_image_url("https://test_profile_1.com")
        profile1.set_url("https://test_profile_1.com")
        return profile1

    def ReturnProfile2(self) -> Profile:
        profile2 = Profile()
        profile2.set_username("2nd_profile")
        profile2.set_name("Test Profile 2")
        profile2.set_created_at("Mar 9, 2024")
        profile2.set_description("Test Profile 2 Description")
        profile2.set_location("Test Profile 2 Location")
        profile2.set_verified(False)
        profile2.set_public_metrics("5500", "6500", "8000", "9000")
        profile2.set_profile_image_url("https://test_profile_2.com")
        profile2.set_url("https://test_profile_2.com")
        return profile2

    def ReturnProfile1Metrics(self) -> np.array:
        return np.array([100, 100, 100, 100])

    def ReturnProfile2Metrics(self) -> np.array:
        return np.array([200, 200, 200, 200])


# Main for testing
if __name__ == "__main__":
    test = TestMetricSystemHelper()
    print(test.ReturnP1Tweet1().get_like_count())
    print(test.ReturnP1Tweet1().get_retweet_count())
    print(test.ReturnP1Tweet1().get_reply_count())
    print(test.ReturnP1Tweet1().get_quote_count())
    print(test.ReturnP1T1Metrics())

    print(test.ReturnProfile1().get_followers_count())
    print(test.ReturnProfile1().get_following_count())
    print(test.ReturnProfile1().get_tweet_count())
    print(test.ReturnProfile1().get_like_count())
    print(test.ReturnProfile1Metrics())

    print(test.ReturnProfile2().get_followers_count())
    print(test.ReturnProfile2().get_following_count())
    print(test.ReturnProfile2().get_tweet_count())
    print(test.ReturnProfile2().get_like_count())
    print(test.ReturnProfile2Metrics())
