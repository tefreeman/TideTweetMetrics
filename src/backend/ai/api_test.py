import requests
import json

url = "http://127.0.0.1:8000/optimize_tweet"
payload =  { 'data': {

            "text": "So sad to hear about Kaiden's passing. He was one of the Elementary student participants in our recent robotics contest and wearing the shirt from the event in the photo below (CS Super Hero). @alabama_cs @bamaengineering",
            "author_id": "alabama_cs",
            "created_at": "2023-06-26T06:34:56.000Z",
            "photo_count": 0,
            "video_count": 0 
}
}
headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, headers=headers, data=json.dumps(payload))

print(response.json())