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
                "logo_url": "direct URL to the company's logo image (website favicon), scraped from their official website."
            }}
            If not found, return only: {{"found": false}}"""
            
            result = ask_perplexity(research_prompt, context="")
            try:
                company_data = json.loads(result['choices'][0]['message']['content'])
                
                if company_data.get('found'):
                    return Response({
                        'message': (
                            "I found this information:\n"
                            f"Website: {company_data.get('website', 'N/A')}\n"
                            f"Description: {company_data.get('description', 'N/A')}\n\n"
                            "Is this correct?"
                        ),
                        'suggestions': ['Yes', "No, I'll enter manually"],
                        'step': 'final',
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
            
        elif step == 'done':
            # Store the company data in the database or process it further
            company_data = request.data.get('company_data')
            print("DEBUG: Company profile submitted:", company_data)  # Debug print
            return Response({
                'message': "Great! Your company profile has been saved. You can now close this window.",
                'suggestions': [],
                'step': 'complete',
                'company_data': company_data
            })

        return Response({
            'message': "Please enter your company website:",
            'suggestions': [],
            'step': 'manual_entry'
        })
