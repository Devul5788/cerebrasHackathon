import os
import requests
import json
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class PerplexityAPI:
    def __init__(self):
        self.api_key = os.getenv('AI_API_KEY')
        self.base_url = 'https://api.perplexity.ai/chat/completions'
        
    def get_company_info(self, company_name):
        """
        Get company information using Perplexity AI
        """
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': 'llama-3-sonar-large-32k-online',
            'messages': [
                {
                    'role': 'system',
                    'content': 'You are a business research assistant. Provide concise, accurate information about companies.'
                },
                {
                    'role': 'user',
                    'content': f'Provide detailed information about {company_name} in JSON format with the following fields: name, industry, size (number of employees), description, website. If you cannot find specific information, use "Unknown" as the value.'
                }
            ]
        }
        
        try:
            response = requests.post(self.base_url, headers=headers, json=payload)
            response.raise_for_status()
            
            # Extract the JSON response from Perplexity
            result = response.json()
            content = result['choices'][0]['message']['content']
            
            # Try to parse the JSON from the response
            try:
                company_info = json.loads(content)
                return company_info
            except json.JSONDecodeError:
                # If JSON parsing fails, try to extract information manually
                return self._extract_company_info(content, company_name)
                
        except requests.exceptions.RequestException as e:
            print(f"Error calling Perplexity API: {e}")
            return None
            
    def _extract_company_info(self, content, company_name):
        """
        Extract company information from text response
        """
        # This is a simplified extraction - in a real implementation,
        # you would want more sophisticated parsing
        return {
            'name': company_name,
            'industry': 'Technology',  # Default value
            'size': 'Unknown',
            'description': content,
            'website': 'Unknown'
        }
        
    def generate_customer_companies(self, user_company, product_info):
        """
        Generate a list of potential customer companies based on user company and product
        """
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        product_description = product_info.get('description', '')
        target_industries = ', '.join(product_info.get('targetIndustries', []))
        
        payload = {
            'model': 'llama-3-sonar-large-32k-online',
            'messages': [
                {
                    'role': 'system',
                    'content': 'You are a business development assistant. Generate a list of potential customer companies.'
                },
                {
                    'role': 'user',
                    'content': f'Generate a list of 10 potential customer companies for {user_company["name"]} which sells {product_description}. Target industries include: {target_industries}. Return the result as a JSON array with each company having: name, industry, size, description, website, and fitReason fields.'
                }
            ]
        }
        
        try:
            response = requests.post(self.base_url, headers=headers, json=payload)
            response.raise_for_status()
            
            # Extract the JSON response from Perplexity
            result = response.json()
            content = result['choices'][0]['message']['content']
            
            # Try to parse the JSON from the response
            try:
                customer_companies = json.loads(content)
                return customer_companies
            except json.JSONDecodeError:
                # If JSON parsing fails, return an empty array
                return []
                
        except requests.exceptions.RequestException as e:
            print(f"Error calling Perplexity API: {e}")
            return []

# Command line interface
if __name__ == "__main__":
    # Initialize the API
    perplexity = PerplexityAPI()
    
    if len(sys.argv) < 2:
        print("Usage: python perplexity_api.py [company|customers] [arguments]")
        sys.exit(1)
        
    command = sys.argv[1]
    
    if command == "company":
        if len(sys.argv) < 3:
            print("Please provide a company name")
            sys.exit(1)
            
        company_name = sys.argv[2]
        company_info = perplexity.get_company_info(company_name)
        
        if company_info:
            print(json.dumps(company_info))
        else:
            print(json.dumps({"error": "Failed to get company information"}))
            
    elif command == "customers":
        if len(sys.argv) < 3:
            print("Please provide user company and product information as JSON")
            sys.exit(1)
            
        try:
            input_data = json.loads(sys.argv[2])
            user_company = input_data.get('userCompany', {})
            product_info = input_data.get('productInfo', {})
            
            customer_companies = perplexity.generate_customer_companies(user_company, product_info)
            print(json.dumps(customer_companies))
        except json.JSONDecodeError:
            print(json.dumps({"error": "Invalid JSON input"}))
    else:
        print("Unknown command. Use 'company' or 'customers'")
        sys.exit(1)
