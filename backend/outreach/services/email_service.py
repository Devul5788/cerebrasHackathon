import json
import logging
from typing import Dict, List, Any, Optional
from django.template import Template, Context
from companies.services.cerebras_service import AIResearchService
from companies.models import Company, Contact
from outreach.models import EmailTemplate, EmailCampaign, EmailDraft

logger = logging.getLogger(__name__)


class EmailGenerationService:
    """
    Service to handle email generation using Cerebras AI
    """
    
    def __init__(self):
        self.cerebras_service = AIResearchService()
        
    def get_company_offerings(self) -> Dict[str, Any]:
        """Load Cerebras company offerings from JSON file"""
        try:
            import os
            offerings_path = os.path.join(
                os.path.dirname(__file__), 
                '..', '..', 'companies', 'company_offerings.json'
            )
            with open(offerings_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load company offerings: {e}")
            return {}
    
    def recommend_cerebras_product(self, company: Company, contact: Contact) -> str:
        """
        Recommend the best Cerebras product for a company/contact
        """
        # If company already has a recommended product, use it
        if company.recommended_cerebras_product:
            return company.recommended_cerebras_product
            
        # Basic recommendation logic based on company characteristics
        if company.ai_ml_usage and 'inference' in company.ai_ml_usage.lower():
            if 'api' in company.ai_ml_usage.lower() or 'developer' in contact.title.lower():
                return 'inference_api'
            else:
                return 'ai_inference'
        elif company.ai_initiatives or company.ml_use_cases:
            if company.employee_count_exact and company.employee_count_exact > 1000:
                return 'condor_galaxy'
            else:
                return 'model_studio'
        elif company.current_ai_infrastructure:
            return 'cs3_system'
        else:
            # Default recommendation for new AI adopters
            return 'inference_api'
    
    def select_best_template(self, product_recommendation: str, contact: Contact) -> Optional[EmailTemplate]:
        """
        Select the best email template based on product recommendation and contact profile
        """
        try:
            # First try to find a template specifically for the recommended product
            template = EmailTemplate.objects.filter(
                offering=product_recommendation,
                is_default=True
            ).first()
            
            if not template:
                # Fallback to any template for the product
                template = EmailTemplate.objects.filter(
                    offering=product_recommendation
                ).first()
                
            if not template:
                # Ultimate fallback to any default template
                template = EmailTemplate.objects.filter(is_default=True).first()
                
            return template
        except Exception as e:
            logger.error(f"Failed to select template: {e}")
            return None
    
    def prepare_personalization_context(self, company: Company, contact: Contact) -> Dict[str, Any]:
        """
        Prepare personalization context for email generation
        """
        context = {
            # Contact information
            'first_name': contact.first_name,
            'last_name': contact.last_name,
            'full_name': contact.get_full_name(),
            'title': contact.title or 'there',
            'company_name': company.name,
            
            # Company information
            'company_description': company.description or '',
            'company_industry': company.industry or '',
            'company_website': company.website or '',
            'employee_count': company.employee_count or '',
            
            # AI/ML context
            'ai_ml_usage': company.ai_ml_usage or '',
            'ai_initiatives': ', '.join(company.ai_initiatives) if company.ai_initiatives else '',
            'ml_use_cases': ', '.join(company.ml_use_cases) if company.ml_use_cases else '',
            
            # Contact specific
            'contact_priority': contact.get_contact_priority_display(),
            'seniority_level': contact.get_seniority_level_display(),
            'technical_background': 'technical' if contact.technical_background else 'business',
            
            # Personalization
            'interests': ', '.join(contact.interests) if contact.interests else '',
            'pain_points': ', '.join(contact.pain_points) if contact.pain_points else '',
            'recent_achievements': ', '.join(contact.recent_achievements) if contact.recent_achievements else '',
        }
        return context
        

    def generate_personalized_email(self,
                                     contact: Contact,
                                     template: EmailTemplate,
                                     company_offerings: Dict[str, Any],
                                     personalization_context: Dict[str, Any],
                                     campaign: EmailCampaign = None) -> Dict[str, str]:
        """
        Generate personalized email content using Cerebras AI
        """
        try:
            # Prepare company data
            company_data = {
                'basic_info': {
                    'name': contact.company.name,
                    'website': contact.company.website,
                    'description': contact.company.description,
                    'industry': contact.company.industry,
                    'employee_count': contact.company.employee_count,
                },
                'ai_ml_info': {
                    'ai_ml_usage': contact.company.ai_ml_usage,
                    'ai_initiatives': contact.company.ai_initiatives,
                    'ml_use_cases': contact.company.ml_use_cases,
                },
                'cerebras_analysis': {
                    'recommended_product': contact.company.recommended_cerebras_product or 'inference_api',
                }
            }
            
            # Prepare contact data
            contact_data = {
                'basic_info': {
                    'first_name': contact.first_name,
                    'last_name': contact.last_name,
                    'full_name': contact.get_full_name(),
                    'title': contact.title,
                    'seniority_level': contact.seniority_level,
                },
                'decision_making': {
                    'decision_maker': contact.decision_maker,
                    'influence_level': contact.influence_level,
                    'technical_background': contact.technical_background,
                },
                'personalization': {
                    'communication_style': contact.communication_style,
                    'interests': contact.interests,
                    'pain_points': contact.pain_points,
                    'recent_achievements': contact.recent_achievements,                }
            }

            # Generate email using Cerebras
            email_content = self.cerebras_service.generate_personalized_email_content(
                company_data=company_data,
                contact_data=contact_data,
                company_offerings=company_offerings,
                sales_rep_name=campaign.created_by if campaign else "Cerebras Team"
            )
            
            # Parse the generated content to extract subject and body
            lines = email_content.strip().split('\n')
            subject_line = "Partnership Opportunity - Cerebras AI Solutions"
            body = email_content
            
            # Try to extract subject line if it's in the expected format
            for i, line in enumerate(lines):
                if line.startswith('Subject:'):
                    subject_line = line.replace('Subject:', '').strip()
                    # Join the remaining lines as the body
                    body = '\n'.join(lines[i+1:]).strip()
                    break
            
            return {
                'subject_line': subject_line,
                'body': body
            }

        except Exception as e:
            logger.error(f"Failed to generate personalized email: {e}")
            # Fallback to template-based generation
            return self._fallback_template_generation(template, personalization_context, campaign)
            return self._fallback_template_generation(template, personalization_context, campaign)

    def _fallback_template_generation(self, template: EmailTemplate, context: Dict[str, Any], campaign: EmailCampaign = None) -> Dict[str, str]:
        """
        Fallback method using Django template system
        """
        try:
            # Use Django template system for basic substitution
            subject_template = Template(template.subject_line)
            content_template = Template(template.content)

            django_context = Context(context)

            return {
                'subject_line': subject_template.render(django_context),
                'body': content_template.render(django_context)
            }
        except Exception as e:
            logger.error(f"Fallback template generation failed: {e}")
            sales_rep_name = campaign.created_by if campaign else "Cerebras Team"
            return {
                'subject_line': f"Partnership Opportunity - {context.get('company_name', 'Your Company')}",
                'body': f"Hi {context.get('first_name', 'there')},\n\nI'd love to discuss how Cerebras can help {context.get('company_name', 'your company')} with AI acceleration.\n\nBest regards,\n{sales_rep_name}\nCerebras Systems"
            }
    
    def create_email_draft(self, 
                          contact: Contact, 
                          campaign: EmailCampaign, 
                          template: EmailTemplate = None) -> EmailDraft:
        """
        Create an email draft for a contact in a campaign
        """
        try:
            # Get product recommendation
            product_recommendation = self.recommend_cerebras_product(contact.company, contact)
            
            # Select template if not provided
            if not template:
                template = self.select_best_template(product_recommendation, contact)
                
            if not template:
                raise ValueError("No suitable template found")
            
            # Prepare personalization context
            personalization_context = self.prepare_personalization_context(contact.company, contact)
            
            # Load company offerings
            company_offerings = self.get_company_offerings()
            # Generate personalized email
            email_content = self.generate_personalized_email(
                contact=contact,
                template=template,
                company_offerings=company_offerings,
                personalization_context=personalization_context,
                campaign=campaign
            )
            
            # Create draft
            draft = EmailDraft.objects.create(
                contact=contact,
                campaign=campaign,
                template=template,
                subject_line=email_content['subject_line'],
                content=email_content['body'],
                status='generated',
                personalization_data=personalization_context,
                recommended_offering=product_recommendation
            )
            
            return draft
            
        except Exception as e:
            logger.error(f"Failed to create email draft: {e}")
            raise
    
    def bulk_create_drafts(self, contact_ids: List[int], campaign: EmailCampaign) -> List[EmailDraft]:
        """
        Create email drafts for multiple contacts in bulk
        """
        drafts = []
        errors = []
        
        for contact_id in contact_ids:
            try:
                contact = Contact.objects.get(id=contact_id)
                draft = self.create_email_draft(contact, campaign)
                drafts.append(draft)
            except Exception as e:
                logger.error(f"Failed to create draft for contact {contact_id}: {e}")
                errors.append({'contact_id': contact_id, 'error': str(e)})
        
        return drafts, errors
