from openai import OpenAI
from flask_cors import CORS
from flask import Flask, jsonify, request
from time import sleep
from random import randint
app = Flask(__name__)
api_key =  "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"

# Initialize the OpenAI client with your API key.
client = OpenAI(api_key=api_key)

CORS(app)
CORS(app, resources={r"/*": {"origins": "http://localhost:4200"}})
CORS(app, resources={r"/*": {"origins": "http://127.0.0.`:4200"}})
CORS(app, resources={r"/*": {"origins": "http://73.58.28.154:4200"}})

def get(prompt):
    """
    Generates a response for a given input string (prompt) using OpenAI's API.
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4",  # Adjust the model according to your plan and what's available
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=256,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"An error occurred: {e}")
        return None


@app.route('/', methods=['POST'])
def handle_request():
    if request.method == 'POST':
        # Handle POST request - assuming JSON data is sent
        try:
            
            sleep(8)

            tweet_data = request.json  # Parsing the JSON data sent with the POST request
            # Assuming tweet_data is a dictionary with a key "tweet"
            tweet_content = tweet_data.get("tweet", "No tweet content")

            # Potentially here you can do something with the tweet
            # For example, logging, processing, or calling another function
            # For now, just echoing it back in the response
            gpt_prompt = "Improve my educational tweet. Only respond with the new tweet. Don't change the meaning\n\nTweet: " + tweet_content
            new_tweet = get(gpt_prompt)
            likes = randint(4,8)
            new_likes = likes + randint(2, 6)
            response_data = {"new_tweet": new_tweet, "likes": likes , "improved_likes": new_likes}
            return jsonify(response_data), 200
        except Exception as e:
            # In case of an error during processing the POST request
            error_response = {"error": f"An error occurred: {str(e)}"}
            return jsonify(error_response), 400

if __name__ == '__main__':
    # Here we add host='0.0.0.0' so that the server listens on all public IPs.
    app.run(debug=True, port=5000, host='0.0.0.0')