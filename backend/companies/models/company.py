from django.db import models
from django.core.validators import URLValidator
import json


class Company(models.Model):
    """
    Model to store comprehensive company information gathered from research
    """
    # Basic Information
    name = models.CharField(max_length=255, unique=True)
    website = models.URLField(validators=[URLValidator()], blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    industry = models.CharField(max_length=255, blank=True, null=True)
    sector = models.CharField(max_length=255, blank=True, null=True)
    
    # Size and Employee Information
    employee_count = models.CharField(max_length=50, blank=True, null=True)  # e.g., "1001-5000"
    employee_count_exact = models.IntegerField(blank=True, null=True)
    headquarters_location = models.CharField(max_length=255, blank=True, null=True)
    founded_year = models.IntegerField(blank=True, null=True)
    # Funding and Financial Information
    ipo_status = models.CharField(max_length=50, blank=True, null=True)  # "Public", "Private", "Acquired"
    total_funding = models.CharField(max_length=100, blank=True, null=True)
    valuation = models.CharField(max_length=100, blank=True, null=True)
    
    # Business Intelligence
    revenue = models.CharField(max_length=100, blank=True, null=True)
    revenue_growth = models.CharField(max_length=100, blank=True, null=True)
    business_model = models.TextField(blank=True, null=True)
    key_products = models.JSONField(default=list, blank=True)  # List of product names
    key_technologies = models.JSONField(default=list, blank=True)  # List of technologies used
    competitors = models.JSONField(default=list, blank=True)  # List of competitor names
      # AI/ML Specific Information
    ai_ml_usage = models.TextField(blank=True, null=True)
    current_ai_infrastructure = models.TextField(blank=True, null=True)
    ai_initiatives = models.JSONField(default=list, blank=True)
    ml_use_cases = models.JSONField(default=list, blank=True)
    data_science_team_size = models.CharField(max_length=50, blank=True, null=True)
    
    # AI Inference Specific
    ai_inference_workloads = models.JSONField(default=list, blank=True)  # Types of inference workloads
    inference_models_used = models.JSONField(default=list, blank=True)  # Models they're running inference on
    inference_volume = models.CharField(max_length=100, blank=True, null=True)  # Scale of inference operations
    inference_latency_requirements = models.CharField(max_length=100, blank=True, null=True)  # Real-time, batch, etc.
    current_inference_hardware = models.TextField(blank=True, null=True)  # Current GPU/hardware setup
    inference_pain_points = models.JSONField(default=list, blank=True)  # Performance bottlenecks, cost issues
    inference_budget = models.CharField(max_length=100, blank=True, null=True)  # Budget for inference infrastructure
    
    # Product Fit Analysis
    recommended_cerebras_product = models.CharField(max_length=255, blank=True, null=True)
    cerebras_fit_score = models.IntegerField(blank=True, null=True)  # 1-10 scale
    cerebras_value_proposition = models.TextField(blank=True, null=True)
    potential_use_cases = models.JSONField(default=list, blank=True)
    implementation_timeline = models.CharField(max_length=100, blank=True, null=True)
    estimated_budget_range = models.CharField(max_length=100, blank=True, null=True)
    
    # Research Metadata
    research_last_updated = models.DateTimeField(auto_now_add=True)
    research_quality_score = models.IntegerField(default=0)  # 1-10 scale
    research_sources = models.JSONField(default=list, blank=True)
    research_notes = models.TextField(blank=True, null=True)
    
    # Outreach Status
    outreach_priority = models.CharField(
        max_length=20, 
        choices=[('high', 'High'), ('medium', 'Medium'), ('low', 'Low')], 
        default='medium'
    )
    contact_attempted = models.BooleanField(default=False)
    last_contact_date = models.DateTimeField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'companies'
        ordering = ['-research_quality_score', '-cerebras_fit_score', 'name']
        
    def __str__(self):
        return self.name
        
    def get_product_match(self):
        """Return the most suitable product based on company profile"""
        if self.recommended_cerebras_product:
            return self.recommended_cerebras_product
        return "Not Analyzed"
        
    def get_outreach_readiness(self):
        """Calculate readiness for outreach based on available information"""
        score = 0
        required_fields = [
            'description', 'industry', 'ai_ml_usage', 
            'recommended_cerebras_product', 'cerebras_value_proposition'
        ]
        
        for field in required_fields:
            if getattr(self, field):
                score += 20
                
        return min(score, 100)  # Max 100%
