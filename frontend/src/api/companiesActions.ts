import { ApiService } from './base';

// Types for the company research API
export interface CompanyResearchRequest {
  company_name?: string;
  company_names?: string[];
  max_customers?: number;
}

export interface CompanyResult {
  company_id: number;
  company_name: string;
  fit_score: number;
  recommended_product: string;
  outreach_readiness: string;
}

export interface CompanyResearchResponse {
  success: boolean;
  message: string;
  auto_discovery?: boolean;
  results?: CompanyResult[];
  company_id?: number;
  company_name?: string;
  fit_score?: number;
  recommended_product?: string;
  outreach_readiness?: string;
}

export interface CompanyListResponse {
  success: boolean;
  count: number;
  companies: Company[];
}

export interface Company {
  id: number;
  name: string;
  website: string;
  description: string;
  industry: string;
  sector: string;
  headquarters_location: string;
  founded_year: number;
  employee_count: string;
  employee_count_exact: number;
  ipo_status: string;
  total_funding: string;
  revenue: string;
  business_model: string;
  key_products: string[];
  key_technologies: string[];
  competitors: string[];
  ai_ml_usage: string;
  current_ai_infrastructure: string;
  ai_initiatives: string[];
  ml_use_cases: string[];
  data_science_team_size: number;
  recommended_cerebras_product: string;
  cerebras_fit_score: number;
  cerebras_value_proposition: string;
  potential_use_cases: string[];
  implementation_timeline: string;
  estimated_budget_range: string;
  outreach_priority: string;
  outreach_readiness: string;
  research_quality_score: number;
  research_sources: string[];
  created_at: string;
  updated_at: string;
  contacts_count: number;
  primary_contacts_count: number;
  contacts: Contact[];
}

export interface Contact {
  id: number;
  name: string;
  title: string;
  email: string;
  linkedin_url: string;
  contact_priority: string;
  seniority_level: string;
  decision_maker: boolean;
  influence_level: string;
  technical_background: boolean;
  ai_ml_experience: string;
  personalization_score: string;
  research_quality_score: number;
}

export interface CustomerReportRequest {
  company_id?: number;
}

export interface CustomerReportResponse {
  success: boolean;
  company_id?: number;
  company_name?: string;
  report?: any; // Can be string or object
  report_content?: string; // The actual markdown content for editing
  report_id?: number; // ID of the saved report
  total_companies?: number;
  comprehensive_report?: any; // Can be string or object
  comprehensive_data?: any; // The structured data object
  has_existing_report?: boolean; // Whether an existing report was found
  generated_at?: string; // When the report was generated
  last_edited_at?: string; // When the report was last edited
  is_edited?: boolean; // Whether the report has been manually edited
  message?: string; // Optional message
}

// Report interfaces
export interface Report {
  id: number;
  title: string;
  report_type: 'company' | 'comprehensive';
  content: string;
  metadata: any;
  company_id?: number;
  company_name?: string;
  generated_at: string;
  last_edited_at: string;
  is_edited: boolean;
}

export interface ReportsListResponse {
  success: boolean;
  count: number;
  reports: Report[];
}

export interface ReportDetailResponse {
  success: boolean;
  report: Report;
}

export interface ReportUpdateRequest {
  title?: string;
  content?: string;
  metadata?: any;
}

export interface ReportUpdateResponse {
  success: boolean;
  message: string;
  report: Report;
}

// API service for company research operations
export class CompaniesApiService extends ApiService {
  
  // Research companies
  async researchCompanies(request: CompanyResearchRequest): Promise<CompanyResearchResponse> {
    return this.post('/companies/research/', request);
  }
  // Get list of companies with filtering
  async getCompanies(params?: {
    priority?: string;
    min_fit_score?: number;
    industry?: string;
    has_contacts?: boolean;
  }): Promise<CompanyListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.min_fit_score) queryParams.append('min_fit_score', params.min_fit_score.toString());
    if (params?.industry) queryParams.append('industry', params.industry);
    if (params?.has_contacts !== undefined) queryParams.append('has_contacts', params.has_contacts.toString());
    
    const url = `/companies/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.get(url);
  }
  // Generate customer report
  async generateCustomerReport(request: CustomerReportRequest): Promise<CustomerReportResponse> {
    return this.post('/companies/customer-report/', request);
  }

  // Delete company
  async deleteCompany(companyId: number): Promise<{ success: boolean; message: string }> {
    return this.delete(`/companies/${companyId}/`);
  }

  // Reports management
  async getReports(params?: {
    report_type?: string;
    company_id?: number;
    is_edited?: boolean;
  }): Promise<ReportsListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.report_type) queryParams.append('report_type', params.report_type);
    if (params?.company_id) queryParams.append('company_id', params.company_id.toString());
    if (params?.is_edited !== undefined) queryParams.append('is_edited', params.is_edited.toString());
    
    const url = `/companies/reports/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.get(url);
  }

  async getReport(reportId: number): Promise<ReportDetailResponse> {
    return this.get(`/companies/reports/${reportId}/`);
  }

  async updateReport(reportId: number, request: ReportUpdateRequest): Promise<ReportUpdateResponse> {
    return this.put(`/companies/reports/${reportId}/update/`, request);
  }

  async deleteReport(reportId: number): Promise<{ success: boolean; message: string }> {
    return this.delete(`/companies/reports/${reportId}/delete/`);
  }

  // Get existing report for a specific company
  async getCompanyReport(companyId: number): Promise<CustomerReportResponse> {
    return this.get(`/companies/${companyId}/report/`);
  }
}

// Export singleton instance
export const companiesApi = new CompaniesApiService();
