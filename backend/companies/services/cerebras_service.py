import json
import logging
import re
from typing import Dict, List, Optional, Any
from common.utils import ask_cerebras

logger = logging.getLogger(__name__)


def clean_json_response(content: str) -> str:
    """
    Clean JSON response by removing markdown code blocks, comments, and extra text
    """
    # Remove markdown code blocks
    content = re.sub(r'```json\s*', '', content)
    content = re.sub(r'```\s*$', '', content, flags=re.MULTILINE)
    content = re.sub(r'```', '', content)
    
    # Remove JSON comments more thoroughly
    # Remove // comments (but not URLs like https://)
    content = re.sub(r'(?<!:)//.*?(?=\n|$)', '', content, flags=re.MULTILINE)
    # Remove /* */ comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    
    # Find JSON object or array by looking for opening and closing braces/brackets
    # This handles cases where there might be extra text before/after JSON
    json_match = re.search(r'(\{.*\}|\[.*\])', content, re.DOTALL)
    if json_match:
        cleaned = json_match.group().strip()
        # Additional cleanup: remove any remaining inline comments
        cleaned = re.sub(r',\s*//.*?(?=\n|$)', ',', cleaned, flags=re.MULTILINE)
        cleaned = re.sub(r'"\s*//.*?(?=\n)', '"', cleaned, flags=re.MULTILINE)
        return cleaned
    
    # If no clear JSON object/array found, return cleaned content
    return content.strip()


