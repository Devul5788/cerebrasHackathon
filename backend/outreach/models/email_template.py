from django.db import models


class EmailTemplate(models.Model):
    """
    Model to store email templates for outreach campaigns
    """
    name = models.CharField(max_length=255, unique=True)
    content = models.TextField(help_text="Template content with placeholders like {first_name}, {company_name}, etc.")
    offering = models.CharField(
        max_length=100,
        choices=[
            ('cs3_system', 'Cerebras CS-3 System'),
            ('condor_galaxy', 'Cerebras Condor Galaxy'),
            ('ai_inference', 'Cerebras AI Inference Solution'),
            ('inference_api', 'Cerebras Inference API'),
            ('model_studio', 'Cerebras AI Model Studio'),
            ('datacenter_rental', 'Cerebras Datacenter Rental'),
        ],
        help_text="Which Cerebras offering this template is designed for"
    )
    template_type = models.CharField(
        max_length=20,
        choices=[
            ('initial', 'Initial Outreach'),
            ('follow_up', 'Follow-up'),
        ],
        default='initial',
        help_text="Whether this is an initial outreach or follow-up template"
    )
    is_default = models.BooleanField(default=False, help_text="Whether this is a default system template")
    description = models.TextField(blank=True, null=True, help_text="Description of when to use this template")
    subject_line = models.CharField(max_length=255, help_text="Email subject line template")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.CharField(max_length=100, blank=True, null=True)  # Could be foreign key to User model
    
    class Meta:
        db_table = 'email_templates'
        ordering = ['offering', 'name']
        
    def __str__(self):
        return f"{self.name} ({self.get_offering_display()})"
        
    def get_placeholder_variables(self):
        """
        Extract placeholder variables from the template content
        Returns a list of variables found in {variable} format
        """
        import re
        return re.findall(r'\{(\w+)\}', self.content + " " + self.subject_line)
