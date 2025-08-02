import { ApiService } from './base';
import { ApiStatusResponse, HelloWorldResponse, SampleDataResponse } from './types';

// API service for testing backend connection
export class TestApiService extends ApiService {
  // Test basic connectivity
  async getHelloWorld(): Promise<HelloWorldResponse> {
    return this.get<HelloWorldResponse>('/hello/');
  }

  // Check API status
  async getApiStatus(): Promise<ApiStatusResponse> {
    return this.get<ApiStatusResponse>('/status/');
  }

  // Get sample data
  async getSampleData(): Promise<SampleDataResponse> {
    return this.get<SampleDataResponse>('/data/');
  }
}

// Export singleton instance
export const testApi = new TestApiService();

// Ensure this file is treated as a module
export {};
