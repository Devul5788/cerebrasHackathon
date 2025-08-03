from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
import logging

from .models import Company, Report, Contact
from .services.research_service import CompanyResearchService
from .services.linkedin_integration import ContactLinkedInService

logger = logging.getLogger(__name__)


@api_view(['POST'])
def company_research(request):
    """
    Company Research API Endpoint

    Research companies using Perplexity and Cerebras:
    - Individual company research
    - Batch company research (processed in parallel)
    - Auto-discovery when no company provided (uses company_offerings.json to find N potential customers)

    POST body:
    {
        "company_name": "string" OR
        "company_names": ["string1", "string2", ...] OR
        "max_customers": integer (for auto-discovery from company_offerings.json)
    }

    Returns:
        JsonResponse: Research results with company data and fit scores
    """
    try:
        logger.info("Company research API endpoint called")

        data = request.data
        research_service = CompanyResearchService()

        # Auto-discovery mode - find potential customers from company_offerings.json
        if 'max_customers' in data and not ('company_name' in data or 'company_names' in data):
            max_customers = data['max_customers']
            logger.info(f"Starting auto-discovery for {max_customers} potential customers")

            # Find potential customers using cerebras offerings
            potential_customers = research_service.find_potential_customers(max_customers)

            # Batch research the discovered companies in parallel
            companies = research_service.batch_research_companies_parallel(potential_customers)

            results = []
            for company in companies:
                results.append({
                    'company_id': company.id,
                    'company_name': company.name,
                    'fit_score': company.cerebras_fit_score,
                    'recommended_product': company.recommended_cerebras_product,
                    'outreach_readiness': f"{company.get_outreach_readiness()}%"
                })

            return JsonResponse({
                'success': True,
                'message': f'Successfully discovered and researched {len(companies)} potential customers',
                'auto_discovery': True,
                'results': results
            }, status=201)

        # Single company research
        elif 'company_name' in data:
            company_name = data['company_name']
            logger.info(f"Starting research for company: {company_name}")

            company = research_service.research_and_save_company(company_name)

            return JsonResponse({
                'success': True,
                'message': f'Successfully researched {company_name}',
                'company_id': company.id,
                'company_name': company.name,
                'fit_score': company.cerebras_fit_score,
                'recommended_product': company.recommended_cerebras_product,
                'outreach_readiness': f"{company.get_outreach_readiness()}%"
            }, status=201)

        # Batch company research (processed in parallel)
        elif 'company_names' in data:
            company_names = data['company_names']
            logger.info(f"Starting batch research for {len(company_names)} companies")

            companies = research_service.batch_research_companies_parallel(company_names)

            results = []
            for company in companies:
                results.append({
                    'company_id': company.id,
                    'company_name': company.name,
                    'fit_score': company.cerebras_fit_score,
                    'recommended_product': company.recommended_cerebras_product,
                    'outreach_readiness': f"{company.get_outreach_readiness()}%"
                })

            return JsonResponse({
                'success': True,
                'message': f'Successfully researched {len(companies)} companies',
                'results': results
            }, status=201)

        else:
            return JsonResponse({
                'error': 'Either company_name, company_names, or max_customers must be provided'
            }, status=400)

    except Exception as e:
        logger.error(f"Company research failed: {e}")
        return JsonResponse({
            'error': f'Research failed: {str(e)}'
        }, status=500)


