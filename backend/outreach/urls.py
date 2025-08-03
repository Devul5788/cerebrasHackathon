from django.urls import path
from . import views

app_name = 'outreach'

urlpatterns = [
    # Email Templates
    path('templates/', views.EmailTemplateListCreateView.as_view(), name='template-list-create'),
    path('templates/<int:template_id>/', views.EmailTemplateDetailView.as_view(), name='template-detail'),
    
    # Email Campaigns
    path('campaigns/', views.EmailCampaignListCreateView.as_view(), name='campaign-list-create'),
    path('campaigns/<int:campaign_id>/', views.EmailCampaignDetailView.as_view(), name='campaign-detail'),
    path('campaigns/<int:campaign_id>/drafts/', views.EmailDraftListView.as_view(), name='campaign-drafts'),
    
    # Contact Selection
    path('contacts/', views.ContactSelectionView.as_view(), name='contact-selection'),
    
    # Email Draft Generation and Management
    path('drafts/generate/', views.EmailDraftGenerationView.as_view(), name='draft-generation'),
    path('drafts/<int:draft_id>/', views.EmailDraftDetailView.as_view(), name='draft-detail'),
    
    # Email Sending
    path('drafts/<int:draft_id>/send/', views.EmailSendView.as_view(), name='email-send'),
    path('send-bulk/', views.EmailSendBulkView.as_view(), name='email-send-bulk'),
]
