from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import os
import requests
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from dotenv import load_dotenv

load_dotenv()


@api_view(['GET'])
def hello_world(request):
    """
    Simple hello world endpoint
    """
    return Response({
        'message': 'Hello from Django backend!',
        'status': 'success',
        'timestamp': '2025-08-02'
    })


@api_view(['GET'])
def api_status(request):
    """
    API status endpoint
    """
    return Response({
        'status': 'online',
        'version': '1.0.0',
        'message': 'CerebrasApp API is running successfully'
    })


@api_view(['GET', 'POST'])
def sample_data(request):
    """
    Sample data endpoint that returns mock data
    """
    if request.method == 'GET':
        sample_items = [
            {
                'id': 1,
                'title': 'Fast Performance',
                'description': 'Built with modern technologies for lightning-fast performance',
                'icon': 'lightning'
            },
            {
                'id': 2,
                'title': 'Reliable',
                'description': 'Robust architecture with TypeScript and Django',
                'icon': 'check'
            },
            {
                'id': 3,
                'title': 'User Friendly',
                'description': 'Beautiful, responsive design for all devices',
                'icon': 'heart'
            }
        ]
        return Response({
            'data': sample_items,
            'count': len(sample_items),
            'status': 'success'
        })

    elif request.method == 'POST':
        # Handle POST request (e.g., creating new data)
        data = request.data
        return Response({
            'message': 'Data received successfully',
            'received_data': data,
            'status': 'created'
        }, status=status.HTTP_201_CREATED)


@csrf_exempt
def company_profile(request):
    if request.method == "POST":
        print("[DEBUG] Received company profile request")
        data = json.loads(request.body)
        company_name = data.get("company_name")
        print(f"[DEBUG] Company name: {company_name}")
        if not company_name:
            return JsonResponse({"error": "No company name provided"}, status=400)
        api_key = os.environ.get("PERPLEXITY_API_KEY")
        if not api_key:
            return JsonResponse({"error": "API key not set"}, status=500)
        print(f"[DEBUG] Using API key: {api_key}")
        prompt = f"Give me the website and a short description for the company '{company_name}'. Respond in JSON with keys 'website' and 'description'."
        print(api_key == "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", "[DEBUG] API key check" + api_key)
        payload = {
            "model": "sonar-pro",
            "messages": [{"role": "user", "content": prompt}]
        }
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        print(f"[DEBUG] Sending request to Perplexity API with payload: {payload}")
        r = requests.post("https://api.perplexity.ai/chat/completions", headers=headers, json=payload)
        print(r.status_code, r.text)
        try:
            content = r.json()["choices"][0]["message"]["content"]
            result = json.loads(content)
            return JsonResponse(result)
        except Exception:
            return JsonResponse({"error": "Could not parse company info"}, status=500)
    return JsonResponse({"error": "Invalid method"}, status=405)
