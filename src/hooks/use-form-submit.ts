import { useCallback } from 'react';
import { useRouter, ValidLinkProps } from '@/i18n/routing';
import { type DefaultError, type UseMutateAsyncFunction } from '@tanstack/react-query';

import useMessage from '@/lib/message';

interface FormSubmitProps<TData = unknown> {
  errorMessage?: string | ((error: unknown) => string);
  loadingMessage?: string | (() => string);
  successMessage?: string | ((data?: TData) => string);
  redirectUrl?: ValidLinkProps | ((data: TData) => ValidLinkProps);
  confirmTitle?: string;
  confirmMessage?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const useFormSubmit = <TData = unknown, TError = DefaultError, TVariables = unknown, TContext = unknown>(
  mutateAsync: UseMutateAsyncFunction<TData, TError, TVariables, TContext>,
  {
    redirectUrl,
    confirmButtonText = 'Yes, submit it!',
    cancelButtonText = 'No, cancel!',
    confirmTitle = 'Submit your information',
    confirmMessage = 'Please confirm to proceed.',
    successMessage = 'Request successful.',
    errorMessage = 'Request failed.',
  }: FormSubmitProps<TData>
) => {
  const router = useRouter();
  const message = useMessage();

  const getRedirectUrl = useCallback(
    (data: TData): ValidLinkProps | undefined => {
      if (!redirectUrl) return;

      switch (typeof redirectUrl) {
        case 'string':
          return redirectUrl;
        case 'function':
          return redirectUrl(data);
        case 'object':
          return redirectUrl;
        default:
          throw new Error('Invalid redirectUrl type');
      }
    },
    [redirectUrl]
  );

  const processMessage = useCallback((messageOption: string | ((data?: TData) => string) | undefined, data?: TData) => {
    if (typeof messageOption === 'function') {
      return messageOption(data);
    }
    return messageOption;
  }, []);

  const submitForm = useCallback(
    async (data: TVariables) => {
      try {
        const isConfirmed = await message.showConfirm(confirmMessage, confirmTitle, {
          confirmText: confirmButtonText,
          cancelText: cancelButtonText,
        });

        if (!isConfirmed) return;

        const result = await mutateAsync(data);

        const resultMessage = processMessage(successMessage, result);
        if (resultMessage) {
          await message.showSuccess(resultMessage);
        }

        const url = getRedirectUrl(result);
        if (url) {
          if (typeof url === 'object') {
            router.push({ ...url, query: {} });
          } else {
            router.push(url);
          }
        }
      } catch {
        const resultMessage = processMessage(errorMessage) || 'Request failed.';
        await message.showError(resultMessage);
      }
    },
    [message, confirmMessage, confirmTitle, confirmButtonText, cancelButtonText, mutateAsync, processMessage, successMessage, getRedirectUrl, router, errorMessage]
  );

  return submitForm;
};

export default useFormSubmit;
