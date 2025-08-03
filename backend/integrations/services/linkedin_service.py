import os
import requests
import logging
from typing import Optional, Dict, Any
from urllib.parse import quote

logger = logging.getLogger(__name__)


class LinkedInService:
    """
    Service to interact with LinkedIn API for profile data
    """
    
    def __init__(self):
        self.api_key = os.getenv('LINKEDIN_API_KEY')
        self.base_url = "https://api.linkedin.com/v2"
        
    def get_profile_photo(self, linkedin_url: str) -> Optional[str]:
        """
        Get profile photo URL from LinkedIn profile URL
        """
        if not self.api_key:
            logger.warning("LinkedIn API key not configured")
            return None
            
        if not linkedin_url:
            return None
            
        try:
            # Extract LinkedIn profile ID from URL
            profile_id = self._extract_profile_id(linkedin_url)
            if not profile_id:
                return None
                
            # Make API request to get profile data
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
            
            # Get basic profile info including profile picture
            url = f"{self.base_url}/people/({profile_id})"
            params = {
                'projection': '(id,firstName,lastName,profilePicture(displayImage~:playableStreams))'
            }
            
            response = requests.get(url, headers=headers, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return self._extract_profile_photo_url(data)
            elif response.status_code == 401:
                logger.error("LinkedIn API authentication failed")
                return None
            elif response.status_code == 403:
                logger.error("LinkedIn API access forbidden")
                return None
            else:
                logger.warning(f"LinkedIn API request failed with status {response.status_code}")
                return None
                
        except requests.RequestException as e:
            logger.error(f"LinkedIn API request failed: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in LinkedIn profile photo fetch: {e}")
            return None
    
    def get_profile_data(self, linkedin_url: str) -> Optional[Dict[str, Any]]:
        """
        Get comprehensive profile data from LinkedIn
        """
        if not self.api_key:
            logger.warning("LinkedIn API key not configured")
            return None
            
        if not linkedin_url:
            return None
            
        try:
            profile_id = self._extract_profile_id(linkedin_url)
            if not profile_id:
                return None
                
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
            
            # Get comprehensive profile data
            url = f"{self.base_url}/people/({profile_id})"
            params = {
                'projection': '(id,firstName,lastName,headline,summary,industry,profilePicture(displayImage~:playableStreams),positions,educations)'
            }
            
            response = requests.get(url, headers=headers, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'profile_photo_url': self._extract_profile_photo_url(data),
                    'headline': data.get('headline'),
                    'summary': data.get('summary'),
                    'industry': data.get('industry'),
                    'first_name': data.get('firstName', {}).get('localized', {}).get('en_US'),
                    'last_name': data.get('lastName', {}).get('localized', {}).get('en_US'),
                    'positions': data.get('positions', {}).get('elements', []),
                    'educations': data.get('educations', {}).get('elements', [])
                }
            else:
                logger.warning(f"LinkedIn API request failed with status {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error fetching LinkedIn profile data: {e}")
            return None
    
    def _extract_profile_id(self, linkedin_url: str) -> Optional[str]:
        """
        Extract profile ID from LinkedIn URL
        """
        try:
            # Handle different LinkedIn URL formats
            if '/in/' in linkedin_url:
                # Format: https://www.linkedin.com/in/username/
                profile_part = linkedin_url.split('/in/')[-1]
                profile_id = profile_part.rstrip('/').split('/')[0]
                return profile_id
            elif '/pub/' in linkedin_url:
                # Legacy format: https://www.linkedin.com/pub/name/numbers
                profile_part = linkedin_url.split('/pub/')[-1]
                # Extract the ID part (usually after the name)
                parts = profile_part.split('/')
                if len(parts) >= 3:
                    return f"{parts[1]}/{parts[2]}"
            else:
                logger.warning(f"Unrecognized LinkedIn URL format: {linkedin_url}")
                return None
                
        except Exception as e:
            logger.error(f"Error extracting profile ID from LinkedIn URL: {e}")
            return None
    
    def _extract_profile_photo_url(self, profile_data: Dict[str, Any]) -> Optional[str]:
        """
        Extract profile photo URL from LinkedIn API response
        """
        try:
            profile_picture = profile_data.get('profilePicture', {})
            display_image = profile_picture.get('displayImage~', {})
            
            if 'elements' in display_image and display_image['elements']:
                # Get the highest resolution image
                images = display_image['elements']
                
                # Find the largest image
                largest_image = None
                max_size = 0
                
                for image in images:
                    identifiers = image.get('identifiers', [])
                    if identifiers:
                        # Get image dimensions if available
                        data = image.get('data', {})
                        width = data.get('com.linkedin.digitalmedia.mediaartifact.StillImage', {}).get('storageSize', {}).get('width', 0)
                        height = data.get('com.linkedin.digitalmedia.mediaartifact.StillImage', {}).get('storageSize', {}).get('height', 0)
                        size = width * height
                        
                        if size > max_size:
                            max_size = size
                            largest_image = identifiers[0].get('identifier')
                
                return largest_image
                
        except Exception as e:
            logger.error(f"Error extracting profile photo URL: {e}")
            
        return None
    
    def validate_api_key(self) -> bool:
        """
        Validate LinkedIn API key by making a test request
        """
        if not self.api_key:
            return False
            
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
            
            # Make a simple API call to validate the key
            url = f"{self.base_url}/me"
            response = requests.get(url, headers=headers, timeout=5)
            
            return response.status_code == 200
            
        except Exception as e:
            logger.error(f"LinkedIn API key validation failed: {e}")
            return False
