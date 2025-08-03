import React from 'react';
import { LoadingSpinnerProps } from '../../api/types';

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      <span className="ml-2 text-gray-600 dark:text-gray-300">{message}</span>
    </div>
  );
};

export default LoadingSpinner;
