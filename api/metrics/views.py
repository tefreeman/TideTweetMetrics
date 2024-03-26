from bson import json_util
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
import json
from pymongo import MongoClient
from metrics.stats import *
from metrics.random_tweet import *

hostname =  "10.0.0.28"
port = 27017
username = "Admin"
password = "We420?Z4!"

client = MongoClient(hostname, port, username=username, password=password)
db = client['twitter_v2']

def index(request):
    return HttpResponse("Nothing here. Add \"/metric_name\" to the URL to get a metric.")

def getAccountList(request):
    return HttpResponse(json.dumps(get_crawl_list(db)),
            content_type='application/json; charset=utf8')

def getAccount(request, account_username):
    return HttpResponse(json.dumps(get_profiles(db, [account_username])),
            content_type='application/json; charset=utf8')

"""
def getAccounts(request):
    usernames = request.GET.getlist("usernames", None)
    if usernames == []:
        print(get_profiles_averages)
        return HttpResponse(json.dumps(get_profiles_averages(db)),
            content_type='application/json; charset=utf8')
    return HttpResponse(json.dumps(get_profiles_averages(db, usernames)),
        content_type='application/json; charset=utf8')
"""

def getAccountsAllAverage(request):
    return HttpResponse(json.dumps(get_avg_profile_data(db)),
            content_type='application/json; charset=utf8')
    
def test(request, lookback_weeks):
    try:
        weeks = int(lookback_weeks)
    except Exception as e:
        return HttpResponse("Error: " + str(e))
    
    return HttpResponse(json.dumps(get_all_profile_tweet_metrics(db, weeks)),
            content_type='application/json; charset=utf8')
    
def getPostLengthMetric(request):
    return HttpResponse(json.dumps(get_post_length_metric(db=db)),
            content_type='application/json; charset=utf8')
    
def get_random_tweet(request):
    return HttpResponse(json.dumps(get_rand_tweet(db_edu=db, db_non_edu=client["twitter_nonedu"])),
                        content_type='application/json; charset=utf8')
    
def set_random_tweet(request, id, uid, flag):
    return HttpResponse(json.dumps(set_rand_tweet(edu_db=db, db_non_edu=client["twitter_nonedu"], update_db=client["user_responses"], id=id, is_edu_bool=flag, uid=uid)),
                        content_type='application/json; charset=utf8')
    
def get_user_responses_count(request):
    return HttpResponse(json.dumps(get_user_responses_cnt(client["user_responses"])),
                        content_type='application/json; charset=utf8')