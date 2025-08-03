import { ApiService } from './base';
import {
  EmailTemplate,
  EmailCampaign,
  Contact,
  EmailDraft,
  EmailTemplatesResponse,
  EmailCampaignsResponse,
  ContactsResponse,
  EmailDraftsResponse,
  DraftGenerationResponse,
  EmailSendResponse,
  BulkEmailSendResponse
} from './types';

// API service for email outreach operations
export class OutreachApiService extends ApiService {
  
  // Email Template Management
  async getEmailTemplates(): Promise<EmailTemplatesResponse> {
    return this.get('/outreach/templates/');
  }

  async createEmailTemplate(templateData: Partial<EmailTemplate>): Promise<{ success: boolean; template: EmailTemplate; error?: string }> {
    return this.post('/outreach/templates/', templateData);
  }

  async getEmailTemplate(templateId: number): Promise<{ success: boolean; template: EmailTemplate; error?: string }> {
    return this.get(`/outreach/templates/${templateId}/`);
  }

  async updateEmailTemplate(templateId: number, templateData: Partial<EmailTemplate>): Promise<{ success: boolean; template: EmailTemplate; error?: string }> {
    return this.put(`/outreach/templates/${templateId}/`, templateData);
  }

  async deleteEmailTemplate(templateId: number): Promise<{ success: boolean; message: string; error?: string }> {
    return this.delete(`/outreach/templates/${templateId}/`);
  }

  // Email Campaign Management
  async getEmailCampaigns(): Promise<EmailCampaignsResponse> {
    return this.get('/outreach/campaigns/');
  }

  async createEmailCampaign(campaignData: Partial<EmailCampaign>): Promise<{ success: boolean; campaign: EmailCampaign; error?: string }> {
    return this.post('/outreach/campaigns/', campaignData);
  }

  async getEmailCampaign(campaignId: number): Promise<{ success: boolean; campaign: EmailCampaign; error?: string }> {
    return this.get(`/outreach/campaigns/${campaignId}/`);
  }

  async updateEmailCampaign(campaignId: number, campaignData: Partial<EmailCampaign>): Promise<{ success: boolean; campaign: EmailCampaign; error?: string }> {
    return this.put(`/outreach/campaigns/${campaignId}/`, campaignData);
  }

  async deleteEmailCampaign(campaignId: number): Promise<{ success: boolean; message: string; error?: string }> {
    return this.delete(`/outreach/campaigns/${campaignId}/`);
  }

  // Contact Selection
  async getContacts(filters?: {
    company_id?: number;
    priority?: string;
    seniority?: string;
  }): Promise<ContactsResponse> {
    const params = new URLSearchParams();
    if (filters?.company_id) params.append('company_id', filters.company_id.toString());
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.seniority) params.append('seniority', filters.seniority);
    
    const queryString = params.toString();
    return this.get(`/outreach/contacts/${queryString ? `?${queryString}` : ''}`);
  }

  // Email Draft Management
  async generateEmailDrafts(campaignId: number, contactIds: number[]): Promise<DraftGenerationResponse> {
    return this.post('/outreach/drafts/generate/', {
      campaign_id: campaignId,
      contact_ids: contactIds
    });
  }

  async getCampaignDrafts(campaignId: number): Promise<EmailDraftsResponse> {
    return this.get(`/outreach/campaigns/${campaignId}/drafts/`);
  }

  async getEmailDraft(draftId: number): Promise<{ success: boolean; draft: EmailDraft; error?: string }> {
    return this.get(`/outreach/drafts/${draftId}/`);
  }

  async updateEmailDraft(draftId: number, draftData: { subject_line?: string; content?: string; status?: string }): Promise<{ success: boolean; message: string; draft: Partial<EmailDraft>; error?: string }> {
    return this.put(`/outreach/drafts/${draftId}/`, draftData);
  }

  // Email Sending
  async sendEmail(draftId: number): Promise<EmailSendResponse> {
    return this.post(`/outreach/drafts/${draftId}/send/`, {});
  }

  async sendBulkEmails(draftIds: number[]): Promise<BulkEmailSendResponse> {
    return this.post('/outreach/send-bulk/', {
      draft_ids: draftIds
    });
  }
}

// Export singleton instance
export const outreachApi = new OutreachApiService();
