from django.db import models
from .company import Company


class Report(models.Model):
    """
    Model to store generated customer reports with edit capability
    """
    REPORT_TYPES = [
        ('company', 'Company Report'),
        ('comprehensive', 'Comprehensive Report'),
    ]
    
    # Report identification
    title = models.CharField(max_length=255)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES, default='company')
    
    # Content
    content = models.TextField(help_text="Report content in Markdown format")
    metadata = models.JSONField(default=dict, blank=True, help_text="Additional report metadata")
    
    # Relationships
    company = models.ForeignKey(
        Company, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='reports',
        help_text="Company this report is for (null for comprehensive reports)"
    )
    
    # Generation info
    generated_at = models.DateTimeField(auto_now_add=True)
    last_edited_at = models.DateTimeField(auto_now=True)
    is_edited = models.BooleanField(default=False, help_text="Whether the report has been manually edited")
    # Status
    is_archived = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'reports'
        ordering = ['-generated_at']
        constraints = [
            models.UniqueConstraint(
                fields=['company', 'report_type'],
                condition=models.Q(is_archived=False, report_type='company'),
                name='unique_company_report'
            )
        ]
        
    def __str__(self):
        if self.company:
            return f"{self.title} - {self.company.name}"
        return f"{self.title} - Comprehensive"
        
    def mark_as_edited(self):
        """Mark report as manually edited and save all changes"""
        self.is_edited = True
        self.save()  # Save all fields, not just specific ones
