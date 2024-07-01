import requests
import json

url = "http://127.0.0.1:8000/predict"
payload = {
    "tweets": [
        {
            "text": 'Congratulations to "Dr. Westerlund" - Jill defended her dissertation successfully on Tuesday! #AcademicAchievement #PhDLife #FutureLeader',
            "author_id": "alabama_cs",
            "created_at": "2024-06-26T06:34:56.000Z",
            "entities": {"hashtags": ["#AcademicAchievement", "#PhDLife", "#FutureLeader"], "mentions": [], "urls": []},
            "attachments": {"photos": [], "videos": []}
        }
    ]
}

headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, headers=headers, data=json.dumps(payload))

print(response.json())