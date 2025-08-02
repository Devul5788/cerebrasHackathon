import { ApiService } from './base';
// TODO: Import types when implemented

// API service for external integrations (Clearbit, Crunchbase, LinkedIn, etc.)
export class IntegrationsApiService extends ApiService {
  // External API integration endpoints
  // TODO: Implement integration endpoints
}

// Export singleton instance
export const integrationsApi = new IntegrationsApiService();
