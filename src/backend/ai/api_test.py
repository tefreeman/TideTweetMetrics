import requests
import json

url = "https://us-central1-tidetweetmetrics-a047f.cloudfunctions.net/optimizeTweet"
payload = {

            "text": "Congratulations @Chris_Crawford_on becoming the rank of Associate Professor!",
            "author_id": "alabama_cs",
            "created_at": "2024-06-26T06:34:56.000Z",
            "mentions": [],
            "photo_count": 1,
            "video_count": 0 
}

headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, headers=headers, data=json.dumps(payload))

print(response.json())