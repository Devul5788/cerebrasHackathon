from rest_framework.views import APIView
from rest_framework.response import Response
from common.utils import ask_perplexity
import json

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
            try:
                company_data = json.loads(result['choices'][0]['message']['content'])
                company_data['logo_url'] = f"http://www.google.com/s2/favicons?domain={company_data['website'].split('//')[-1].split('/')[0]}&sz=64"
                if company_data.get('found'):
                    return Response({
                        'message': (
                            "I found this information:\n"
                            f"Website: {company_data.get('website', 'N/A')}\n"
                            f"Description: {company_data.get('description', 'N/A')}\n\n"
                            "Is this correct?"
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
            
            result = ask_perplexity(research_prompt, context=open('samples/chatbot_output.json').read())
            try:
                product_suggestions = json.loads(result['choices'][0]['message']['content'])
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
            selected_products = request.data.get('selected_products', [])
            
            # Store both company and product data
            print("DEBUG: Company profile and products submitted:", {
                **company_data,
                'products': selected_products
            })
            
            return Response({
                'message': "Great! Your company and product profiles have been saved. You can now close this window.",
                'suggestions': [],
                'step': 'complete'
            })

        return Response({
            'message': "Please enter your company website:",
            'suggestions': [],
            'step': 'manual_entry'
        })
