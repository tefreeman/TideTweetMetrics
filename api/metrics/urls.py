from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("accountlist", views.getAccountList, name="getAccountList"),
    path("accounts", views.getAccounts, name="getAccounts"),
    path("accounts/<str:account_username>", views.getAccount, name="getAccount"),
    path("accounts_all", views.getAccountsAllAverage, name="getAccountsAllAverages"),
]