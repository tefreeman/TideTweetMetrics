from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("accountlist", views.getAccountList, name="getAccountList"),
    path("accounts/<str:account_username>", views.getAccount, name="getAccount")
]