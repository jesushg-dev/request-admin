import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MySwal, { triggerError } from '@/services/lib/message';
import { type DefaultError, type UseMutateAsyncFunction } from '@tanstack/react-query';

// Update the interface to allow messages to be a string or a function that returns a string
interface FormSubmitProps<TData = unknown> {
  errorMessage?: string | ((error: unknown) => string);
  loadingMessage?: string | (() => string);
  successMessage?: string | ((data?: TData) => string);
  redirectUrl?: string | { pathname: string; query: Record<string, string> } | ((data: TData) => string);
  confirmTitle?: string;
  confirmMessage?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const useSubmit = <TData = unknown, TError = DefaultError, TVariables = unknown, TContext = unknown>(
  mutateAsync: UseMutateAsyncFunction<TData, TError, TVariables, TContext>,
  opts?: FormSubmitProps<TData>
) => {
  const router = useRouter();

  // Dedicated function for determining the redirect URL
  const getRedirectUrl = (data: TData): string | undefined => {
    const { redirectUrl } = opts || {};
    if (!redirectUrl) return;

    switch (typeof redirectUrl) {
      case 'string':
        return redirectUrl;
      case 'function':
        return redirectUrl(data);
      case 'object':
        const queryString = new URLSearchParams(redirectUrl.query).toString();
        return `${redirectUrl.pathname}?${queryString}`;
      default:
        throw new Error('Invalid redirectUrl type');
    }
  };

  // Function to process message options
  const processMessage = (messageOption: string | ((data?: TData) => string) | undefined, data?: TData) => {
    if (typeof messageOption === 'function') {
      return messageOption(data);
    }
    return messageOption;
  };

  const submitForm = useCallback(
    async (data: TVariables) => {
      try {
        await MySwal.fire({
          title: opts?.confirmTitle || 'Submit your information',
          text: opts?.confirmMessage || 'Please confirm to proceed.',
          icon: 'warning',
          showCancelButton: true,
          cancelButtonText: opts?.cancelButtonText || 'No, cancel!',
          confirmButtonText: opts?.confirmButtonText || 'Yes, submit it!',
          showLoaderOnConfirm: true,
          preConfirm: async () => {
            try {
              const result = await mutateAsync(data); // Execute your async operation here
              return result; // This result will be passed to the then() block
            } catch (error) {
              MySwal.showValidationMessage(`Request failed: ${JSON.stringify(error)}`);
              return false;
            }
          },
          allowOutsideClick: () => !MySwal.isLoading(),
        }).then(async (result) => {
          if (result.value) {
            // Success! Do something with the result
            await MySwal.fire({
              title: 'Success!',
              text: 'Your information has been submitted.',
              icon: 'success',
            });

            // Redirect if needed, using the result from mutateAsync
            const url = getRedirectUrl(result.value as TData);
            if (url) {
              router.push(url);
            }
          }
        });
      } catch (error: any) {
        const message = opts?.errorMessage ? processMessage(opts.errorMessage, error) : JSON.stringify(error);
        await triggerError(message || 'Request Failed');
      }
    },
    [mutateAsync, router, opts]
  );

  return submitForm;
};

export default useSubmit;
