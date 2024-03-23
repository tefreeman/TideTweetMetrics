from bson import json_util
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
import json
from pymongo import MongoClient
from metrics.stats import *

hostname = "73.58.28.154"
port = 27017
username = "Admin"
password = "We420?Z4!"

client = MongoClient(hostname, port, username=username, password=password)
db = client['twitter_v1']

def index(request):
    return HttpResponse("Nothing here. Add \"/metric_name\" to the URL to get a metric.")

def getAccountList(request):
    return HttpResponse(json.dumps(get_crawl_list(db)),
            content_type='application/json; charset=utf8')

def getAccount(request, account_username):
    return HttpResponse(json.dumps(get_profile_info(db, account_username)),
            content_type='application/json; charset=utf8')

def getAccounts(request):
    usernames = request.GET.getlist("usernames", None)
    if usernames == []:
        print(get_profiles_averages)
        return HttpResponse(json.dumps(get_profiles_averages(db)),
            content_type='application/json; charset=utf8')
    return HttpResponse(json.dumps(get_profiles_averages(db, usernames)),
        content_type='application/json; charset=utf8')