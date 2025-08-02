from django.urls import path
from . import views

urlpatterns = [
    path('hello/', views.hello_world, name='hello_world'),
    path('status/', views.api_status, name='api_status'),
    path('data/', views.sample_data, name='sample_data'),
    path('company_profile/', views.company_profile, name='company_profile'),
]
