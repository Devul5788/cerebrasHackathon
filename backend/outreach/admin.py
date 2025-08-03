from django.contrib import admin
from .models import EmailTemplate, EmailCampaign, EmailDraft


@admin.register(EmailTemplate)
class EmailTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'offering', 'is_default', 'created_at']
    list_filter = ['offering', 'is_default', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'offering', 'is_default', 'description')
        }),
        ('Email Content', {
            'fields': ('subject_line', 'content')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(EmailCampaign)
class EmailCampaignAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_by', 'created_at', 'is_active', 'get_total_contacts', 'get_sent_count']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_total_contacts(self, obj):
        return obj.get_total_contacts()
    get_total_contacts.short_description = 'Total Contacts'
    
    def get_sent_count(self, obj):
        return obj.get_sent_count()
    get_sent_count.short_description = 'Emails Sent'


@admin.register(EmailDraft)
class EmailDraftAdmin(admin.ModelAdmin):
    list_display = ['contact', 'campaign', 'status', 'recommended_offering', 'created_at', 'sent_date']
    list_filter = ['status', 'recommended_offering', 'created_at', 'sent_date']
    search_fields = ['contact__first_name', 'contact__last_name', 'contact__company__name']
    readonly_fields = ['created_at', 'updated_at', 'personalization_data']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('contact', 'campaign', 'template', 'status')
        }),
        ('Email Content', {
            'fields': ('subject_line', 'content')
        }),
        ('Scheduling', {
            'fields': ('scheduled_send_date', 'sent_date', 'follow_up_date')
        }),
        ('Analytics', {
            'fields': ('recommended_offering', 'personalization_data'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
