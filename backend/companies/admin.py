from django.contrib import admin
from .models import Company, Contact, Report


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'industry', 'employee_count', 'ipo_status', 
        'cerebras_fit_score', 'outreach_priority', 'research_quality_score'
    ]
    list_filter = [
        'outreach_priority', 'ipo_status', 'industry', 
        'cerebras_fit_score', 'research_quality_score'
    ]
    search_fields = ['name', 'industry', 'description']
    readonly_fields = ['created_at', 'updated_at', 'research_last_updated']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'website', 'description', 'industry', 'sector')
        }),
        ('Company Size & Location', {
            'fields': ('employee_count', 'employee_count_exact', 'headquarters_location', 'founded_year')
        }),
        ('Financial Information', {
            'fields': ('ipo_status', 'stock_symbol', 'market_cap', 'last_funding_round', 
                      'last_funding_amount', 'last_funding_date', 'total_funding', 'valuation', 
                      'revenue', 'revenue_growth'),
            'classes': ('collapse',)
        }),
        ('Business Intelligence', {
            'fields': ('business_model', 'key_products', 'key_technologies', 'competitors'),
            'classes': ('collapse',)
        }),
        ('AI/ML Information', {
            'fields': ('ai_ml_usage', 'current_ai_infrastructure', 'ai_initiatives', 
                      'ml_use_cases', 'data_science_team_size')
        }),
        ('Cerebras Analysis', {
            'fields': ('recommended_cerebras_product', 'cerebras_fit_score', 
                      'cerebras_value_proposition', 'potential_use_cases', 
                      'implementation_timeline', 'estimated_budget_range')
        }),
        ('Outreach Management', {
            'fields': ('outreach_priority', 'contact_attempted', 'last_contact_date')
        }),
        ('Research Metadata', {
            'fields': ('research_quality_score', 'research_sources', 'research_notes', 
                      'research_last_updated'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = [
        'get_full_name', 'company', 'title', 'contact_priority', 
        'seniority_level', 'decision_maker', 'research_quality_score'
    ]
    list_filter = [
        'contact_priority', 'seniority_level', 'decision_maker', 
        'influence_level', 'technical_background', 'company__industry'
    ]
    search_fields = ['first_name', 'last_name', 'email', 'title', 'company__name']
    readonly_fields = ['created_at', 'updated_at', 'research_last_updated']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('company', 'first_name', 'last_name', 'full_name', 
                      'title', 'department', 'seniority_level')
        }),
        ('Contact Information', {
            'fields': ('email', 'phone', 'linkedin_url', 'linkedin_profile_photo_url', 'twitter_handle')
        }),
        ('Professional Background', {
            'fields': ('tenure_at_company', 'previous_companies', 'education', 'certifications'),
            'classes': ('collapse',)
        }),
        ('Decision Making Profile', {
            'fields': ('decision_maker', 'influence_level', 'budget_authority', 'technical_background')
        }),
        ('AI/ML Profile', {
            'fields': ('ai_ml_experience', 'ai_ml_interests', 'published_papers', 'conference_speaking'),
            'classes': ('collapse',)
        }),
        ('Personalization Data', {
            'fields': ('communication_style', 'interests', 'pain_points', 'recent_achievements'),
            'classes': ('collapse',)
        }),
        ('Outreach Management', {
            'fields': ('contact_priority', 'preferred_contact_method', 'last_contacted', 'response_rate')
        }),
        ('Research Metadata', {
            'fields': ('research_quality_score', 'data_sources', 'research_last_updated'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    get_full_name.short_description = 'Name'


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'report_type', 'company', 'is_edited', 
        'generated_at', 'last_edited_at'
    ]
    list_filter = [
        'report_type', 'is_edited', 'is_archived', 'generated_at'
    ]
    search_fields = ['title', 'company__name', 'content']
    readonly_fields = ['generated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'report_type', 'company')
        }),
        ('Content', {
            'fields': ('content', 'metadata')
        }),
        ('Status', {
            'fields': ('is_edited', 'is_archived')
        }),
        ('Timestamps', {
            'fields': ('generated_at', 'last_edited_at'),
            'classes': ('collapse',)
        })
    )
    
    def save_model(self, request, obj, form, change):
        if change and 'content' in form.changed_data:
            obj.mark_as_edited()
        else:
            super().save_model(request, obj, form, change)