@api_view(['GET'])
def company_list(request):
    """
    Company List API Endpoint

    Get detailed information about every company with filtering options

    Query parameters:
    - priority: high, medium, low
    - min_fit_score: integer 1-10
    - industry: string
    - has_contacts: true/false

    Returns:
        JsonResponse: List of companies with detailed information
    """
    try:
        logger.info("Company list API endpoint called")

        queryset = Company.objects.all()

        # Apply filters
        priority = request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(outreach_priority=priority)

        min_fit_score = request.query_params.get('min_fit_score')
        if min_fit_score:
            queryset = queryset.filter(cerebras_fit_score__gte=int(min_fit_score))

        industry = request.query_params.get('industry')
        if industry:
            queryset = queryset.filter(industry__icontains=industry)

        has_contacts = request.query_params.get('has_contacts')
        if has_contacts == 'true':
            queryset = queryset.filter(contacts__isnull=False).distinct()
        elif has_contacts == 'false':
            queryset = queryset.filter(contacts__isnull=True)

        # Serialize detailed data for every company
        companies_data = []
        for company in queryset:
            contacts_count = company.contacts.count()
            primary_contacts = company.contacts.filter(contact_priority='primary').count()

            # Get contact details
            contacts_data = []
            for contact in company.contacts.all():
                contacts_data.append({
                    'id': contact.id,
                    'name': contact.get_full_name(),
                    'title': contact.title,
                    'email': contact.email,
                    'linkedin_url': contact.linkedin_url,
                    'linkedin_profile_photo_url': contact.linkedin_profile_photo_url,
                    'contact_priority': contact.contact_priority,
                    'seniority_level': contact.seniority_level,
                    'decision_maker': contact.decision_maker,
                    'influence_level': contact.influence_level,
                    'technical_background': contact.technical_background,
                    'ai_ml_experience': contact.ai_ml_experience,
                    'personalization_score': f"{contact.get_personalization_score()}%",
                    'research_quality_score': contact.research_quality_score
                })

            companies_data.append({
                'id': company.id,
                'name': company.name,
                'website': company.website,
                'description': company.description,
                'industry': company.industry,
                'sector': company.sector,
                'headquarters_location': company.headquarters_location,
                'founded_year': company.founded_year,
                'employee_count': company.employee_count,
                'employee_count_exact': company.employee_count_exact,

                # Financial info
                'ipo_status': company.ipo_status,
                'total_funding': company.total_funding,
                'revenue': company.revenue,

                # Business intelligence
                'business_model': company.business_model,
                'key_products': company.key_products,
                'key_technologies': company.key_technologies,
                'competitors': company.competitors,

                # AI/ML info
                'ai_ml_usage': company.ai_ml_usage,
                'current_ai_infrastructure': company.current_ai_infrastructure,
                'ai_initiatives': company.ai_initiatives,
                'ml_use_cases': company.ml_use_cases,
                'data_science_team_size': company.data_science_team_size,

                # Cerebras analysis
                'recommended_cerebras_product': company.recommended_cerebras_product,
                'cerebras_fit_score': company.cerebras_fit_score,
                'cerebras_value_proposition': company.cerebras_value_proposition,
                'potential_use_cases': company.potential_use_cases,
                'implementation_timeline': company.implementation_timeline,
                'estimated_budget_range': company.estimated_budget_range,

                # Metadata
                'outreach_priority': company.outreach_priority,
                'outreach_readiness': f"{company.get_outreach_readiness()}%",
                'research_quality_score': company.research_quality_score,
                'research_sources': company.research_sources,
                'created_at': company.created_at.isoformat(),
                'updated_at': company.updated_at.isoformat(),

                # Contact summary
                'contacts_count': contacts_count,
                'primary_contacts_count': primary_contacts,

                # Full contact details
                'contacts': contacts_data
            })

        return JsonResponse({
            'success': True,
            'count': len(companies_data),
            'companies': companies_data
        })

    except Exception as e:
        logger.error(f"Failed to list companies: {e}")
        return JsonResponse({
            'error': f'Failed to list companies: {str(e)}'
        }, status=500)


