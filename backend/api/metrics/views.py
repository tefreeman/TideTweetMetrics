"""
views.py

This module contains Django views for handling HTTP requests related to Twitter metrics and functionalities.

Functions:
    - index: Default view.

Usage:
    - See individual function docstrings for usage examples.
"""

from bson import json_util
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
import json
from pymongo import MongoClient
from config import Config


db = MongoClient(
            Config.db_host(),
            port=Config.db_port(),
            username=Config.db_user(),
            password=Config.db_password(),
        )[Config.db_name()]



def index(request):
    """Default view."""
    return HttpResponse("Nothing here. Add \"/metric_name\" to the URL to get a metric.")

def update_metric(request):
    """Retrieves a list of accounts."""
    return HttpResponse(json.dumps({}), content_type='application/json; charset=utf8')

