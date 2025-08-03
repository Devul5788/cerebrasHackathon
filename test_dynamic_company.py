#!/usr/bin/env python3
"""
Test script to verify that the system correctly identifies and uses
the selling company from the offerings file rather than being hardcoded to Cerebras.
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.append('/home/advaith/cerebrasHackathon/backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
import django
django.setup()

from companies.services.research_service import CompanyResearchService

def test_dynamic_company_detection():
    """Test that the system correctly identifies the selling company"""
    
    service = CompanyResearchService()
    
    # Test 1: Check if the system correctly identifies Harman Kardon from offerings
    selling_company = service.get_selling_company_name()
    print(f"Detected selling company: {selling_company}")
    
    # Test 2: Check the selling context
    selling_context = service._get_selling_context()
    print(f"Detected selling context: {selling_context}")
    
    # Test 3: Load the offerings to see what we're working with
    offerings = service.load_company_offerings()
    product_offerings = service.get_product_offerings_only()
    
    print(f"All data keys: {list(offerings.keys())}")
    print(f"Product offerings only: {list(product_offerings.keys())}")
    
    # Test 4: Verify the company metadata
    company_info = offerings.get('_company_info', {})
    if company_info:
        print(f"\nCompany metadata found:")
        print(f"Name: {company_info.get('name')}")
        print(f"Industry: {company_info.get('industry')}")
        print(f"Description: {company_info.get('description', '')[:100]}...")
    
    # Test 5: Verify the product offerings content
    for offering_name, details in product_offerings.items():
        print(f"\nProduct: {offering_name}")
        print(f"Category: {details.get('Category', 'N/A')}")
        print(f"Description: {details.get('Description', 'N/A')[:100]}...")
    
    # Expected results:
    # - Selling company should be "Harman Kardon" (not "Cerebras")
    # - Selling context should be "automotive audio solutions"
    # - Offerings should contain "Car Audio Systems"
    
    print("\n" + "="*50)
    print("TEST RESULTS:")
    print("="*50)
    
    success = True
    
    if selling_company != "Harman Kardon":
        print(f"❌ FAIL: Expected 'Harman Kardon', got '{selling_company}'")
        success = False
    else:
        print(f"✅ PASS: Correctly identified selling company as '{selling_company}'")
    
    if "automotive" not in selling_context.lower():
        print(f"❌ FAIL: Expected automotive context, got '{selling_context}'")
        success = False
    else:
        print(f"✅ PASS: Correctly identified context as '{selling_context}'")
    
    if "Car Audio Systems" not in product_offerings:
        print(f"❌ FAIL: Expected 'Car Audio Systems' offering not found")
        success = False
    else:
        print(f"✅ PASS: Found 'Car Audio Systems' offering")
    
    # Additional test: Verify company metadata is properly parsed
    company_info = offerings.get('_company_info', {})
    if not company_info or company_info.get('name') != 'Harman Kardon':
        print(f"❌ FAIL: Company metadata not found or incorrect")
        success = False
    else:
        print(f"✅ PASS: Company metadata correctly loaded")
    
    # Test product-only filtering
    if '_company_info' in product_offerings:
        print(f"❌ FAIL: Product offerings should not include metadata")
        success = False
    else:
        print(f"✅ PASS: Product offerings correctly filtered")
    
    if success:
        print("\n🎉 ALL TESTS PASSED! The system is now company-agnostic!")
    else:
        print("\n❌ SOME TESTS FAILED! The system may still be hardcoded.")
    
    return success

if __name__ == "__main__":
    test_dynamic_company_detection()
