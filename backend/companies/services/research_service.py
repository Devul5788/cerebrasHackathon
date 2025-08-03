import json
import logging
import re
from datetime import datetime
from typing import Dict, List, Optional, Any
from companies.models import Company, Contact
from companies.services.perplexity_service import PerplexityService
from companies.services.cerebras_service import CerebrasService

logger = logging.getLogger(__name__)


class CompanyResearchService:
    """
    Main service orchestrating comprehensive company research using Perplexity and Cerebras
    """
    
    def __init__(self):
        self.perplexity = PerplexityService()
        self.cerebras = CerebrasService()
        
    def load_company_offerings(self) -> Dict[str, Any]:
        """Load Cerebras offerings from JSON file"""
        try:
            with open('companies/company_offerings.json', 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load Cerebras offerings: {e}")
            return {}
            
    def research_and_save_company(self, company_name: str) -> Company:
        """        Comprehensive company research pipeline:
        1. Research with Perplexity
        2. Parse with Cerebras
        3. Save to database
        4. Research contacts
        5. Generate outreach materials
        """
        logger.info(f"Starting comprehensive research for {company_name}")
        
        # Step 1: Comprehensive company research with Perplexity
        logger.info("Phase 1: Basic company research")
        basic_research = self.perplexity.research_company_comprehensive(company_name)
        
        logger.info("Phase 2: Contact research")
        contact_research = self.perplexity.research_specific_contacts(company_name)
        
        logger.info("Phase 3: Competitive analysis")
        competitor_analysis = self.perplexity.analyze_competitor_landscape(company_name)
        
        logger.info("Phase 4: Recent news research")
        recent_news = self.perplexity.research_recent_news_and_initiatives(company_name)
        
        # Combine all research
        combined_research = f"""
        BASIC COMPANY RESEARCH:
        {basic_research}
        
        COMPETITIVE ANALYSIS:
        {competitor_analysis}
        
        RECENT NEWS AND INITIATIVES:
        {recent_news}
        """
        
        # Step 2: Parse with Cerebras
        logger.info("Phase 5: Parsing research with Cerebras")
        parsed_data = self.cerebras.parse_company_research(combined_research, company_name)
        
        # Step 3: Save company to database
        logger.info("Phase 6: Saving company data")
        company = self._save_company_data(parsed_data, combined_research)
        
        # Step 4: Parse and save contacts
        logger.info("Phase 7: Parsing and saving contacts")
        parsed_contacts = self.cerebras.parse_contact_research(contact_research, company_name)
        self._save_contact_data(company, parsed_contacts, contact_research)
        logger.info(f"Research completed for {company_name}")
        return company
        
    def _normalize_company_name(self, name: str) -> str:
        """
        Normalize company name for duplicate detection
        Removes common suffixes and normalizes casing/spacing
        """
        if not name:
            return ""
        
        # Convert to lowercase and strip whitespace
        normalized = name.lower().strip()
        
        # Remove common company suffixes
        suffixes_to_remove = [
            ', l.p.', ', lp', ', l.l.c.', ', llc', ', inc.', ', inc',
            ', corp.', ', corp', ', corporation', ', co.', ', co',
            ', ltd.', ', ltd', ', limited', ', plc', ', s.a.', ', sa',
            ', gmbh', ', ag', ', bv', ', nv', ', pvt. ltd.', ', pvt ltd',
            ', private limited', ', pte. ltd.', ', pte ltd'
        ]
        
        for suffix in suffixes_to_remove:
            if normalized.endswith(suffix):
                normalized = normalized[:-len(suffix)].strip()
                break
        
        # Remove extra whitespace and normalize
        normalized = ' '.join(normalized.split())
        
        return normalized
    
    def _find_existing_company(self, company_name: str) -> Optional[Company]:
        """
        Find existing company by normalized name matching
        """
        if not company_name:
            return None
        
        normalized_name = self._normalize_company_name(company_name)
        
        # Try exact match first
        try:
            return Company.objects.get(name__iexact=company_name)
        except Company.DoesNotExist:
            pass
        
        # Try normalized name matching
        all_companies = Company.objects.all()
        for company in all_companies:
            if self._normalize_company_name(company.name) == normalized_name:
                logger.info(f"Found existing company: '{company.name}' matches '{company_name}'")
                return company
        
        return None

    def _save_company_data(self, parsed_data: Dict[str, Any], raw_research: str) -> Company:
        """Save parsed company data to database"""
        try:
            # Extract data from parsed structure
            basic_info = parsed_data.get('basic_info', {})
            financial_info = parsed_data.get('financial_info', {})
            business_info = parsed_data.get('business_intelligence', {})
            ai_info = parsed_data.get('ai_ml_info', {})
            cerebras_analysis = parsed_data.get('cerebras_analysis', {})
            research_metadata = parsed_data.get('research_metadata', {})
            
            company_name = basic_info.get('name', 'Unknown Company')
            
            # Check for existing company using normalized matching
            existing_company = self._find_existing_company(company_name)
            
            # Prepare company data
            company_data = {
                # Basic Information
                'website': basic_info.get('website'),
                'description': basic_info.get('description'),
                'industry': basic_info.get('industry'),
                'sector': basic_info.get('sector'),
                'employee_count': basic_info.get('employee_count'),
                'employee_count_exact': basic_info.get('employee_count_exact'),
                'headquarters_location': basic_info.get('headquarters_location'),
                'founded_year': basic_info.get('founded_year'),
                
                # Financial Information (simplified)
                'ipo_status': financial_info.get('ipo_status'),
                'total_funding': financial_info.get('total_funding'),
                'valuation': financial_info.get('valuation'),
                'revenue': financial_info.get('revenue'),
                'revenue_growth': financial_info.get('revenue_growth'),
                # Business Intelligence
                'business_model': business_info.get('business_model'),
                'key_products': business_info.get('key_products') or [],
                'key_technologies': business_info.get('key_technologies') or [],
                'competitors': business_info.get('competitors') or [],                # AI/ML Information
                'ai_ml_usage': ai_info.get('ai_ml_usage'),
                'current_ai_infrastructure': ai_info.get('current_ai_infrastructure'),
                'ai_initiatives': ai_info.get('ai_initiatives') or [],
                'ml_use_cases': ai_info.get('ml_use_cases') or [],
                'data_science_team_size': ai_info.get('data_science_team_size'),
                
                # AI Inference Specific
                'ai_inference_workloads': ai_info.get('ai_inference_workloads') or [],
                'inference_models_used': ai_info.get('inference_models_used') or [],
                'inference_volume': ai_info.get('inference_volume'),
                'inference_latency_requirements': ai_info.get('inference_latency_requirements'),
                'current_inference_hardware': ai_info.get('current_inference_hardware'),
                'inference_pain_points': ai_info.get('inference_pain_points') or [],
                'inference_budget': ai_info.get('inference_budget'),
                
                # Cerebras Analysis
                'recommended_cerebras_product': cerebras_analysis.get('recommended_product'),
                'cerebras_fit_score': cerebras_analysis.get('fit_score'),
                'cerebras_value_proposition': cerebras_analysis.get('value_proposition'),
                'potential_use_cases': cerebras_analysis.get('potential_use_cases') or [],
                'implementation_timeline': cerebras_analysis.get('implementation_timeline'),
                'estimated_budget_range': cerebras_analysis.get('estimated_budget_range'),
                
                # Research Metadata
                'research_quality_score': research_metadata.get('quality_score', 5),
                'research_sources': research_metadata.get('sources') or [],
                'research_notes': research_metadata.get('notes') or raw_research[:1000] + "...",
                
                # Set outreach priority based on fit score
                'outreach_priority': self._calculate_outreach_priority(cerebras_analysis.get('fit_score', 5)),
            }
            
            if existing_company:                # Update existing company
                for field, value in company_data.items():
                    setattr(existing_company, field, value)
                # Update the name to the latest/most complete version
                existing_company.name = company_name
                existing_company.save()
                company = existing_company
                logger.info(f"Updated existing company: {company.name}")
            else:
                # Create new company
                company = Company.objects.create(
                    name=company_name,
                    **company_data
                )
                logger.info(f"Created new company: {company.name}")
            
            return company
            
        except Exception as e:
            logger.error(f"Failed to save company data: {e}")
            # Create minimal company record
            company, _ = Company.objects.get_or_create(
                name=parsed_data.get('basic_info', {}).get('name', 'Unknown Company'),                defaults={'research_notes': f"Error saving data: {str(e)}"}
            )
            return company

    def _normalize_contact_name(self, first_name: str, last_name: str) -> str:
        """
        Normalize contact name for duplicate detection
        """
        if not first_name and not last_name:
            return ""
        
        # Clean and normalize names
        first_clean = (first_name or "").strip().lower()
        last_clean = (last_name or "").strip().lower()
        
        return f"{first_clean}|{last_clean}"
    
    def _find_existing_contact(self, company: Company, first_name: str, last_name: str, email: str = None) -> Optional[Contact]:
        """
        Find existing contact by normalized name matching within the same company
        """
        if not first_name and not last_name:
            return None
        normalized_name = self._normalize_contact_name(first_name, last_name)
        
        # First try exact email match if provided and not a generated fallback
        if email and email.strip() and not email.startswith('unknown_') and '@' in email:
            try:
                return Contact.objects.get(company=company, email=email)
            except Contact.DoesNotExist:
                pass
        
        # Try name-based matching within the same company
        company_contacts = Contact.objects.filter(company=company)
        for contact in company_contacts:
            contact_normalized = self._normalize_contact_name(contact.first_name, contact.last_name)
            if contact_normalized == normalized_name:
                logger.info(f"Found duplicate contact: '{contact.get_full_name()}' matches '{first_name} {last_name}'")
                return contact
        
        return None

    def _save_contact_data(self, company: Company, parsed_contacts: List[Dict[str, Any]], raw_research: str):
        """Save parsed contact data to database with improved deduplication"""
        try:
            # Validate that parsed_contacts is a list of dictionaries
            if not isinstance(parsed_contacts, list):
                logger.error(f"Expected list of contacts, got {type(parsed_contacts)}: {parsed_contacts}")
                return
            
            if not parsed_contacts:
                logger.info(f"No contacts found for {company.name}")
                return
            
            for contact_data in parsed_contacts:
                if not isinstance(contact_data, dict):
                    logger.error(f"Expected contact dict, got {type(contact_data)}: {contact_data}")
                    continue
                    
                basic_info = contact_data.get('basic_info', {})
                contact_info = contact_data.get('contact_info', {})
                professional = contact_data.get('professional_background', {})
                decision_making = contact_data.get('decision_making', {})
                ai_profile = contact_data.get('ai_ml_profile', {})
                personalization = contact_data.get('personalization', {})
                outreach = contact_data.get('outreach_profile', {})
                research_quality = contact_data.get('research_quality', {})
                first_name = (basic_info.get('first_name') or '').strip()
                last_name = (basic_info.get('last_name') or '').strip()
                provided_email = (contact_info.get('email') or '').strip()
                
                # Skip if no name available
                if not first_name and not last_name:
                    continue
                
                # Check for existing contact first
                existing_contact = self._find_existing_contact(company, first_name, last_name, provided_email)
                
                # Generate professional fallback email if none provided or if it's a placeholder
                company_domain = self._generate_company_domain(company.name)
                
                if provided_email and not provided_email.startswith('unknown_') and '@' in provided_email:
                    # Use provided email if it looks legitimate
                    final_email = provided_email
                elif last_name:
                    final_email = f"{first_name.lower()}.{last_name.lower()}@{company_domain}"
                else:
                    final_email = f"{first_name.lower()}@{company_domain}"
                
                # Prepare contact data
                contact_data_to_save = {
                    # Basic Information
                    'first_name': first_name,
                    'last_name': last_name,
                    'full_name': basic_info.get('full_name') or f"{first_name} {last_name}".strip(),
                    'title': basic_info.get('title'),
                    'department': basic_info.get('department'),
                    'seniority_level': basic_info.get('seniority_level', 'other'),
                    
                    # Contact Information - prioritize provided email over generated
                    'email': final_email,
                    'phone': contact_info.get('phone'),
                    'linkedin_url': contact_info.get('linkedin_url'),
                    'twitter_handle': contact_info.get('twitter_handle'),
                    
                    # Professional Background
                    'tenure_at_company': professional.get('tenure_at_company'),
                    'previous_companies': professional.get('previous_companies', []),
                    'education': professional.get('education', []),
                    'certifications': professional.get('certifications', []),
                    
                    # Decision Making Profile
                    'decision_maker': decision_making.get('decision_maker', False),
                    'influence_level': decision_making.get('influence_level', 'unknown'),
                    'budget_authority': decision_making.get('budget_authority', False),
                    'technical_background': decision_making.get('technical_background', False),
                    
                    # AI/ML Profile
                    'ai_ml_experience': ai_profile.get('ai_ml_experience'),
                    'ai_ml_interests': ai_profile.get('ai_ml_interests', []),
                    'published_papers': ai_profile.get('published_papers', []),
                    'conference_speaking': ai_profile.get('conference_speaking', []),
                    
                    # Personalization
                    'communication_style': personalization.get('communication_style', 'unknown'),
                    'interests': personalization.get('interests', []),
                    'pain_points': personalization.get('pain_points', []),
                    'recent_achievements': personalization.get('recent_achievements', []),
                    
                    # Outreach
                    'contact_priority': outreach.get('contact_priority', 'secondary'),
                    'preferred_contact_method': outreach.get('preferred_contact_method', 'email'),
                    
                    # Research Quality
                    'research_quality_score': research_quality.get('quality_score', 5),
                    'data_sources': research_quality.get('data_sources', []),
                }
                if existing_contact:
                    # Update existing contact with new/better information
                    for field, value in contact_data_to_save.items():
                        # Only update if new value is more informative
                        current_value = getattr(existing_contact, field)
                        if field == 'email':
                            # Update email if new one is better (not generated/unknown)
                            current_email = current_value or ''
                            new_email = value or ''
                            if (not current_email.startswith('unknown_') and
                                not new_email.startswith('unknown_') and
                                '@' in new_email):
                                setattr(existing_contact, field, value)
                        elif field in ['research_quality_score']:
                            # Take higher quality score
                            if value and current_value and value > current_value:
                                setattr(existing_contact, field, value)
                        elif not current_value or (isinstance(current_value, list) and len(current_value) == 0):
                            # Update if current value is empty
                            setattr(existing_contact, field, value)
                        elif (value and str(value).strip() and current_value and
                              len(str(value).strip()) > len(str(current_value).strip())):
                            # Update if new value is more detailed
                            setattr(existing_contact, field, value)
                    
                    existing_contact.save()
                    contact = existing_contact
                    logger.info(f"Updated existing contact: {contact.get_full_name()}")
                else:
                    # Create new contact
                    contact = Contact.objects.create(
                        company=company,
                        **contact_data_to_save
                    )
                    logger.info(f"Created new contact: {contact.get_full_name()}")
                
        except Exception as e:
            logger.error(f"Failed to save contact data for {company.name}: {e}")
    
    def _generate_company_domain(self, company_name: str) -> str:
        """
        Generate a professional company domain from company name
        Handles common company suffixes and special characters
        """
        if not company_name:
            return "example.com"
        
        # Remove common company suffixes
        name = company_name.lower()
        suffixes_to_remove = [
            ' corporation', ' corp.', ' corp', ' inc.', ' inc', ' llc', ' ltd.', ' ltd',
            ' limited', ' company', ' co.', ' co', ' group', ' technologies', ' tech',
            ' systems', ' solutions', ' services', ' enterprises', ' international',
            ' labs', ' laboratory', ' pbc', ' plc'
        ]
        
        for suffix in suffixes_to_remove:
            if name.endswith(suffix):
                name = name[:-len(suffix)]
                break
        
        # Remove parentheses and their contents
        import re
        name = re.sub(r'\([^)]*\)', '', name)
        
        # Clean up special characters and spaces
        name = re.sub(r'[^a-zA-Z0-9\s]', '', name)
        name = name.replace(' ', '').strip()
        
        # Handle empty names
        if not name:
            return "example.com"
        
        # Add .com domain
        return f"{name}.com"
    
    def _calculate_outreach_priority(self, fit_score: Optional[int]) -> str:
        """Calculate outreach priority based on Cerebras fit score"""
        if not fit_score:
            return 'medium'
        
        if fit_score >= 8:
            return 'high'
        elif fit_score >= 6:
            return 'medium'
        else:
            return 'low'
            
    def generate_outreach_materials(self, company: Company, contact: Contact) -> str:
        """Generate personalized outreach email for a specific contact"""
        try:
            # Prepare company data
            company_data = {
                'name': company.name,
                'industry': company.industry,
                'description': company.description,
                'ai_usage': company.ai_ml_usage,
                'recommended_product': company.recommended_cerebras_product,
                'value_proposition': company.cerebras_value_proposition,
                'use_cases': company.potential_use_cases,
                'recent_initiatives': company.ai_initiatives,
            }
            
            # Prepare contact data
            contact_data = {
                'name': contact.get_full_name(),
                'first_name': contact.first_name,
                'title': contact.title,
                'technical_background': contact.technical_background,
                'ai_experience': contact.ai_ml_experience,
                'interests': contact.interests,
                'communication_style': contact.communication_style,
                'recent_achievements': contact.recent_achievements,
            }
            
            # Load Cerebras offerings
            company_offerings = self.load_company_offerings()
            
            return self.cerebras.generate_personalized_email_content(
                company_data, contact_data, company_offerings
            )
            
        except Exception as e:
            logger.error(f"Failed to generate outreach materials: {e}")
            return f"Error generating outreach materials: {str(e)}"
            
    def batch_research_companies(self, company_names: List[str]) -> List[Company]:
        """Research multiple companies in batch"""
        results = []
        
        for company_name in company_names:
            try:
                logger.info(f"Processing {company_name} ({company_names.index(company_name) + 1}/{len(company_names)})")
                company = self.research_and_save_company(company_name)
                results.append(company)
            except Exception as e:
                logger.error(f"Failed to process {company_name}: {e}")
                # Create a minimal record for failed companies
                company, _ = Company.objects.get_or_create(
                    name=company_name,
                    defaults={
                        'research_notes': f"Research failed: {str(e)}",
                        'research_quality_score': 1
                    }
                )
                results.append(company)
                
        return results

    def batch_research_companies_parallel(self, company_names: List[str]) -> List[Company]:
        """Research multiple companies in parallel for better performance"""
        import concurrent.futures
        from threading import Lock
        
        results = []
        results_lock = Lock()
        
        def research_single_company(company_name):
            try:
                logger.info(f"Processing {company_name} in parallel")
                company = self.research_and_save_company(company_name)
                with results_lock:
                    results.append(company)
                return company
            except Exception as e:
                logger.error(f"Failed to process {company_name}: {e}")
                # Create a minimal record for failed companies
                company, _ = Company.objects.get_or_create(
                    name=company_name,
                    defaults={
                        'research_notes': f"Research failed: {str(e)}",
                        'research_quality_score': 1
                    }
                )
                with results_lock:
                    results.append(company)
                return company
        # Use ThreadPoolExecutor for parallel processing
        max_workers = min(len(company_names), 5)  # Limit to 5 concurrent requests
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_company = {
                executor.submit(research_single_company, company_name): company_name
                for company_name in company_names
            }
            
            for future in concurrent.futures.as_completed(future_to_company):
                company_name = future_to_company[future]
                try:
                    future.result()  # This will raise any exception that occurred
                except Exception as e:
                    logger.error(f"Parallel processing failed for {company_name}: {e}")
    
        return results

    def find_potential_customers(self, max_customers: int) -> List[str]:
        """
        Find potential customers using company_offerings.json
        Returns a list of company names to research
        """
        offerings = self.load_company_offerings()
        
        # Use Perplexity to analyze offerings and suggest potential customers
        context = f"""
        You are an expert sales analyst for Cerebras Systems. Based on the following Cerebras product offerings,
        identify {max_customers} potential customer companies that would be excellent fits for these products. Make sure they are not competitors like TogetherAI, Nvidia, Etched, Grok, etc. I want companies who can use Cerebras not create competing products. 
        
        Cerebras Product Offerings:
        {json.dumps(offerings, indent=2)}
        
        Consider companies across different industries and use cases that would benefit from:
        - High-performance AI inference
        - Large model training
        - Real-time AI applications
        - Enterprise AI infrastructure
        
        Focus on companies that likely have:
        - Significant AI/ML workloads
        - Need for high-performance computing
        - Budget for enterprise AI solutions
        - Technical teams capable of implementing advanced AI systems
        """
        
        question = f"""
        Please provide exactly {max_customers} company names (one per line) that would be ideal potential customers
        for Cerebras products. Include a mix of:
        - Large tech companies
        - AI startups
        - Financial services firms
        - Healthcare/biotech companies
        - Research institutions
        - E-commerce companies
        - Automotive companies
        
        Format: Just the company names, one per line, no numbering or bullets.
        """
        
        try:
            from common.utils import ask_perplexity
            response = ask_perplexity(question, context, model="sonar-pro", temp=0.3)
            
            # Handle both dict and string responses from Perplexity
            if isinstance(response, dict):
                response_text = response.get('content', str(response))
            else:
                response_text = str(response)
            
            # Parse the response to extract company names
            lines = response_text.strip().split('\n')
            company_names = []
            
            for line in lines:
                line = line.strip()
                # Remove numbering, bullets, etc.
                line = re.sub(r'^\d+\.?\s*', '', line)
                line = re.sub(r'^[-*•]\s*', '', line)
                
                if line and len(company_names) < max_customers:
                    company_names.append(line)
            
            logger.info(f"Found {len(company_names)} potential customers: {company_names}")
            return company_names[:max_customers]
            
        except Exception as e:
            logger.error(f"Failed to find potential customers: {e}")
            # Fallback to a predefined list
            fallback_customers = [
                "OpenAI", "Anthropic", "Cohere", "Stability AI", "Hugging Face",
                "NVIDIA", "Microsoft", "Google", "Amazon", "Meta",
                "Tesla", "Uber", "Airbnb", "Netflix", "Spotify",
                "Goldman Sachs", "JPMorgan Chase", "Morgan Stanley", "BlackRock", "Citadel",
                "Mayo Clinic", "Johns Hopkins", "Pfizer", "Moderna", "Illumina"
            ]
            return fallback_customers[:max_customers]    
    
    def generate_customer_report(self, company: Company) -> Dict[str, Any]:
        """
        Generate a comprehensive customer report for a single company using Cerebras inference
        """
        offerings = self.load_company_offerings()
        
        # Gather ALL company data - comprehensive profile
        company_data = {
            # Basic Information
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
            
            # Financial Information
            'ipo_status': company.ipo_status,
            'total_funding': company.total_funding,
            'revenue': company.revenue,
            
            # Business Intelligence
            'business_model': company.business_model,
            'key_products': company.key_products,
            'key_technologies': company.key_technologies,
            'competitors': company.competitors,
            
            # AI/ML Information
            'ai_ml_usage': company.ai_ml_usage,
            'current_ai_infrastructure': company.current_ai_infrastructure,
            'ai_initiatives': company.ai_initiatives,
            'ml_use_cases': company.ml_use_cases,
            'data_science_team_size': company.data_science_team_size,
            
            # Cerebras Analysis
            'recommended_cerebras_product': company.recommended_cerebras_product,
            'cerebras_fit_score': company.cerebras_fit_score,
            'cerebras_value_proposition': company.cerebras_value_proposition,
            'potential_use_cases': company.potential_use_cases,
            'implementation_timeline': company.implementation_timeline,
            'estimated_budget_range': company.estimated_budget_range,
            
            # Metadata
            'outreach_priority': company.outreach_priority,
            'outreach_readiness': company.get_outreach_readiness(),
            'research_quality_score': company.research_quality_score,
            'research_sources': company.research_sources,
            'created_at': company.created_at.isoformat(),
            'updated_at': company.updated_at.isoformat()
        }
        
        # Get comprehensive contact information
        contacts = company.contacts.all()
        contact_data = []
        for contact in contacts:
            contact_data.append({
                'id': contact.id,
                'name': contact.get_full_name(),
                'title': contact.title,
                'email': contact.email,
                'linkedin_url': contact.linkedin_url,
                'contact_priority': contact.contact_priority,
                'seniority_level': contact.seniority_level,
                'decision_maker': contact.decision_maker,
                'influence_level': contact.influence_level,
                'technical_background': contact.technical_background,
                'ai_ml_experience': contact.ai_ml_experience,
                'personalization_score': contact.get_personalization_score(),
                'research_quality_score': contact.research_quality_score
            })
        
        # Contact summary statistics
        contact_summary = {
            'total_contacts': len(contact_data),
            'primary_contacts': len([c for c in contact_data if c['contact_priority'] == 'primary']),
            'decision_makers': len([c for c in contact_data if c['decision_maker']]),
            'technical_contacts': len([c for c in contact_data if c['technical_background']]),
            'c_level_contacts': len([c for c in contact_data if c['seniority_level'] == 'c_level']),
            'high_influence_contacts': len([c for c in contact_data if c['influence_level'] == 'high'])
        }
        context = f"""
        You are a senior sales analyst at Cerebras Systems creating a comprehensive customer analysis report.
        Generate a detailed report that leverages all available data to provide actionable insights.
        
        CEREBRAS PRODUCT OFFERINGS:
        {json.dumps(offerings, indent=2)}
        
        COMPLETE COMPANY PROFILE:
        {json.dumps(company_data, indent=2)}
        
        CONTACT INFORMATION & STAKEHOLDER ANALYSIS:
        Contact Summary: {json.dumps(contact_summary, indent=2)}
        
        Detailed Contacts:
        {json.dumps(contact_data, indent=2)}
        """
        
        question = """
        Create a comprehensive customer analysis report that includes:
        
        # 1. EXECUTIVE SUMMARY
           - Company overview with key business metrics (revenue, employees, market position)
           - Strategic importance and fit assessment with Cerebras
           - Investment opportunity summary and revenue potential
           - Critical success factors and implementation readiness
        
        # 2. COMPANY INTELLIGENCE DEEP DIVE
           - Business model and financial profile analysis
           - Key products, technologies, and competitive positioning
           - Market presence and growth trajectory
           - Organizational structure and scale analysis
        
        # 3. AI/ML INFRASTRUCTURE & REQUIREMENTS ANALYSIS
           - Current AI/ML infrastructure assessment and gaps
           - Specific use cases and technical requirements
           - Data science capabilities and team structure
           - Performance bottlenecks and optimization opportunities
        
        # 4. CEREBRAS PRODUCT FIT & RECOMMENDATIONS
           - Detailed product recommendation with technical justification
           - Performance improvement projections and benchmarks
           - Implementation approach and timeline
           - Integration considerations and requirements
           - ROI calculation and business case
        
        # 5. STAKEHOLDER MAPPING & ENGAGEMENT STRATEGY
           - Complete contact portfolio analysis
           - Decision-making hierarchy and influence mapping
           - Personalized outreach strategies by contact
           - Technical champion identification and development
           - Executive sponsor engagement approach
        
        # 6. COMPETITIVE LANDSCAPE & POSITIONING
           - Current vendor relationships and competitive threats
           - Cerebras differentiation and value proposition
           - Competitive displacement opportunities
           - Risk factors and mitigation strategies
        
        # 7. SALES STRATEGY & EXECUTION PLAN
           - Go-to-market approach and messaging framework
           - Demo/POC strategy and success criteria
           - Pricing and negotiation considerations
           - Timeline and milestone planning
           - Resource requirements and team allocation
        
        # 8. RISK ASSESSMENT & MITIGATION
           - Technical, business, and competitive risks
           - Implementation challenges and solutions
           - Budget and timeline risk factors
           - Contingency planning and alternative approaches
        
        # 9. SUCCESS METRICS & KPIs
           - Engagement metrics and progression indicators
           - Technical success criteria and benchmarks
           - Business outcome measurements
           - Long-term partnership potential
        
        # 10. IMMEDIATE ACTION ITEMS
           - Next 30/60/90 day action plan
           - Required resources and stakeholder involvement
           - Success milestones and check-in points
           - Escalation procedures and decision gates
        
        Format as a detailed markdown report with data-driven insights, specific recommendations, 
        and actionable next steps. Include relevant metrics, contact details, and implementation timelines.
        Use professional business language suitable for C-level presentations.        """
        
        try:
            report = self.cerebras.generate_text(question, context)
            return {
                'company_id': company.id,
                'company_name': company.name,
                'generated_at': datetime.now().isoformat(),
                'report_content': report,
                'comprehensive_data': {
                    'company_profile': company_data,
                    'contacts_portfolio': contact_data,
                    'contact_summary': contact_summary,
                    'company_offerings': offerings,
                    'data_completeness_score': self._calculate_data_completeness(company_data, contact_data),
                    'engagement_readiness': company.get_outreach_readiness()
                },
                'metadata': {
                    'report_version': '2.0',
                    'data_sources_count': len(company.research_sources) if company.research_sources else 0,
                    'last_research_update': company.updated_at.isoformat(),
                    'quality_metrics': {
                        'company_research_score': company.research_quality_score,
                        'contact_research_score': sum([c.research_quality_score for c in contacts]) / len(contacts) if contacts else 0,
                        'overall_confidence': (company.research_quality_score + (sum([c.research_quality_score for c in contacts]) / len(contacts) if contacts else 0)) / 2
                    }
                }
            }
        except Exception as e:
            logger.error(f"Failed to generate customer report for {company.name}: {e}")
            return {
                'company_id': company.id,
                'company_name': company.name,
                'error': str(e),
                'generated_at': datetime.now().isoformat(),
                'partial_data': {
                    'company_profile': company_data,
                    'contacts_portfolio': contact_data
                }
            }
    
    def _calculate_data_completeness(self, company_data: Dict, contact_data: List) -> int:
        """Calculate a data completeness score based on available information"""
        required_fields = [
            'name', 'industry', 'description', 'website', 'employee_count',
            'ai_ml_usage', 'recommended_cerebras_product', 'cerebras_fit_score'
        ]
        
        completed_fields = sum(1 for field in required_fields if company_data.get(field))
        base_score = (completed_fields / len(required_fields)) * 70
          # Bonus points for contacts
        contact_bonus = min(len(contact_data) * 5, 20)
        
        # Bonus for detailed AI/ML information
        ai_bonus = 10 if company_data.get('current_ai_infrastructure') and company_data.get('ml_use_cases') else 0
        
        return min(int(base_score + contact_bonus + ai_bonus), 100)

    def generate_comprehensive_customer_report(self, companies) -> Dict[str, Any]:
        """
        Generate a comprehensive report across all companies using Cerebras inference
        """
        offerings = self.load_company_offerings()
        
        # Aggregate data across all companies
        total_companies = len(companies)
        high_fit_companies = companies.filter(cerebras_fit_score__gte=8).count()
        medium_fit_companies = companies.filter(cerebras_fit_score__range=[5, 7]).count()
        low_fit_companies = companies.filter(cerebras_fit_score__lt=5).count()
        
        # Industry breakdown with detailed metrics
        industry_breakdown = {}
        for company in companies:
            industry = company.industry or 'Unknown'
            if industry not in industry_breakdown:
                industry_breakdown[industry] = {
                    'count': 0,
                    'high_fit_count': 0,
                    'total_employees': 0,
                    'avg_fit_score': 0,
                    'companies': []
                }
            
            industry_breakdown[industry]['count'] += 1
            industry_breakdown[industry]['companies'].append({
                'name': company.name,
                'fit_score': company.cerebras_fit_score,
                'priority': company.outreach_priority,
                'employee_count': company.employee_count_exact or company.employee_count,
                'recommended_product': company.recommended_cerebras_product
            })
            
            if company.cerebras_fit_score and company.cerebras_fit_score >= 8:
                industry_breakdown[industry]['high_fit_count'] += 1
            
            if company.employee_count_exact:
                industry_breakdown[industry]['total_employees'] += company.employee_count_exact
        
        # Calculate averages for each industry
        for industry_data in industry_breakdown.values():
            if industry_data['count'] > 0:
                company_scores = [c['fit_score'] for c in industry_data['companies'] if c['fit_score']]
                industry_data['avg_fit_score'] = sum(company_scores) / len(company_scores) if company_scores else 0
        
        # Product recommendation breakdown
        product_breakdown = {}
        for company in companies:
            product = company.recommended_cerebras_product or 'No Recommendation'
            if product not in product_breakdown:
                product_breakdown[product] = {
                    'count': 0,
                    'total_fit_score': 0,
                    'high_priority_count': 0,
                    'companies': []
                }
            
            product_breakdown[product]['count'] += 1
            product_breakdown[product]['companies'].append({
                'name': company.name,
                'industry': company.industry,
                'fit_score': company.cerebras_fit_score,
                'priority': company.outreach_priority,
                'budget_range': company.estimated_budget_range
            })
            
            if company.cerebras_fit_score:
                product_breakdown[product]['total_fit_score'] += company.cerebras_fit_score
            
            if company.outreach_priority == 'high':
                product_breakdown[product]['high_priority_count'] += 1
        
        # Calculate average fit scores by product
        for product_data in product_breakdown.values():
            if product_data['count'] > 0:
                product_data['avg_fit_score'] = product_data['total_fit_score'] / product_data['count']
        
        # Top opportunities with comprehensive data
        top_opportunities = []
        for company in companies.filter(cerebras_fit_score__gte=7, outreach_priority='high')[:10]:
            contacts_count = company.contacts.count()
            decision_makers = company.contacts.filter(decision_maker=True).count()
            
            top_opportunities.append({
                'id': company.id,
                'name': company.name,
                'industry': company.industry,
                'website': company.website,
                'employee_count': company.employee_count,
                'revenue': company.revenue,
                'cerebras_fit_score': company.cerebras_fit_score,
                'recommended_cerebras_product': company.recommended_cerebras_product,
                'estimated_budget_range': company.estimated_budget_range,
                'implementation_timeline': company.implementation_timeline,
                'outreach_readiness': company.get_outreach_readiness(),
                'contacts_count': contacts_count,
                'decision_makers_count': decision_makers,
                'ai_ml_usage': company.ai_ml_usage,
                'current_ai_infrastructure': company.current_ai_infrastructure,
                'value_proposition': company.cerebras_value_proposition
            })
        
        # Revenue opportunity analysis
        total_contacts = sum(company.contacts.count() for company in companies)
        companies_with_contacts = companies.filter(contacts__isnull=False).distinct().count()
        avg_contacts_per_company = total_contacts / total_companies if total_companies > 0 else 0
        
        # Pipeline health metrics
        pipeline_health = {
            'total_companies': total_companies,
            'companies_with_contacts': companies_with_contacts,
            'contact_coverage_rate': (companies_with_contacts / total_companies * 100) if total_companies > 0 else 0,
            'total_contacts': total_contacts,
            'avg_contacts_per_company': round(avg_contacts_per_company, 1),
            'high_fit_companies': high_fit_companies,
            'medium_fit_companies': medium_fit_companies,
            'low_fit_companies': low_fit_companies,
            'high_priority_companies': companies.filter(outreach_priority='high').count(),
            'ready_for_outreach': companies.filter(outreach_priority='high', cerebras_fit_score__gte=7).count()
        }
        
        context = f"""
        You are the VP of Sales at Cerebras Systems analyzing the entire customer pipeline.
        
        Cerebras Product Offerings:
        {json.dumps(offerings, indent=2)}
        
        Pipeline Overview:
        - Total Companies: {total_companies}
        - High Fit (8-10): {high_fit_companies}
        - Medium Fit (5-7): {medium_fit_companies}
        - Low Fit (1-4): {low_fit_companies}
        
        Industry Breakdown:
        {json.dumps(industry_breakdown, indent=2)}
        
        Product Demand:
        {json.dumps(product_breakdown, indent=2)}
        
        Top Opportunities:
        {json.dumps(list(top_opportunities), indent=2)}
        """
        
        question = """
        Create a comprehensive executive sales report that includes:
        
        1. EXECUTIVE DASHBOARD
           - Pipeline health and key metrics
           - Revenue opportunity assessment
           - Market penetration analysis
        
        2. MARKET ANALYSIS
           - Industry segment opportunities
           - Product-market fit insights
           - Competitive landscape assessment
        
        3. STRATEGIC RECOMMENDATIONS
           - Priority customer segments
           - Product positioning strategies
           - Resource allocation recommendations
        
        4. SALES EXECUTION PLAN
           - High-priority prospect list
           - Engagement strategies by segment
           - Timeline and resource requirements
        
        5. RISK ASSESSMENT
           - Pipeline risks and mitigation strategies
           - Competitive threats
           - Market challenges
        
        6. SUCCESS METRICS AND TARGETS
           - Quarterly targets by product
           - Key performance indicators
           - Success milestones
        
        Format as a comprehensive markdown executive report with actionable insights.
        """
        
        try:
            report = self.cerebras.generate_text(question, context)
            return {
                'generated_at': json.dumps(datetime.now().isoformat()),
                'pipeline_metrics': {
                    'total_companies': total_companies,
                    'high_fit_companies': high_fit_companies,
                    'medium_fit_companies': medium_fit_companies,
                    'low_fit_companies': low_fit_companies,
                    'industry_breakdown': industry_breakdown,
                    'product_breakdown': product_breakdown
                },
                'top_opportunities': list(top_opportunities),
                'comprehensive_report': report
            }
        except Exception as e:
            logger.error(f"Failed to generate comprehensive customer report: {e}")
            return {
                'error': str(e),
                'generated_at': json.dumps(datetime.now().isoformat())
            }
    
    def _safe_get_string(self, value: Any) -> str:
        """
        Safely convert a value to a string, handling None values
        """
        if value is None:
            return ""
        return str(value).strip()
    
    def _safe_get_list(self, value: Any) -> List:
        """
        Safely convert a value to a list, handling None values
        """
        if value is None:
            return []
        if isinstance(value, list):
            return value
        return []
