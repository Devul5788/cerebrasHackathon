import { useState, useCallback } from 'react';
import { ApiState } from './types';

// Custom hook for managing API state
export function useApiState<T>(): [
  ApiState<T>,
  (asyncFn: () => Promise<T>) => Promise<void>
] {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setState((prev: ApiState<T>) => ({ ...prev, loading: true, error: null }));
    
    try {      const result = await asyncFn();
      setState({ data: result, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  }, []);

  return [state, execute];
}

export default useApiState;
