#!/usr/bin/env python3
"""
Test script for LinkedIn API integration
"""
import os
import sys
import django

# Add backend to Python path
sys.path.append('/home/advaith/cerebrasHackathon/backend')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

from integrations.services.linkedin_service import LinkedInService
from companies.services.linkedin_integration import ContactLinkedInService

def test_linkedin_api():
    """Test LinkedIn API functionality"""
    print("🔗 Testing LinkedIn API Integration...")
    
    linkedin_service = LinkedInService()
    contact_service = ContactLinkedInService()
    
    # Test API key validation
    print("\n1. Testing LinkedIn API key validation...")
    is_valid = linkedin_service.validate_api_key()
    print(f"   LinkedIn API Key Valid: {'✅' if is_valid else '❌'}")
    
    if not is_valid:
        print("   Note: LinkedIn API key may not be configured or might be a test key")
        print("   Expected for development/testing environments")
    
    # Test profile photo extraction with a sample LinkedIn URL
    print("\n2. Testing profile photo extraction...")
    sample_linkedin_url = "https://www.linkedin.com/in/sample-profile/"
    
    try:
        photo_url = linkedin_service.get_profile_photo(sample_linkedin_url)
        if photo_url:
            print(f"   ✅ Successfully extracted photo URL: {photo_url}")
        else:
            print("   ℹ️  No photo URL returned (expected for non-existent profile)")
    except Exception as e:
        print(f"   ⚠️  Error during photo extraction: {e}")
    
    # Test service integration
    print("\n3. Testing LinkedIn service integration...")
    integration_valid = contact_service.validate_linkedin_api()
    print(f"   Integration Service Valid: {'✅' if integration_valid else '❌'}")
    
    print("\n🎯 LinkedIn Integration Test Complete!")
    print("\nNext steps:")
    print("1. Configure a valid LinkedIn API key in backend/common/.env")
    print("2. Test with real LinkedIn profile URLs")
    print("3. Use the UI to update contact profile photos")

if __name__ == "__main__":
    test_linkedin_api()
