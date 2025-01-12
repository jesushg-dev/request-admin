import { ReactNode } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

import { useConfirm } from '@/components/confirm-dialog';

export interface MessageOptions {
  title?: ReactNode;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  customActions?: ReactNode;
  icon?: ReactNode;
  color?: string;
}

const useMessage = () => {
  const confirm = useConfirm();

  const showError = async (error: string, title = 'Error!') => {
    await confirm({
      title,
      description: error,
      confirmText: 'OK',
      cancelButton: null,
      icon: <XCircle className="size-4 text-red-600" />,
    });
  };

  const showLoading = async (loading: string, title = 'Loading...') => {
    await confirm({
      title,
      description: loading,
      confirmText: 'OK',
      cancelButton: null,
      icon: <Info className="size-4 text-blue-500" />,
    });
  };

  const showSuccess = async (success: string, title = 'Success!') => {
    await confirm({
      title,
      description: success,
      confirmText: 'OK',
      cancelButton: null,
      icon: <CheckCircle className="size-4 text-green-600" />,
    });
  };

  const showWarning = async (warning: string, title = 'Warning!') => {
    await confirm({
      title,
      description: warning,
      confirmText: 'OK',
      cancelButton: null,
      icon: <AlertTriangle className="size-4 text-yellow-500" />,
    });
  };

  const showConfirm = async (message: string, title = 'Confirm', options?: MessageOptions) => {
    const result = await confirm({
      title,
      description: message,
      confirmText: options?.confirmText || 'Yes',
      cancelText: options?.cancelText || 'No',
      icon: options?.icon || <AlertTriangle className="size-4 text-blue-500" />,
      //customActions: options?.customActions,
    });
    return result;
  };

  return {
    showError,
    showLoading,
    showSuccess,
    showWarning,
    showConfirm,
  };
};

export default useMessage;
