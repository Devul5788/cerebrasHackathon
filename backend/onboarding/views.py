from rest_framework.views import APIView
from rest_framework.response import Response
from common.utils import ask_perplexity
import json
import os
from datetime import datetime

def save_company_offerings(company_data):
    """
    Save company and product data to company_offerings.json in the format similar to chatbot_output.json
    """
    try:
        # Define the path for the company offerings file (relative to backend directory)
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        file_path = os.path.join(backend_dir, 'companies', 'company_offerings.json')
        
        # Load existing data if file exists
        existing_data = {}
        # if os.path.exists(file_path):
        #     try:
        #         with open(file_path, 'r', encoding='utf-8') as f:
        #             existing_data = json.load(f)
        #     except (json.JSONDecodeError, FileNotFoundError):
        #         existing_data = {}
        
        # Format the new company data
        company_name = company_data.get('name', 'Unknown Company')
        products = company_data.get('products', [])
        
        # Add company metadata to the file
        company_metadata = {
            "company": {
                "name": company_name,
                "website": company_data.get('website', ''),
                "description": company_data.get('description', ''),
                "industry": company_data.get('industry', ''),
                "location": company_data.get('location', ''),
                "employees": company_data.get('employees', ''),
                "founded": company_data.get('founded', ''),
                "updated_at": datetime.now().isoformat()
            }
        }
        
        # Convert products to the format matching chatbot_output.json
        formatted_products = {}
        for product in products:
            product_name = product.get('name', 'Unknown Product')
            formatted_products[product_name] = {
                "Category": product.get('category', ''),
                "Description": product.get('description', ''),
                "Key Features": product.get('key_features', []),
                "Usecase": product.get('use_cases', []),
                "Current Customers": product.get('current_customers', [])
            }
        
        # Combine company metadata with products
        existing_data = company_metadata
        
        # Add products section
        if formatted_products:
            existing_data["products"] = formatted_products
        else:
            # If no products, create a basic company entry
            existing_data["products"] = {
                company_name: {
                    "Category": company_data.get('industry', 'General Business'),
                    "Description": company_data.get('description', ''),
                    "Key Features": [],
                    "Usecase": [],
                    "Current Customers": []
                }
            }
        
        # Save the updated data back to the file
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, indent=2, ensure_ascii=False)
        
        print(f"Company offerings saved to {file_path}")
        return True
        
    except Exception as e:
        print(f"Error saving company offerings: {str(e)}")
        return False

class ChatbotView(APIView):
    def post(self, request):
        message = request.data.get('message', '').lower()
        step = request.data.get('step', 'initial')
        
        if step == 'initial':
            return Response({
                'message': "Hi! I can help research your company or you can enter the details manually. What's your company name?",
                'suggestions': [],
                'step': 'company_search'
            })
            
        elif step == 'company_search':
            research_prompt = f"""Research this company: {message}
            If found, return only this JSON: {{
                "found": true,
                "name": "{message}, formatted correctly with correct suffixes (e.g., Inc., Ltd.)",
                "website": "url",
                "description": "brief description",
                "industry": "industry type",
                "location": "headquarters location",
                "employees": "approximate number",
                "founded": "year",
            }}
            If not found, return only: {{"found": false}}"""
            
            result = ask_perplexity(research_prompt, context="")
            print("DEBUG: Perplexity result:", result)
            try:
                company_data = json.loads(result["content"])
                company_data['logo_url'] = f"http://www.google.com/s2/favicons?domain={company_data['website'].split('//')[-1].split('/')[0]}&sz=64"
                if company_data.get('found'):
                    return Response({
                        'message': (
                            "I found some information about this company. Is this correct?"
                        ),
                        'suggestions': ['Yes', "No, I'll enter manually"],
                        'step': 'product_suggestions',
                        'company_data': company_data
                    })
                else:
                    return Response({
                        'message': "I couldn't find your company. Please enter your company website:",
                        'suggestions': [],
                        'step': 'manual_entry'
                    })
            except Exception as e:
                return Response({
                    'message': "Please enter your company website:",
                    'suggestions': [],
                    'step': 'manual_entry'
                })
            
        elif step == 'product_suggestions':
            company_data = request.data.get('company_data')
            research_prompt = f"""Based on this company information:
            Name: {company_data.get('name')}
            Description: {company_data.get('description')}
            Industry: {company_data.get('industry')}
            
            List their main products/services in this JSON format:
            {{
                "suggested_products": [
                    {{
                        "name": "Product Name",
                        "category": "Product Category",
                        "description": "Brief description",
                        "key_features": ["feature 1", "feature 2"],
                        "use_cases": ["use case 1", "use case 2"],
                        "current_customers": ["customer 1", "customer 2"]
                    }}
                ]
            }}"""
            
            result = ask_perplexity(research_prompt, context=open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'samples', 'chatbot_output.json')).read())
            try:
                # Handle both possible response formats from ask_perplexity
                if isinstance(result, dict):
                    if 'content' in result:
                        content = result['content']
                    elif 'choices' in result:
                        content = result['choices'][0]['message']['content']
                    else:
                        raise Exception("Unexpected response format")
                else:
                    content = result
                
                product_suggestions = json.loads(content)
                return Response({
                    'message': "I found these products/services. Please select which ones apply to your company:",
                    'suggestions': [],
                    'step': 'product_selection',
                    'product_suggestions': product_suggestions['suggested_products']
                })
            except Exception as e:
                return Response({
                    'message': "Let's add your products manually. What's your main product or service?",
                    'suggestions': [],
                    'step': 'manual_product_entry'
                })

        elif step == 'done':
            # Update to include products
            company_data = request.data.get('company_data')
            
            # Store both company and product data
            print("DEBUG: Company profile and products submitted:", company_data)
            
            # Save to company_offerings.json file
            save_success = save_company_offerings(company_data)
            
            if save_success:
                message = "Great! Your company and product profiles have been saved to the database. You can now close this window."
            else:
                message = "Your company profile has been processed, but there was an issue saving to the database. Please contact support."
            
            return Response({
                'message': message,
                'suggestions': [],
                'step': 'complete'
            })

        return Response({
            'message': "Please enter your company website:",
            'suggestions': [],
            'step': 'manual_entry'
        })
