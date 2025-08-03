import logging
from typing import List
from common.utils import ask_perplexity

logger = logging.getLogger(__name__)


class PerplexityService:
    """
    Service to interact with Perplexity AI for comprehensive company research
    """
    
    def __init__(self):
        pass
        
    def research_company_comprehensive(self, company_name: str) -> str:
        """
        Get comprehensive company information for Cerebras targeting
        """
        prompt = f"""
        Research the company "{company_name}" and provide comprehensive information for AI infrastructure sales targeting. 
        Please provide detailed information in the following categories:

        1. BASIC COMPANY INFO:
        - Full company name and website
        - Industry and sector
        - Headquarters location
        - Founded year
        - Employee count (approximate range and exact if available)
        - Brief company description

        2. FINANCIAL & FUNDING:
        - IPO status (Public/Private/Acquired)
        - Stock symbol (if public)
        - Market capitalization (if public)
        - Last funding round details (amount, date, round type)
        - Total funding raised
        - Current valuation
        - Annual revenue (if available)
        - Revenue growth rate

        3. BUSINESS INTELLIGENCE:
        - Business model
        - Key products and services
        - Main competitors
        - Recent strategic initiatives
        - Technology stack and infrastructure

        4. AI/ML FOCUS:
        - Current AI/ML usage and initiatives
        - Data science and ML team size
        - AI infrastructure and cloud providers
        - Machine learning use cases
        - AI-related challenges or pain points
        - Published AI research or patents

        5. DECISION MAKERS:
        - CTO, CIO, Chief Data Officer, VP Engineering names
        - Head of AI/ML, Data Science leadership
        - Contact information if publicly available
        - LinkedIn profiles
        - Their backgrounds and tenure

        6. CEREBRAS FIT ANALYSIS:
        - Potential use cases for Cerebras products (inference, training, model hosting)
        - Current AI infrastructure limitations
        - Budget range for AI infrastructure (if known)
        - Implementation timeline potential
        - Why Cerebras would be valuable for them

        Please be as detailed and specific as possible. Include recent news, funding announcements, and AI initiatives. 
        Focus on information that would help write a highly personalized outreach email.
        """
        
        try:
            response = ask_perplexity(
                question="Provide comprehensive company research for AI infrastructure sales targeting.",
                context=prompt,
                model="sonar-pro",
                temp=0.1
            )
            
            # Handle both dict and string responses
            if isinstance(response, dict):
                return response.get('content', str(response))
            return str(response)
            
        except Exception as e:
            logger.error(f"Failed to research company {company_name}: {e}")
            return f"Error researching company: {str(e)}"
            
    def research_specific_contacts(self, company_name: str, target_roles: List[str] = None) -> str:
        """
        Research specific contacts at a company
        """
        if target_roles is None:
            target_roles = [
                "CTO", "Chief Technology Officer", 
                "CIO", "Chief Information Officer",
                "Chief Data Officer", "CDO",
                "VP Engineering", "Vice President Engineering",
                "Head of AI", "Head of Machine Learning",
                "Director of Data Science", "AI Lead"
            ]
            
        roles_str = ", ".join(target_roles)
        
        prompt = f"""
        Find detailed information about key technology leaders at "{company_name}" in these roles: {roles_str}

        For each person found, provide:
        1. Full name and current title
        2. Email address (if publicly available)
        3. LinkedIn profile URL
        4. Professional background and previous companies
        5. Education and certifications
        6. Tenure at current company
        7. AI/ML experience and interests
        8. Recent publications, speaking engagements, or thought leadership
        9. Decision-making authority and influence level
        10. Communication style and preferences (technical vs business-focused)
        11. Recent achievements or projects they've worked on
        12. Pain points or challenges they've mentioned publicly

        Focus on finding contacts who would be involved in AI infrastructure decisions.
        Include their social media presence and any recent interviews or articles they've written.
        """
        
        try:
            response = ask_perplexity(
                question="Find detailed information about key technology leaders at the company.",
                context=prompt,
                model="sonar-pro",
                temp=0.1
            )
            
            # Handle both dict and string responses
            if isinstance(response, dict):
                return response.get('content', str(response))
            return str(response)
            
        except Exception as e:
            logger.error(f"Failed to research contacts for {company_name}: {e}")
            return f"Error researching contacts: {str(e)}"
            
    def analyze_competitor_landscape(self, company_name: str) -> str:
        """
        Analyze the competitive landscape to understand positioning
        """
        prompt = f"""
        Analyze the competitive landscape for "{company_name}" specifically related to AI infrastructure and compute needs:

        1. DIRECT COMPETITORS:
        - Who are their main competitors?
        - How do they compare in AI/ML capabilities?
        - What AI infrastructure do competitors use?

        2. AI INFRASTRUCTURE ANALYSIS:
        - What cloud providers and AI hardware do they likely use?
        - Current AI infrastructure limitations in their industry
        - Emerging AI use cases in their sector

        3. MARKET POSITIONING:
        - How advanced is their AI adoption compared to competitors?
        - Are they AI leaders or followers in their industry?
        - Competitive advantages they're seeking in AI

        4. CEREBRAS OPPORTUNITY:
        - How could Cerebras help them gain competitive advantage?
        - What use cases would be most compelling?
        - Urgency factors (competitive pressure, new initiatives)

        Focus on actionable insights for positioning Cerebras solutions.
        """
        
        try:
            response = ask_perplexity(
                question="Analyze the competitive landscape related to AI infrastructure and compute needs.",
                context=prompt,
                model="sonar-pro",
                temp=0.1
            )
            
            # Handle both dict and string responses
            if isinstance(response, dict):
                return response.get('content', str(response))
            return str(response)
            
        except Exception as e:
            logger.error(f"Failed to analyze competitors for {company_name}: {e}")
            return f"Error analyzing competitors: {str(e)}"
            
    def research_recent_news_and_initiatives(self, company_name: str) -> str:
        """
        Get recent news and AI initiatives
        """
        prompt = f"""
        Find the most recent news and developments about "{company_name}" in the last 6 months, focusing on:

        1. AI AND TECHNOLOGY INITIATIVES:
        - New AI projects or product launches
        - Technology partnerships or acquisitions
        - R&D investments in AI/ML
        - Digital transformation initiatives

        2. FUNDING AND GROWTH:
        - Recent funding rounds or financial news
        - Expansion plans
        - New market entries
        - Strategic partnerships

        3. LEADERSHIP CHANGES:
        - New executive hires (especially technology roles)
        - Organizational changes
        - Board additions

        4. INDUSTRY TRENDS:
        - How are industry trends affecting them?
        - Regulatory changes impacting their business
        - Market opportunities they're pursuing

        5. PAIN POINTS AND CHALLENGES:
        - Publicly stated challenges or problems
        - Competitive pressures
        - Technology limitations they've mentioned

        Provide specific dates, quotes, and sources where possible.
        Focus on information that could inform outreach timing and messaging.
        """
        
        try:
            response = ask_perplexity(
                question="Find recent news and developments about the company, focusing on AI and technology initiatives.",
                context=prompt,
                model="sonar-pro",
                temp=0.1
            )
            
            # Handle both dict and string responses
            if isinstance(response, dict):
                return response.get('content', str(response))
            return str(response)
            
        except Exception as e:
            logger.error(f"Failed to research recent news for {company_name}: {e}")
            return f"Error researching recent news: {str(e)}"