@api_view(['POST'])
def customer_report(request):
    """
    Customer Report API Endpoint

    Uses Cerebras inference to combine relevant information from company_offerings.json
    and customer data to create a comprehensive customer report

    POST body:
    {
        "company_id": integer (optional - if not provided, generates report for all companies)
    }    Returns:
        JsonResponse: Generated customer report with recommendations
    """
    try:
        logger.info("Customer report API endpoint called")

        data = request.data
        research_service = CompanyResearchService()

        company_id = data.get('company_id')

        if company_id:            # Generate report for specific company
            company = get_object_or_404(Company, id=company_id)
            report_data = research_service.generate_customer_report(company)
            
            # Extract just the markdown content from the report data
            if isinstance(report_data, dict) and 'report_content' in report_data:
                report_content = report_data['report_content']
                comprehensive_data = report_data.get('comprehensive_data', {})
                metadata_from_report = report_data.get('metadata', {})
            else:
                # Fallback if format is different
                report_content = str(report_data)
                comprehensive_data = {}
                metadata_from_report = {}
            
            # Get or create report for this company (update existing if present)
            report, created = Report.objects.get_or_create(
                company=company,
                report_type='company',
                is_archived=False,
                defaults={
                    'title': f"Customer Analysis Report - {company.name}",
                    'content': report_content,  # Store only the markdown content
                    'metadata': {
                        'generated_by': 'cerebras_ai',
                        'company_fit_score': company.cerebras_fit_score,
                        'recommended_product': company.recommended_cerebras_product,
                        'comprehensive_data': comprehensive_data,
                        **metadata_from_report
                    }
                }
            )
            
            # If report already existed, update it with new content
            if not created:
                report.content = report_content  # Store only the markdown content
                report.metadata = {
                    'generated_by': 'cerebras_ai',
                    'company_fit_score': company.cerebras_fit_score,
                    'recommended_product': company.recommended_cerebras_product,
                    'updated_at': timezone.now().isoformat(),
                    'comprehensive_data': comprehensive_data,
                    **metadata_from_report
                }
                report.is_edited = False  # Reset edited flag since it's regenerated
                report.save()
              
            return JsonResponse({
                'success': True,
                'company_id': company.id,
                'company_name': company.name,
                'report': report_content,
                'report_id': report.id
            })
        else:            # Generate report for all companies
            companies = Company.objects.all()
            reports = research_service.generate_comprehensive_customer_report(companies)
            
            # Save comprehensive report to database
            report = Report.objects.create(
                title="Comprehensive Customer Analysis Report",
                report_type='comprehensive',
                content=reports if isinstance(reports, str) else str(reports),
                company=None,  # No specific company for comprehensive reports
                metadata={
                    'generated_by': 'cerebras_ai',
                    'total_companies': len(companies),
                    'generation_date': timezone.now().isoformat(),
                }
            )
            
            return JsonResponse({
                'success': True,
                'total_companies': len(companies),
                'comprehensive_report': reports,
                'report_id': report.id
            })

    except Exception as e:
        logger.error(f"Failed to generate customer report: {e}")
        return JsonResponse({
            'error': f'Failed to generate customer report: {str(e)}'
        }, status=500)


@api_view(['DELETE'])
def company_delete(request, company_id):
    """
    Company Delete API Endpoint
    
    DELETE /api/companies/{id}/
    
    Deletes a company and all associated data
    """
    try:
        logger.info(f"Company delete API endpoint called for ID: {company_id}")
        
        company = get_object_or_404(Company, id=company_id)
        company_name = company.name
        
        # Delete the company (cascade will handle related records)
        company.delete()
        
        return JsonResponse({
            'success': True,
            'message': f'Successfully deleted company: {company_name}'
        })
        
    except Exception as e:
        logger.error(f"Failed to delete company {company_id}: {e}")
        return JsonResponse({
            'error': f'Failed to delete company: {str(e)}'
        }, status=500)


@api_view(['GET'])
def reports_list(request):
    """
    Reports List API Endpoint
    
    GET /api/companies/reports/
    
    List all reports with optional filtering
    
    Query parameters:
    - report_type: company, comprehensive
    - company_id: filter by company
    - is_edited: true/false
    """
    try:
        logger.info("Reports list API endpoint called")
        
        queryset = Report.objects.filter(is_archived=False)
        
        # Apply filters
        report_type = request.query_params.get('report_type')
        if report_type:
            queryset = queryset.filter(report_type=report_type)
            
        company_id = request.query_params.get('company_id')
        if company_id:
            queryset = queryset.filter(company_id=company_id)
            
        is_edited = request.query_params.get('is_edited')
        if is_edited is not None:
            queryset = queryset.filter(is_edited=is_edited.lower() == 'true')
        
        reports_data = []
        for report in queryset:
            reports_data.append({
                'id': report.id,
                'title': report.title,
                'report_type': report.report_type,
                'content': report.content,
                'metadata': report.metadata,
                'company_id': report.company.id if report.company else None,
                'company_name': report.company.name if report.company else None,
                'generated_at': report.generated_at.isoformat(),
                'last_edited_at': report.last_edited_at.isoformat(),
                'is_edited': report.is_edited,
            })
        
        return JsonResponse({
            'success': True,
            'count': len(reports_data),
            'reports': reports_data
        })
        
    except Exception as e:
        logger.error(f"Failed to list reports: {e}")
        return JsonResponse({
            'error': f'Failed to list reports: {str(e)}'
        }, status=500)


