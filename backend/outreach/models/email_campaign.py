from django.db import models
from companies.models import Contact
from .email_template import EmailTemplate


class EmailCampaign(models.Model):
    """
    Model to store email campaign information
    """
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_by = models.CharField(max_length=100, blank=True, null=True)  # Could be foreign key to User model
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Campaign settings
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'email_campaigns'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.name} - {self.created_at.strftime('%Y-%m-%d')}"
        
    def get_total_contacts(self):
        """Get total number of contacts in this campaign"""
        return self.drafts.count()
        
    def get_sent_count(self):
        """Get number of emails sent in this campaign"""
        return self.drafts.filter(status='sent').count()
        
    def get_pending_count(self):
        """Get number of emails pending in this campaign"""
        return self.drafts.filter(status='draft').count()


class EmailDraft(models.Model):
    """
    Model to store individual email drafts for campaigns
    """
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='email_drafts')
    campaign = models.ForeignKey(EmailCampaign, on_delete=models.CASCADE, related_name='drafts')
    template = models.ForeignKey(EmailTemplate, on_delete=models.CASCADE, related_name='drafts')
    
    # Email content
    subject_line = models.CharField(max_length=255)
    content = models.TextField()
    
    # Status tracking
    status = models.CharField(
        max_length=20,
        choices=[
            ('draft', 'Draft'),
            ('generated', 'Generated'),
            ('reviewed', 'Reviewed'),
            ('sent', 'Sent'),
            ('failed', 'Failed'),
        ],
        default='draft'
    )
    # Scheduling and follow-up
    scheduled_send_date = models.DateTimeField(blank=True, null=True)
    sent_date = models.DateTimeField(blank=True, null=True)
    follow_up_date = models.DateTimeField(blank=True, null=True)
    follow_up_scheduled = models.BooleanField(default=False, help_text="Whether a follow-up email is scheduled")
    follow_up_template = models.ForeignKey(EmailTemplate, on_delete=models.SET_NULL, null=True, blank=True, 
                                         related_name='follow_up_drafts', help_text="Template to use for follow-up")
    follow_up_sent = models.BooleanField(default=False, help_text="Whether the follow-up has been sent")
    
    # Personalization data used
    personalization_data = models.JSONField(default=dict, blank=True, null=True)
    recommended_offering = models.CharField(max_length=100, blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'email_drafts'
        ordering = ['-created_at']
        unique_together = ['contact', 'campaign']  # One draft per contact per campaign        
    def __str__(self):
        return f"Draft for {self.contact.get_full_name()} - {self.campaign.name}"
        
    def mark_as_sent(self):
        """Mark this draft as sent and set follow-up date"""
        from datetime import datetime, timedelta
        self.status = 'sent'
        self.sent_date = datetime.now()
        self.follow_up_date = datetime.now() + timedelta(days=7)  # Follow-up in 1 week
        
        # Automatically schedule follow-up if a follow-up template exists for this offering
        try:
            follow_up_template = EmailTemplate.objects.filter(
                offering=self.template.offering,
                template_type='follow_up',
                is_default=True
            ).first()
            
            if follow_up_template:
                self.follow_up_scheduled = True
                self.follow_up_template = follow_up_template
        except EmailTemplate.DoesNotExist:
            pass
            
        self.save()
        
    def get_personalization_score(self):
        """Calculate personalization score based on available data"""
        if not self.personalization_data:
            return 0
            
        score = 0
        # Add points for each piece of personalization data used
        for key, value in self.personalization_data.items():
            if value:
                score += 10
                
        return min(score, 100)  # Max 100%
