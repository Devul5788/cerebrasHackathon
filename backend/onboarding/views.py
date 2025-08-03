from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
# TODO: Import serializers and models

# Create your views here.

class OnboardingAPIView(APIView):
    """
    Base API view for onboarding operations
    """
    pass

class ChatbotView(APIView):
    def post(self, request):
        message = request.data.get('message', '').lower()
        
        # Simple rule-based responses
        if 'hello' in message or 'hi' in message:
            response = "Hi! I'm here to help you find the right companies. What industry are you interested in?"
            suggestions = ["Technology", "Healthcare", "Finance"]
        elif any(word in message for word in ['tech', 'technology']):
            response = "Great choice! Are you interested in startups or enterprise companies?"
            suggestions = ["Startups", "Enterprise", "Both"]
        elif 'startup' in message:
            response = "I can help you find promising tech startups. What's your target market?"
            suggestions = ["B2B", "B2C", "Developer Tools"]
        else:
            response = "Tell me more about what you're looking for."
            suggestions = ["Browse Companies", "Start Over"]

        return Response({
            'message': response,
            'suggestions': suggestions
        })
