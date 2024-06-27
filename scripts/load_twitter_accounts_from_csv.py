import csv
from pymongo import MongoClient
from backend.config import Config




# CSV file path
csv_file_path = "PATH_TO_TWITTER_ACCOUNTS_CSV_FILE"

# Connect to MongoDB

Config.init()
client = MongoClient(
    Config.db_host(),
    port=Config.db_port(),
    username=Config.db_user(),
    password=Config.db_password(),
    )
db_name = Config.db_name()
db = client[db_name]
collection = db["crawl_accounts"]
# Read the CSV file and insert data into MongoDB
with open(csv_file_path, "r") as file:
    csv_reader = csv.DictReader(file)
    for row in csv_reader:
        username = row["username"]
        password = row["pass"]
        
        
        # Create a document to insert into MongoDB
        document = {
            "username": username,
            "password": password,
            "total_tweets_viewed": 0,
            "is_working": True

        }
        
        if collection.find_one({"username": username}):
            print(f"Account {username} already exists in the database")
            continue
        # Insert the document into the collection
        collection.insert_one(document)

print("Data inserted into MongoDB successfully!")