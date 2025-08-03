import logging
from typing import Optional
from companies.models import Contact
from integrations.services import LinkedInService

logger = logging.getLogger(__name__)


class ContactLinkedInService:
    """
    Service to integrate LinkedIn data with Contact model
    """
    
    def __init__(self):
        self.linkedin_service = LinkedInService()
        
    def update_contact_profile_photo(self, contact: Contact) -> bool:
        """
        Update contact's LinkedIn profile photo URL
        """
        if not contact.linkedin_url:
            logger.info(f"No LinkedIn URL for contact {contact.get_full_name()}")
            return False
            
        try:
            photo_url = self.linkedin_service.get_profile_photo(contact.linkedin_url)
            
            if photo_url:
                contact.linkedin_profile_photo_url = photo_url
                contact.save(update_fields=['linkedin_profile_photo_url'])
                logger.info(f"Updated profile photo for {contact.get_full_name()}")
                return True
            else:
                logger.warning(f"Could not fetch profile photo for {contact.get_full_name()}")
                return False
                
        except Exception as e:
            logger.error(f"Error updating profile photo for {contact.get_full_name()}: {e}")
            return False
    
    def enrich_contact_with_linkedin_data(self, contact: Contact) -> bool:
        """
        Enrich contact with comprehensive LinkedIn data
        """
        if not contact.linkedin_url:
            return False
            
        try:
            profile_data = self.linkedin_service.get_profile_data(contact.linkedin_url)
            
            if not profile_data:
                return False
                
            # Update contact fields with LinkedIn data
            updated_fields = []
            
            if profile_data.get('profile_photo_url'):
                contact.linkedin_profile_photo_url = profile_data['profile_photo_url']
                updated_fields.append('linkedin_profile_photo_url')
            
            if profile_data.get('first_name') and not contact.first_name:
                contact.first_name = profile_data['first_name']
                updated_fields.append('first_name')
                
            if profile_data.get('last_name') and not contact.last_name:
                contact.last_name = profile_data['last_name']
                updated_fields.append('last_name')
                
            if profile_data.get('headline') and not contact.title:
                contact.title = profile_data['headline']
                updated_fields.append('title')
                
            if profile_data.get('industry') and not contact.department:
                contact.department = profile_data['industry']
                updated_fields.append('department')
            
            # Update education and previous companies from LinkedIn
            if profile_data.get('educations'):
                education_list = []
                for edu in profile_data['educations']:
                    school_name = edu.get('schoolName')
                    field_of_study = edu.get('fieldOfStudy')
                    if school_name:
                        education_entry = school_name
                        if field_of_study:
                            education_entry += f" - {field_of_study}"
                        education_list.append(education_entry)
                
                if education_list and not contact.education:
                    contact.education = education_list
                    updated_fields.append('education')
            
            if profile_data.get('positions'):
                companies_list = []
                for position in profile_data['positions']:
                    company_name = position.get('companyName')
                    title = position.get('title')
                    if company_name:
                        company_entry = company_name
                        if title:
                            company_entry += f" ({title})"
                        companies_list.append(company_entry)
                
                if companies_list and not contact.previous_companies:
                    contact.previous_companies = companies_list
                    updated_fields.append('previous_companies')
            
            if updated_fields:
                contact.save(update_fields=updated_fields)
                logger.info(f"Enriched contact {contact.get_full_name()} with LinkedIn data: {updated_fields}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error enriching contact {contact.get_full_name()} with LinkedIn data: {e}")
            return False
    
    def bulk_update_profile_photos(self, contacts_queryset) -> int:
        """
        Bulk update profile photos for multiple contacts
        """
        updated_count = 0
        
        for contact in contacts_queryset.filter(linkedin_url__isnull=False):
            if self.update_contact_profile_photo(contact):
                updated_count += 1
                
        return updated_count
    
    def validate_linkedin_api(self) -> bool:
        """
        Validate if LinkedIn API is properly configured
        """
        return self.linkedin_service.validate_api_key()
