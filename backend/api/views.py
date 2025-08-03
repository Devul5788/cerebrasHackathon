from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


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
        'message': 'NexLead API is running successfully'
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
