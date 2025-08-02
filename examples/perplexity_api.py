#!/usr/bin/env python3

import requests
import json
from typing import Dict, List, Optional
import os

api_key = os.environ.get("PERPLEXITY_API_KEY")

def main():
    """
    Main application function.
    """
    print("============================")
    print("Company Information Generator")
    print("============================")
    
    company_name = input("Enter a company name: ")
    
  
    if not api_key:
        print("Please set the PERPLEXITY_API_KEY environment variable.")
        return

    # Set up the API endpoint and headers
    url = "https://api.perplexity.ai/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",  # Replace with your actual API key
        "Content-Type": "application/json"
    }

    # Define the request payload
    prompt = f"Give me the website and a short description for the company '{company_name}'. Respond in JSON with keys 'website' and 'description'."

    payload = {
        "model": "sonar-pro",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    # Make the API call
    response = requests.post(url, headers=headers, json=payload)

    # Print the AI's response
    print(response.json()) # replace with print(response.json()["choices"][0]['message']['content']) for just the content


if __name__ == "__main__":
    main()
