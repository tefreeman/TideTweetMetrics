from bson import json_util
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
import json
from pymongo import MongoClient

hostname = "73.58.28.154"
port = 27017
username = "Admin"
password = "We420?Z4!"

client = MongoClient(hostname, port, username=username, password=password)
db = client['twitter_v1']

def index(request):
    return HttpResponse("Index page")