@api_view(['GET'])
def report_detail(request, report_id):
    """
    Report Detail API Endpoint
    
    GET /api/companies/reports/{id}/
    """
    try:
        logger.info(f"Report detail API endpoint called for ID: {report_id}")
        report = get_object_or_404(Report, id=report_id, is_archived=False)
        
        # Extract the actual report content from the stored data
        import re
        # Look for 'report_content': "..." pattern
        pattern = r"'report_content':\s*\"(.*?)\"\s*(?:,|\})"
        match = re.search(pattern, report.content, re.DOTALL)
        if match:
            # Unescape the content
            extracted = match.group(1)
            # Handle escaped quotes and newlines
            actual_report = extracted.replace('\\"', '"').replace('\\n', '\n').replace('\\\\', '\\')
        else:
            # Fallback: use the raw content if regex doesn't match (e.g., after manual edit)
            actual_report = report.content
        
        return JsonResponse({
            'success': True,
            'report': {
                'id': report.id,
                'title': report.title,
                'report_type': report.report_type,
                'content': actual_report,
                'metadata': report.metadata,
                'company_id': report.company.id if report.company else None,
                'company_name': report.company.name if report.company else None,
                'generated_at': report.generated_at.isoformat(),
                'last_edited_at': report.last_edited_at.isoformat(),
                'is_edited': report.is_edited,
            }
        })
        
    except Exception as e:
        logger.error(f"Failed to get report {report_id}: {e}")
        return JsonResponse({
            'error': f'Failed to get report: {str(e)}'
        }, status=500)


@api_view(['PUT'])
def report_update(request, report_id):
    """
    Report Update API Endpoint
    
    PUT /api/companies/reports/{id}/
    
    Update report content and metadata
    
    Request body:
    {
        "title": "string",
        "content": "string (markdown)",
        "metadata": {}
    }
    """
    try:
        logger.info(f"Report update API endpoint called for ID: {report_id}")
        
        report = get_object_or_404(Report, id=report_id, is_archived=False)
        data = request.data        # Update fields if provided
        if 'title' in data:
            report.title = data['title']
        if 'content' in data:
            report.content = data['content']
        if 'metadata' in data:
            report.metadata = data['metadata']
        
        # Mark as edited and save all changes
        report.is_edited = True
        report.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Report updated successfully',
            'report': {
                'id': report.id,
                'title': report.title,
                'report_type': report.report_type,
                'content': report.content,
                'metadata': report.metadata,
                'company_id': report.company.id if report.company else None,
                'company_name': report.company.name if report.company else None,
                'generated_at': report.generated_at.isoformat(),
                'last_edited_at': report.last_edited_at.isoformat(),
                'is_edited': report.is_edited,
            }
        })
        
    except Exception as e:
        logger.error(f"Failed to update report {report_id}: {e}")
        return JsonResponse({
            'error': f'Failed to update report: {str(e)}'
        }, status=500)


@api_view(['DELETE'])
def report_delete(request, report_id):
    """
    Report Delete API Endpoint
    
    DELETE /api/companies/reports/{id}/
    """
    try:
        logger.info(f"Report delete API endpoint called for ID: {report_id}")
        
        report = get_object_or_404(Report, id=report_id)
        report_title = report.title
        
        # Archive instead of hard delete to preserve data
        report.is_archived = True
        report.save()
        
        return JsonResponse({
            'success': True,
            'message': f'Successfully archived report: {report_title}'
        })
        
    except Exception as e:
        logger.error(f"Failed to delete report {report_id}: {e}")
        return JsonResponse({
            'error': f'Failed to delete report: {str(e)}'
        }, status=500)


