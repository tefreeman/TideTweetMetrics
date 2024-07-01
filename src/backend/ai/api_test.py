import requests
import json

url = "http://127.0.0.1:8000/optimize_tweet"
payload = {

            "text": 'Congratulations to "Dr. Westerlund" - Jill defended her dissertation successfully on Tuesday!',
            "author_id": "alabama_cs",
            "created_at": "2024-06-26T06:34:56.000Z",
            "mentions": [],
            "photo_count": 0,
            "video_count": 0 
}

headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, headers=headers, data=json.dumps(payload))

print(response.json())