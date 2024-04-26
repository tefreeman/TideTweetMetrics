import requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request
from google.oauth2.id_token import fetch_id_token


def upload_metrics(file_path: str, key_path: str):
    # Define the path to your service account key and the function URL (audience)
    service_account_key_path = key_path
    function_url = 'https://us-central1-tidetweetmetrics-a047f.cloudfunctions.net/uploadFile'
    # Load the service account credentials and specify the target audience for the ID token
    credentials = service_account.IDTokenCredentials.from_service_account_file(
        service_account_key_path,
        target_audience=function_url)

    # Obtain a new ID token by making a request to the Google OAuth2 API
    # This will also automatically refresh the token if it is expired
    request = Request()
    credentials.refresh(request)

    # The ID token to authenticate the request
    id_token = credentials.token

    # Prepare the headers with the Authorization field
    headers = {
        'Authorization': f'Bearer {id_token}'
    }

    # Prepare the files dict for multipart encoding upload
    files = {
        'file': ('full_metric_output.json', open(file_path, 'rb'), 'application/json')
    }

    # Send the POST request to your Google Cloud Function
    response = requests.post(function_url, headers=headers, files=files)

    # Close the file to free resources
    files['file'][1].close()

    # Print out the response to see if it was successful
    print(response.status_code)
    print(response.text)