@api_view(['GET'])
def company_report(request, company_id):
    """
    Company Report API Endpoint
    
    GET /api/companies/{id}/report/
    
    Get existing report for a specific company
    """
    try:
        logger.info(f"Company report API endpoint called for company ID: {company_id}")
        
        company = get_object_or_404(Company, id=company_id)
        
        # Try to get existing report for this company
        try:
            report = Report.objects.get(
                company=company,
                report_type='company',
                is_archived=False
            )            
            
            # Extract the actual report content from the stored data
            import re
            # Look for 'report_content': "..." pattern
            pattern = r"'report_content':\s*\"(.*?)\"\s*(?:,|\})"
            match = re.search(pattern, report.content, re.DOTALL)
            if match:
                # Unescape the content
                extracted = match.group(1)
                # Handle escaped quotes and newlines
                actual_report = extracted.replace('\\"', '"').replace('\\n', '\n').replace('\\\\', '\\')
            else:
                # Fallback: use the raw content if regex doesn't match (e.g., after manual edit)
                actual_report = report.content
            
            return JsonResponse({
                'success': True,
                'company_id': company.id,
                'company_name': company.name,
                'report': actual_report,
                'report_id': report.id,
                'has_existing_report': True,
                'generated_at': report.generated_at.isoformat(),
                'last_edited_at': report.last_edited_at.isoformat(),
                'is_edited': report.is_edited
            })
            
        except Report.DoesNotExist:
            return JsonResponse({
                'success': True,
                'company_id': company.id,
                'company_name': company.name,
                'has_existing_report': False,
                'message': 'No existing report found for this company'
            })
        
    except Exception as e:
        logger.error(f"Failed to get company report {company_id}: {e}")
        return JsonResponse({
            'error': f'Failed to get company report: {str(e)}'
        }, status=500)


@api_view(['POST'])
def update_contact_linkedin_photo(request, contact_id):
    """
    Update LinkedIn profile photo for a specific contact
    """
    try:
        contact = get_object_or_404(Contact, id=contact_id)
        linkedin_service = ContactLinkedInService()
        
        if linkedin_service.update_contact_profile_photo(contact):
            return JsonResponse({
                'success': True,
                'message': f'Updated profile photo for {contact.get_full_name()}',
                'profile_photo_url': contact.linkedin_profile_photo_url
            })
        else:
            return JsonResponse({
                'success': False,
                'message': f'Could not fetch profile photo for {contact.get_full_name()}'
            })
            
    except Exception as e:
        logger.error(f"Failed to update contact LinkedIn photo {contact_id}: {e}")
        return JsonResponse({
            'error': f'Failed to update LinkedIn photo: {str(e)}'
        }, status=500)


@api_view(['POST'])
def bulk_update_linkedin_photos(request):
    """
    Bulk update LinkedIn profile photos for all contacts
    """
    try:
        company_id = request.data.get('company_id')
        linkedin_service = ContactLinkedInService()
        
        if company_id:
            # Update photos for contacts of a specific company
            company = get_object_or_404(Company, id=company_id)
            contacts_queryset = company.contacts.all()
            message_prefix = f"for company {company.name}"
        else:
            # Update photos for all contacts
            contacts_queryset = Contact.objects.all()
            message_prefix = "for all contacts"
        
        updated_count = linkedin_service.bulk_update_profile_photos(contacts_queryset)
        
        return JsonResponse({
            'success': True,
            'message': f'Updated {updated_count} profile photos {message_prefix}',
            'updated_count': updated_count
        })
        
    except Exception as e:
        logger.error(f"Failed to bulk update LinkedIn photos: {e}")
        return JsonResponse({
            'error': f'Failed to bulk update LinkedIn photos: {str(e)}'
        }, status=500)


@api_view(['GET'])
def linkedin_api_status(request):
    """
    Check LinkedIn API configuration status
    """
    try:
        linkedin_service = ContactLinkedInService()
        is_valid = linkedin_service.validate_linkedin_api()
        
        return JsonResponse({
            'success': True,
            'linkedin_api_configured': is_valid,
            'message': 'LinkedIn API is properly configured' if is_valid else 'LinkedIn API not configured or invalid'
        })
        
    except Exception as e:
        logger.error(f"Failed to check LinkedIn API status: {e}")
        return JsonResponse({
            'error': f'Failed to check LinkedIn API status: {str(e)}'
        }, status=500)
