from backend.middleware.requests.upload_metrics import upload_metrics



# Upload the metric JSON file to Firebase
# The service account key is required to authenticate the request
# The file path is the path to the metric JSON file
upload_metrics(file_path="full_metric_output.json", key_path="D:/ttm_key.json")