class CerebrasService:
    """
    Service to interact with Cerebras API for parsing and structuring research data
    """
    
    def __init__(self):
        pass
    
    def generate_text(self, question: str, context: str, model: str = "deepseek-r1-distill-llama-70b", temp: float = 0.3) -> str:
        """
        Generate text using Cerebras API - generic text generation method
        """
        try:
            content = ask_cerebras(
                question=question,
                context=context,
                model=model,
                temp=temp
            )
            return content
        except Exception as e:
            logger.error(f"Failed to generate text with Cerebras: {e}")
            return f"Error generating text: {str(e)}"
        
    def parse_company_research(self, research_text: str, company_name: str) -> Dict[str, Any]:
        """
        Parse unstructured company research into structured JSON format
        """
        prompt = f"""
        Parse the following research about "{company_name}" into a structured JSON format. 
        Extract all available information and organize it according to this schema:

        {{
            "basic_info": {{
                "name": "string",
                "website": "string",
                "description": "string",
                "industry": "string", 
                "sector": "string",
                "headquarters_location": "string",
                "founded_year": "integer or null",
                "employee_count": "string (range like '1001-5000')",
                "employee_count_exact": "integer or null"
            }},
            "financial_info": {{
                "ipo_status": "string (Public/Private/Acquired)",
                "stock_symbol": "string or null",
                "market_cap": "string or null",
                "last_funding_round": "string or null",
                "last_funding_amount": "string or null", 
                "last_funding_date": "string (YYYY-MM-DD) or null",
                "total_funding": "string or null",
                "valuation": "string or null",
                "revenue": "string or null",
                "revenue_growth": "string or null"
            }},
            "business_intelligence": {{
                "business_model": "string",
                "key_products": ["array of product names"],
                "key_technologies": ["array of technologies"],
                "competitors": ["array of competitor names"]
            }},
            "ai_ml_info": {{
                "ai_ml_usage": "string describing current AI/ML usage",
                "current_ai_infrastructure": "string describing current setup",
                "ai_initiatives": ["array of AI initiatives"],
                "ml_use_cases": ["array of ML use cases"],
                "data_science_team_size": "string or null"
            }},
            "cerebras_analysis": {{
                "recommended_product": "string (name of most suitable Cerebras product)",
                "fit_score": "integer (1-10 scale)",
                "value_proposition": "string explaining why Cerebras would be valuable",
                "potential_use_cases": ["array of specific use cases"],
                "implementation_timeline": "string (e.g., '3-6 months')",
                "estimated_budget_range": "string or null"
            }},
            "research_metadata": {{
                "quality_score": "integer (1-10 scale based on information completeness)",
                "sources": ["array of information sources mentioned"],
                "notes": "string with additional context"
            }}
        }}

        Research Text:
        {research_text}

        Please extract all available information and fill in the JSON structure. 
        Use null for missing information. Be precise with data types.
        For the Cerebras analysis, match the company's needs to the most appropriate Cerebras offering from:
        - Cerebras AI Inference (for real-time, low-latency AI applications)
        - Cerebras Condor Galaxy (for large-scale model training)
        - Cerebras Inference API (for developers integrating AI)
        - Cerebras Model Hosting (for managed training/hosting)
        - Cerebras Datacenter Rental (for dedicated compute)
        - Cerebras Hardware Sales (for on-premises deployment)

        Return only valid JSON, no additional text.
        """
        try:
            content = ask_cerebras(
                question="Extract and structure the research data according to the JSON schema provided.",
                context=prompt,
                model="deepseek-r1-distill-llama-70b",
                temp=0.1
            )
            
            # Clean and parse as JSON
            cleaned_content = clean_json_response(content)
            return json.loads(cleaned_content)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Cerebras response as JSON: {e}")
            logger.error(f"Response content: {content}")
            # Return a basic structure with the raw content
            return {
                "basic_info": {"name": company_name},
                "error": "Failed to parse structured data",
                "raw_content": content
            }
        except Exception as e:
            logger.error(f"Failed to parse company research with Cerebras: {e}")
            return {
                "basic_info": {"name": company_name},
                "error": str(e)
            }
            
    def parse_contact_research(self, research_text: str, company_name: str) -> List[Dict[str, Any]]:
        """
        Parse contact research into structured format
        """
        prompt = f"""
        Parse the following contact research for "{company_name}" into a structured JSON array format.
        Extract information about each contact person found:

        [
            {{
                "basic_info": {{
                    "first_name": "string",
                    "last_name": "string", 
                    "full_name": "string",
                    "title": "string",
                    "department": "string or null",
                    "seniority_level": "string (c_level/vp/director/manager/senior/mid/junior/other)"
                }},
                "contact_info": {{
                    "email": "string or null",
                    "phone": "string or null",
                    "linkedin_url": "string or null",
                    "twitter_handle": "string or null"
                }},
                "professional_background": {{
                    "tenure_at_company": "string or null",
                    "previous_companies": ["array of company names"],
                    "education": ["array of education details"],
                    "certifications": ["array of certifications"]
                }},
                "decision_making": {{
                    "decision_maker": "boolean",
                    "influence_level": "string (high/medium/low/unknown)",
                    "budget_authority": "boolean",
                    "technical_background": "boolean"
                }},
                "ai_ml_profile": {{
                    "ai_ml_experience": "string describing their AI/ML background",
                    "ai_ml_interests": ["array of AI/ML interests"],
                    "published_papers": ["array of paper titles"],
                    "conference_speaking": ["array of speaking engagements"]
                }},
                "personalization": {{
                    "communication_style": "string (technical/business/mixed/unknown)",
                    "interests": ["array of professional interests"],
                    "pain_points": ["array of challenges they face"],
                    "recent_achievements": ["array of recent accomplishments"]
                }},
                "outreach_profile": {{
                    "contact_priority": "string (primary/secondary/tertiary)",
                    "preferred_contact_method": "string (email/linkedin/phone/unknown)"
                }},
                "research_quality": {{
                    "quality_score": "integer (1-10 scale)",
                    "data_sources": ["array of sources"]
                }}
            }}
        ]

        Research Text:
        {research_text}

        Extract all contacts found in the research. Use boolean true/false appropriately.
        Set contact_priority to "primary" for C-level and VP roles, "secondary" for directors, "tertiary" for others.
        Return only valid JSON array, no additional text.
        """
        
        try:
            content = ask_cerebras(
                question="Extract and structure the contact research data according to the JSON schema provided.",
                context=prompt,
                model="deepseek-r1-distill-llama-70b",
                temp=0.1
            )
            
            cleaned_content = clean_json_response(content)
            parsed_data = json.loads(cleaned_content)
            
            # Ensure we return a list
            if isinstance(parsed_data, list):
                return parsed_data
            elif isinstance(parsed_data, dict):
                # If we got a single contact as dict, wrap it in a list
                return [parsed_data]
            else:
                logger.error(f"Unexpected parsed data type: {type(parsed_data)}")
                return []
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Cerebras contact response as JSON: {e}")
            logger.error(f"Content that failed to parse: {content[:500]}...")
            return []
        except Exception as e:
            logger.error(f"Failed to parse contact research with Cerebras: {e}")
            return []
            
    def generate_personalized_email_content(self, company_data: Dict[str, Any], contact_data: Dict[str, Any], company_offerings: Dict[str, Any]) -> str:
        """
        Generate personalized email content for outreach
        """
        prompt = f"""
        Generate a highly personalized cold outreach email for a Cerebras sales representative to send to a potential customer.

        COMPANY INFORMATION:
        {json.dumps(company_data, indent=2)}

        CONTACT INFORMATION:
        {json.dumps(contact_data, indent=2)}

        CEREBRAS OFFERINGS:
        {json.dumps(company_offerings, indent=2)}

        REQUIREMENTS:
        1. Subject line that's compelling and personal
        2. Opening that shows you've done your research
        3. Value proposition specific to their company's needs
        4. Reference to recent company news/initiatives if available
        5. Specific Cerebras product recommendation with benefits
        6. Soft call-to-action (not pushy)
        7. Professional but conversational tone
        8. Keep to 150-200 words maximum

        TONE:
        - Professional but approachable
        - Shows genuine interest in their business
        - Consultative, not sales-y
        - Demonstrates technical understanding if contact is technical

        Generate the email in this format:
        Subject: [subject line]

        Hi [first name],

        [email body]

        Best regards,
        [Sales Rep Name]
        Cerebras Systems
        """
        try:
            content = ask_cerebras(
                question="Generate a personalized cold outreach email according to the requirements provided.",
                context=prompt,
                model="deepseek-r1-distill-llama-70b",
                temp=0.3
            )
            
            return content
            
        except Exception as e:
            logger.error(f"Failed to generate email content: {e}")
            return f"Error generating email content: {str(e)}"
