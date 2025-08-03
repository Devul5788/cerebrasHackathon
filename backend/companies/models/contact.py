from django.db import models
from django.core.validators import EmailValidator
from companies.models import Company


class Contact(models.Model):
    """
    Model to store key contact information for companies
    """
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='contacts')
    
    # Basic Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    
    # Professional Information
    title = models.CharField(max_length=255, blank=True, null=True)
    department = models.CharField(max_length=255, blank=True, null=True)
    seniority_level = models.CharField(
        max_length=20,
        choices=[
            ('c_level', 'C-Level'),
            ('vp', 'Vice President'),
            ('director', 'Director'),
            ('manager', 'Manager'),
            ('senior', 'Senior'),
            ('mid', 'Mid-Level'),
            ('junior', 'Junior'),
            ('other', 'Other')
        ],
        blank=True, null=True
    )
    
    # Contact Information
    email = models.EmailField(validators=[EmailValidator()], blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    twitter_handle = models.CharField(max_length=50, blank=True, null=True)
    # Professional Background
    tenure_at_company = models.CharField(max_length=50, blank=True, null=True)  # e.g., "2 years"
    previous_companies = models.JSONField(default=list, blank=True, null=True)
    education = models.JSONField(default=list, blank=True, null=True)
    certifications = models.JSONField(default=list, blank=True, null=True)
    
    # Decision Making Profile
    decision_maker = models.BooleanField(default=False)
    influence_level = models.CharField(
        max_length=20,
        choices=[
            ('high', 'High'),
            ('medium', 'Medium'), 
            ('low', 'Low'),
            ('unknown', 'Unknown')
        ],
        default='unknown'
    )
    budget_authority = models.BooleanField(default=False)
    technical_background = models.BooleanField(default=False)
    # AI/ML Specific
    ai_ml_experience = models.TextField(blank=True, null=True)
    ai_ml_interests = models.JSONField(default=list, blank=True, null=True)
    published_papers = models.JSONField(default=list, blank=True, null=True)
    conference_speaking = models.JSONField(default=list, blank=True, null=True)
    # Personalization Data for Outreach
    communication_style = models.CharField(
        max_length=20,
        choices=[
            ('technical', 'Technical'),
            ('business', 'Business-focused'),
            ('mixed', 'Mixed'),
            ('unknown', 'Unknown')
        ],
        default='unknown'
    )
    interests = models.JSONField(default=list, blank=True, null=True)
    pain_points = models.JSONField(default=list, blank=True, null=True)
    recent_achievements = models.JSONField(default=list, blank=True, null=True)
    
    # Outreach Tracking
    contact_priority = models.CharField(
        max_length=20,
        choices=[
            ('primary', 'Primary Contact'),
            ('secondary', 'Secondary Contact'),
            ('tertiary', 'Tertiary Contact')
        ],
        default='secondary'
    )
    last_contacted = models.DateTimeField(blank=True, null=True)
    response_rate = models.FloatField(default=0.0)  # Percentage
    preferred_contact_method = models.CharField(
        max_length=20,
        choices=[
            ('email', 'Email'),
            ('linkedin', 'LinkedIn'),
            ('phone', 'Phone'),
            ('unknown', 'Unknown')
        ],
        default='email'
    )
    # Research Metadata
    research_last_updated = models.DateTimeField(auto_now_add=True)
    research_quality_score = models.IntegerField(default=0)  # 1-10 scale
    data_sources = models.JSONField(default=list, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'contacts'
        ordering = ['contact_priority', '-influence_level', 'last_name', 'first_name']
        unique_together = ['company', 'email']  # Prevent duplicate emails per company
        
    def __str__(self):
        return f"{self.get_full_name()} - {self.company.name}"
        
    def get_full_name(self):
        """Return the full name of the contact"""
        if self.full_name:
            return self.full_name
        return f"{self.first_name} {self.last_name}".strip()
        
    def get_title_display(self):
        """Return a clean display of the contact's title"""
        return self.title if self.title else "Unknown Title"
        
    def is_key_decision_maker(self):
        """Determine if this contact is likely a key decision maker"""
        if self.decision_maker:
            return True
            
        key_titles = [
            'cto', 'cio', 'chief technology', 'chief information', 'chief data',
            'vp', 'vice president', 'director', 'head of', 'ai', 'machine learning', 'ml'
        ]
        
        title_lower = (self.title or '').lower()
        return any(keyword in title_lower for keyword in key_titles)
        
    def get_personalization_score(self):
        """Calculate how much personalization data is available"""
        score = 0
        fields_to_check = [
            'ai_ml_experience', 'interests', 'pain_points', 
            'recent_achievements', 'education', 'previous_companies'
        ]
        
        for field in fields_to_check:
            value = getattr(self, field)
            if value:
                if isinstance(value, list) and len(value) > 0:
                    score += 15
                elif isinstance(value, str) and value.strip():
                    score += 15
                    
        return min(score, 100)  # Max 100%
