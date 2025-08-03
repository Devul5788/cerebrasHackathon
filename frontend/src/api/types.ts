// Common types used across the application

export interface ApiData {
  id: number;
  title: string;
  description: string;
  icon?: string;
}

export interface SampleDataResponse {
  data: ApiData[];
  count: number;
  status: string;
}

export interface ApiStatusResponse {
  status: string;
  version: string;
  message: string;
}

export interface HelloWorldResponse {
  message: string;
  status: string;
  timestamp: string;
}

// Component props types
export interface DataCardProps {
  data: ApiData;
}

export interface LoadingSpinnerProps {
  message?: string;
}

export interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}

// API state management
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Navigation types
export interface Route {
  path: string;
  component: React.ComponentType;
  title: string;
}

// Outreach types
export interface EmailTemplate {
  id: number;
  name: string;
  offering: string;
  offering_display: string;
  template_type: 'initial' | 'follow_up';
  is_default: boolean;
  description: string;
  subject_line: string;
  content: string;
  created_at: string;
  placeholder_variables: string[];
}

export interface EmailCampaign {
  id: number;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  is_active: boolean;
  total_contacts?: number;
  sent_count?: number;
  pending_count?: number;
}

export interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  title: string;
  email: string;
  seniority_level: string;
  seniority_display: string;
  contact_priority: string;
  priority_display: string;
  decision_maker: boolean;
  technical_background: boolean;
  influence_level: string;
  company: {
    id: number;
    name: string;
    industry: string;
    employee_count: string;
    recommended_product: string;
  };
  personalization_score: number;
  last_contacted: string | null;
}

export interface EmailDraft {
  id: number;
  contact: {
    id: number;
    full_name: string;
    title: string;
    email: string;
    company_name: string;
  };
  campaign?: {
    id: number;
    name: string;
  };
  template: {
    id: number;
    name: string;
    offering_display: string;
  };
  subject_line: string;
  content: string;
  status: string;
  status_display: string;
  recommended_offering: string;
  personalization_score: number;
  personalization_data?: Record<string, any>;
  sent_date: string | null;
  follow_up_date: string | null;
  follow_up_scheduled: boolean;
  follow_up_template: {
    id: number;
    name: string;
  } | null;
  follow_up_sent: boolean;
  created_at: string;
}

// API Response types
export interface EmailTemplatesResponse {
  success: boolean;
  templates: EmailTemplate[];
  error?: string;
}

export interface EmailCampaignsResponse {
  success: boolean;
  campaigns: EmailCampaign[];
  error?: string;
}

export interface ContactsResponse {
  success: boolean;
  contacts: Contact[];
  error?: string;
}

export interface EmailDraftsResponse {
  success: boolean;
  campaign: {
    id: number;
    name: string;
    description: string;
  };
  drafts: EmailDraft[];
  error?: string;
}

export interface DraftGenerationResponse {
  success: boolean;
  drafts: EmailDraft[];
  errors: Array<{
    contact_id: number;
    error: string;
  }>;
  generated_count: number;
  error_count: number;
  error?: string;
}

export interface EmailSendResponse {
  success: boolean;
  message: string;
  draft?: {
    id: number;
    status: string;
    sent_date: string;
    follow_up_date: string;
  };
  error?: string;
}

export interface BulkEmailSendResponse {
  success: boolean;
  message: string;
  sent_drafts: Array<{
    draft_id: number;
    contact_name: string;
    company_name: string;
    sent_date: string;
  }>;
  errors: Array<{
    draft_id: number;
    error: string;
  }>;
  sent_count: number;
  error_count: number;
  error?: string;
}
