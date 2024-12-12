import React from 'react';
import { QueryError } from '@zenstackhq/tanstack-query/runtime-v5';

interface ErrorRetryFallbackProps {
  error: QueryError;
  onRetry: () => void;
  buttonText?: string;
  containerStyles?: string;
  messageStyles?: string;
  buttonStyles?: string;
  buttonHoverStyles?: string;
}

const ErrorRetryFallback: React.FC<ErrorRetryFallbackProps> = ({
  error,
  onRetry,
  buttonText = 'Retry',
  containerStyles = '',
  messageStyles = 'text-red-600 dark:text-red-400',
  buttonStyles = 'bg-primary text-white',
  buttonHoverStyles = 'bg-opacity-90',
}) => {
  return (
    <div className={`p-6 text-center ${containerStyles}`}>
      <p className={`text-lg font-medium ${messageStyles}`}>{error.message ? error.message : 'An error occurred while fetching data.'}</p>
      <button
        onClick={onRetry}
        className={`mt-4 rounded px-4 py-2 transition ease-in-out ${buttonStyles}`}
        style={{ transition: 'background-color 0.3s' }}
        onMouseEnter={(e) => e.currentTarget.classList.add(buttonHoverStyles)}
        onMouseLeave={(e) => e.currentTarget.classList.remove(buttonHoverStyles)}>
        {buttonText}
      </button>
    </div>
  );
};

export default ErrorRetryFallback;
