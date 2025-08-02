from django.db import models
from django.contrib.auth.models import User

# TODO: Implement OnboardingStep model

class OnboardingStep(models.Model):
    """
    Model to track user onboarding progress
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    current_step = models.CharField(max_length=50, default='company_search')
    completed_steps = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'onboarding_steps'
