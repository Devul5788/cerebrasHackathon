from django.urls import path
from . import views

app_name = 'onboarding'

urlpatterns = [
    path('chat/', views.ChatbotView.as_view(), name='chat'),
]
