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
