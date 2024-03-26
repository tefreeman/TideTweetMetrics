from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("accountlist", views.getAccountList, name="getAccountList"),
    #path("accounts", views.getAccounts, name="getAccounts"),
    path("accounts/<str:account_username>", views.getAccount, name="getAccount"),
    path("accounts_all", views.getAccountsAllAverage, name="getAccountsAllAverages"),
    path("test/<str:lookback_weeks>", views.test, name="test"),
    path("post_length_metric/", views.getPostLengthMetric, name="getPostLengthMetric"),
    path("get_random_tweet", views.get_random_tweet, name="get_random_tweet"),
    path("set_random_tweet/<str:id>/<str:uid>/<str:flag>", views.set_random_tweet, name="set_random_tweet"),
    path("get_user_responses_count", views.get_user_responses_count, name="get_user_responses_count")
]