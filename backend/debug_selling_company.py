#!/usr/bin/env python
"""
Debug script to test the selling company functionality
"""
import os
import sys
import django
from pathlib import Path

# Add the current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

# Import services
from companies.services.research_service import CompanyResearchService

def test_selling_company():
    print("=== Testing selling company functionality ===")
    
    # Initialize service
    service = CompanyResearchService()
    
    try:
        # Test get_selling_company_name
        print("1. Testing get_selling_company_name()...")
        selling_company = service.get_selling_company_name()
        print("   Result: '" + selling_company + "'")
        
        # Test _get_selling_context
        print("2. Testing _get_selling_context()...")
        selling_context = service._get_selling_context()
        print("   Result: '" + selling_context + "'")
        
        # Test company offerings loading
        print("3. Testing load_company_offerings()...")
        offerings = service.load_company_offerings()
        if offerings.get('company'):
            print("   Company info found: " + str(offerings['company']))
        else:
            print("   No company info found in offerings")
            
        # Test get_selling_company_info
        print("4. Testing get_selling_company_info()...")
        company_info = service.get_selling_company_info()
        print("   Result: " + str(company_info))
            
        print("\n=== All tests passed ===")
        
    except Exception as e:
        print("ERROR: " + str(e))
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_selling_company()
