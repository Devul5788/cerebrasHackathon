from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from datetime import datetime, timedelta
import json
import logging

from companies.models import Contact, Company
from .models import EmailTemplate, EmailCampaign, EmailDraft
from .services.email_service import EmailGenerationService

logger = logging.getLogger(__name__)


class EmailTemplateListCreateView(APIView):
    """
    API view to list and create email templates
    """
    
    def get(self, request):
        """List all email templates"""
        try:
            templates = EmailTemplate.objects.all()
            template_data = []
            for template in templates:
                template_data.append({
                    'id': template.id,
                    'name': template.name,
                    'offering': template.offering,
                    'offering_display': template.get_offering_display(),
                    'template_type': template.template_type,
                    'is_default': template.is_default,
                    'description': template.description,
                    'subject_line': template.subject_line,
                    'content': template.content,
                    'created_at': template.created_at.isoformat(),
                    'placeholder_variables': template.get_placeholder_variables()
                })
            
            return Response({
                'success': True,
                'templates': template_data
            })
            
        except Exception as e:
            logger.error(f"Failed to list templates: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def post(self, request):
        """Create a new email template"""
        try:
            data = request.data
            
            template = EmailTemplate.objects.create(
                name=data.get('name'),
                content=data.get('content'),
                offering=data.get('offering'),
                template_type=data.get('template_type', 'initial'),
                is_default=data.get('is_default', False),
                description=data.get('description', ''),
                subject_line=data.get('subject_line'),
                created_by=data.get('created_by', 'system')
            )
            
            return Response({
                'success': True,
                'template': {
                    'id': template.id,
                    'name': template.name,
                    'offering': template.offering,
                    'offering_display': template.get_offering_display(),
                    'template_type': template.template_type,
                    'is_default': template.is_default,
                    'description': template.description,
                    'subject_line': template.subject_line,
                    'content': template.content,
                    'created_at': template.created_at.isoformat()
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to create template: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class EmailTemplateDetailView(APIView):
    """
    API view to get, update, or delete a specific email template
    """
    
    def get(self, request, template_id):
        """Get a specific template"""
        try:
            template = get_object_or_404(EmailTemplate, id=template_id)
            return Response({
                'success': True,
                'template': {
                    'id': template.id,
                    'name': template.name,
                    'offering': template.offering,
                    'offering_display': template.get_offering_display(),
                    'template_type': template.template_type,
                    'is_default': template.is_default,
                    'description': template.description,
                    'subject_line': template.subject_line,
                    'content': template.content,
                    'created_at': template.created_at.isoformat(),
                    'placeholder_variables': template.get_placeholder_variables()
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to get template: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, template_id):
        """Update a template"""
        try:
            template = get_object_or_404(EmailTemplate, id=template_id)
            data = request.data
            template.name = data.get('name', template.name)
            template.content = data.get('content', template.content)
            template.offering = data.get('offering', template.offering)
            template.template_type = data.get('template_type', template.template_type)
            template.is_default = data.get('is_default', template.is_default)
            template.description = data.get('description', template.description)
            template.subject_line = data.get('subject_line', template.subject_line)
            template.save()
            return Response({
                'success': True,
                'template': {
                    'id': template.id,
                    'name': template.name,
                    'offering': template.offering,
                    'offering_display': template.get_offering_display(),
                    'template_type': template.template_type,
                    'is_default': template.is_default,
                    'description': template.description,
                    'subject_line': template.subject_line,
                    'content': template.content,
                    'updated_at': template.updated_at.isoformat()
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to update template: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, template_id):
        """Delete a template"""
        try:
            template = get_object_or_404(EmailTemplate, id=template_id)
            template.delete()
            
            return Response({
                'success': True,
                'message': 'Template deleted successfully'
            })
            
        except Exception as e:
            logger.error(f"Failed to delete template: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class EmailCampaignListCreateView(APIView):
    """
    API view to list and create email campaigns
    """
    
    def get(self, request):
        """List all campaigns"""
        try:
            campaigns = EmailCampaign.objects.all()
            campaign_data = []
            
            for campaign in campaigns:
                campaign_data.append({
                    'id': campaign.id,
                    'name': campaign.name,
                    'description': campaign.description,
                    'created_by': campaign.created_by,
                    'created_at': campaign.created_at.isoformat(),
                    'is_active': campaign.is_active,
                    'total_contacts': campaign.get_total_contacts(),
                    'sent_count': campaign.get_sent_count(),
                    'pending_count': campaign.get_pending_count()
                })
            
            return Response({
                'success': True,
                'campaigns': campaign_data
            })
            
        except Exception as e:
            logger.error(f"Failed to list campaigns: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Create a new campaign"""
        try:
            data = request.data
            
            campaign = EmailCampaign.objects.create(
                name=data.get('name'),
                description=data.get('description', ''),
                created_by=data.get('created_by', 'system')
            )
            
            return Response({
                'success': True,
                'campaign': {
                    'id': campaign.id,
                    'name': campaign.name,
                    'description': campaign.description,
                    'created_by': campaign.created_by,
                    'created_at': campaign.created_at.isoformat(),
                    'is_active': campaign.is_active
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to create campaign: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class EmailCampaignDetailView(APIView):
    """
    API view to get, update, or delete a specific email campaign
    """
    
    def get(self, request, campaign_id):
        """Get a specific campaign"""
        try:
            campaign = get_object_or_404(EmailCampaign, id=campaign_id)
            
            return Response({
                'success': True,
                'campaign': {
                    'id': campaign.id,
                    'name': campaign.name,
                    'description': campaign.description,
                    'created_by': campaign.created_by,
                    'created_at': campaign.created_at.isoformat(),
                    'is_active': campaign.is_active,
                    'total_contacts': campaign.get_total_contacts(),
                    'sent_count': campaign.get_sent_count(),
                    'pending_count': campaign.get_pending_count()
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to get campaign: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, campaign_id):
        """Update a campaign"""
        try:
            campaign = get_object_or_404(EmailCampaign, id=campaign_id)
            data = request.data
            
            campaign.name = data.get('name', campaign.name)
            campaign.description = data.get('description', campaign.description)
            campaign.is_active = data.get('is_active', campaign.is_active)
            campaign.save()
            
            return Response({
                'success': True,
                'campaign': {
                    'id': campaign.id,
                    'name': campaign.name,
                    'description': campaign.description,
                    'created_by': campaign.created_by,
                    'created_at': campaign.created_at.isoformat(),
                    'is_active': campaign.is_active,
                    'total_contacts': campaign.get_total_contacts(),
                    'sent_count': campaign.get_sent_count(),
                    'pending_count': campaign.get_pending_count()
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to update campaign: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, campaign_id):
        """Delete a campaign"""
        try:
            campaign = get_object_or_404(EmailCampaign, id=campaign_id)
            campaign.delete()
            
            return Response({
                'success': True,
                'message': 'Campaign deleted successfully'
            })
            
        except Exception as e:
            logger.error(f"Failed to delete campaign: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ContactSelectionView(APIView):
    """
    API view to get contacts for selection in email campaigns
    """
    
    def get(self, request):
        """Get all contacts with their company information"""
        try:
            # Get query parameters for filtering
            company_id = request.GET.get('company_id')
            priority = request.GET.get('priority')
            seniority = request.GET.get('seniority')
            
            contacts = Contact.objects.select_related('company').all()
            
            # Apply filters
            if company_id:
                contacts = contacts.filter(company_id=company_id)
            if priority:
                contacts = contacts.filter(contact_priority=priority)
            if seniority:
                contacts = contacts.filter(seniority_level=seniority)
            
            contact_data = []
            for contact in contacts:
                contact_data.append({
                    'id': contact.id,
                    'first_name': contact.first_name,
                    'last_name': contact.last_name,
                    'full_name': contact.get_full_name(),
                    'title': contact.title,
                    'email': contact.email,
                    'seniority_level': contact.seniority_level,
                    'seniority_display': contact.get_seniority_level_display(),
                    'contact_priority': contact.contact_priority,
                    'priority_display': contact.get_contact_priority_display(),
                    'decision_maker': contact.decision_maker,
                    'technical_background': contact.technical_background,
                    'influence_level': contact.influence_level,
                    'company': {
                        'id': contact.company.id,
                        'name': contact.company.name,
                        'industry': contact.company.industry,
                        'employee_count': contact.company.employee_count,
                        'recommended_product': contact.company.recommended_cerebras_product
                    },
                    'personalization_score': contact.get_personalization_score(),
                    'last_contacted': contact.last_contacted.isoformat() if contact.last_contacted else None
                })
            
            return Response({
                'success': True,
                'contacts': contact_data
            })
            
        except Exception as e:
            logger.error(f"Failed to get contacts: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EmailDraftGenerationView(APIView):
    """
    API view to generate email drafts for selected contacts
    """
    
    def post(self, request):
        """Generate email drafts for selected contacts"""
        try:
            data = request.data
            campaign_id = data.get('campaign_id')
            contact_ids = data.get('contact_ids', [])
            
            if not campaign_id or not contact_ids:
                return Response({
                    'success': False,
                    'error': 'Campaign ID and contact IDs are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            campaign = get_object_or_404(EmailCampaign, id=campaign_id)
            email_service = EmailGenerationService()
            
            with transaction.atomic():
                drafts, errors = email_service.bulk_create_drafts(contact_ids, campaign)
            
            # Prepare response data
            draft_data = []
            for draft in drafts:
                draft_data.append({
                    'id': draft.id,
                    'contact': {
                        'id': draft.contact.id,
                        'full_name': draft.contact.get_full_name(),
                        'title': draft.contact.title,
                        'company_name': draft.contact.company.name
                    },
                    'subject_line': draft.subject_line,
                    'content': draft.content,
                    'status': draft.status,
                    'recommended_offering': draft.recommended_offering,
                    'personalization_score': draft.get_personalization_score(),
                    'template': {
                        'id': draft.template.id,
                        'name': draft.template.name
                    }
                })
            
            return Response({
                'success': True,
                'drafts': draft_data,
                'errors': errors,
                'generated_count': len(drafts),
                'error_count': len(errors)
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to generate drafts: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EmailDraftListView(APIView):
    """
    API view to list email drafts for a campaign
    """
    
    def get(self, request, campaign_id):
        """Get all drafts for a campaign"""
        try:
            campaign = get_object_or_404(EmailCampaign, id=campaign_id)
            drafts = EmailDraft.objects.filter(campaign=campaign).select_related('contact', 'template', 'contact__company')
            
            draft_data = []
            for draft in drafts:
                draft_data.append({
                    'id': draft.id,
                    'contact': {
                        'id': draft.contact.id,
                        'full_name': draft.contact.get_full_name(),
                        'title': draft.contact.title,
                        'email': draft.contact.email,
                        'company_name': draft.contact.company.name
                    },
                    'subject_line': draft.subject_line,
                    'content': draft.content,
                    'status': draft.status,
                    'status_display': draft.get_status_display(),
                    'recommended_offering': draft.recommended_offering,
                    'personalization_score': draft.get_personalization_score(),                    'template': {
                        'id': draft.template.id,
                        'name': draft.template.name,
                        'offering_display': draft.template.get_offering_display()
                    },
                    'sent_date': draft.sent_date.isoformat() if draft.sent_date else None,
                    'follow_up_date': draft.follow_up_date.isoformat() if draft.follow_up_date else None,
                    'follow_up_scheduled': draft.follow_up_scheduled,
                    'follow_up_template': {
                        'id': draft.follow_up_template.id,
                        'name': draft.follow_up_template.name
                    } if draft.follow_up_template else None,
                    'follow_up_sent': draft.follow_up_sent,
                    'created_at': draft.created_at.isoformat()
                })
            
            return Response({
                'success': True,
                'campaign': {
                    'id': campaign.id,
                    'name': campaign.name,
                    'description': campaign.description
                },
                'drafts': draft_data
            })
            
        except Exception as e:
            logger.error(f"Failed to get drafts: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EmailDraftDetailView(APIView):
    """
    API view to get, update, or send a specific email draft
    """
    
    def get(self, request, draft_id):
        """Get a specific draft"""
        try:
            draft = get_object_or_404(EmailDraft, id=draft_id)
            
            return Response({
                'success': True,
                'draft': {
                    'id': draft.id,
                    'contact': {
                        'id': draft.contact.id,
                        'full_name': draft.contact.get_full_name(),
                        'title': draft.contact.title,
                        'email': draft.contact.email,
                        'company_name': draft.contact.company.name
                    },
                    'campaign': {
                        'id': draft.campaign.id,
                        'name': draft.campaign.name
                    },
                    'template': {
                        'id': draft.template.id,
                        'name': draft.template.name,
                        'offering_display': draft.template.get_offering_display()
                    },
                    'subject_line': draft.subject_line,
                    'content': draft.content,
                    'status': draft.status,
                    'status_display': draft.get_status_display(),
                    'recommended_offering': draft.recommended_offering,
                    'personalization_data': draft.personalization_data,
                    'personalization_score': draft.get_personalization_score(),
                    'sent_date': draft.sent_date.isoformat() if draft.sent_date else None,
                    'follow_up_date': draft.follow_up_date.isoformat() if draft.follow_up_date else None,
                    'created_at': draft.created_at.isoformat()
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to get draft: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, draft_id):
        """Update a draft"""
        try:
            draft = get_object_or_404(EmailDraft, id=draft_id)
            data = request.data
            
            draft.subject_line = data.get('subject_line', draft.subject_line)
            draft.content = data.get('content', draft.content)
            draft.status = data.get('status', draft.status)
            draft.save()
            
            return Response({
                'success': True,
                'message': 'Draft updated successfully',
                'draft': {
                    'id': draft.id,
                    'subject_line': draft.subject_line,
                    'content': draft.content,
                    'status': draft.status,
                    'updated_at': draft.updated_at.isoformat()
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to update draft: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class EmailSendView(APIView):
    """
    API view to simulate sending emails
    """
    
    def post(self, request, draft_id):
        """Send an email (simulated)"""
        try:
            draft = get_object_or_404(EmailDraft, id=draft_id)
            
            if draft.status == 'sent':
                return Response({
                    'success': False,
                    'error': 'Email has already been sent'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Simulate sending
            draft.mark_as_sent()
            
            # Update contact's last contacted date
            draft.contact.last_contacted = timezone.now()
            draft.contact.save()
            return Response({
                'success': True,
                'message': f'Email sent successfully to {draft.contact.get_full_name()}',
                'draft': {
                    'id': draft.id,
                    'status': draft.status,
                    'sent_date': draft.sent_date.isoformat(),
                    'follow_up_date': draft.follow_up_date.isoformat(),
                    'follow_up_scheduled': draft.follow_up_scheduled,
                    'follow_up_template': {
                        'id': draft.follow_up_template.id,
                        'name': draft.follow_up_template.name
                    } if draft.follow_up_template else None
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EmailSendBulkView(APIView):
    """
    API view to send multiple emails at once
    """
    
    def post(self, request):
        """Send multiple emails (simulated)"""
        try:
            data = request.data
            draft_ids = data.get('draft_ids', [])
            
            if not draft_ids:
                return Response({
                    'success': False,
                    'error': 'Draft IDs are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            sent_drafts = []
            errors = []
            
            with transaction.atomic():
                for draft_id in draft_ids:
                    try:
                        draft = EmailDraft.objects.get(id=draft_id)
                        
                        if draft.status == 'sent':
                            errors.append({
                                'draft_id': draft_id,
                                'error': 'Email already sent'
                            })
                            continue
                        
                        # Simulate sending
                        draft.mark_as_sent()
                        
                        # Update contact's last contacted date
                        draft.contact.last_contacted = timezone.now()
                        draft.contact.save()
                        
                        sent_drafts.append({
                            'draft_id': draft.id,
                            'contact_name': draft.contact.get_full_name(),
                            'company_name': draft.contact.company.name,
                            'sent_date': draft.sent_date.isoformat()
                        })
                        
                    except EmailDraft.DoesNotExist:
                        errors.append({
                            'draft_id': draft_id,
                            'error': 'Draft not found'
                        })
                    except Exception as e:
                        errors.append({
                            'draft_id': draft_id,
                            'error': str(e)
                        })
            
            return Response({
                'success': True,
                'message': f'Successfully sent {len(sent_drafts)} emails',
                'sent_drafts': sent_drafts,
                'errors': errors,
                'sent_count': len(sent_drafts),
                'error_count': len(errors)
            })
            
        except Exception as e:
            logger.error(f"Failed to send bulk emails: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
