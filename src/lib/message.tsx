import React, { ReactNode, useEffect, useState } from 'react';
import { QuestionMarkIcon } from '@radix-ui/react-icons';
import { AlertTriangle, CheckCircle, Info, KeyRoundIcon, XCircle } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import { useConfirm } from '@/components/custom-ui/confirm-dialog';

export interface MessageOptions {
  title?: ReactNode;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  customActions?: ReactNode;
  icon?: ReactNode;
  color?: string;
}

interface PasswordConfirmContentProps {
  onValueChange: (disabled: boolean, value: string) => void;
}

const PasswordConfirmContent: React.FC<PasswordConfirmContentProps> = ({ onValueChange }) => {
  const [password, setPassword] = useState('');

  useEffect(() => {
    onValueChange(password.trim() === '', password);
  }, [password, onValueChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return <Input type="password" value={password} onChange={handleInputChange} placeholder="Ingrese su contraseña" autoComplete="current-password" className="focus-visible:ring-primary" />;
};

const VerificationCode: React.FC<PasswordConfirmContentProps> = ({ onValueChange }) => {
  const [code, setCode] = useState('');

  useEffect(() => {
    onValueChange(code.trim() === '', code);
  }, [code, onValueChange]);

  return (
    <InputOTP maxLength={6} value={code} onChange={setCode}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
};

const getConfirmationConfig = (contentSlot: React.JSX.Element) => ({
  icon: <KeyRoundIcon className="size-5 text-blue-500" />,
  alertDialogTitle: {
    className: 'flex items-center gap-2 font-semibold',
  },
  contentSlot: contentSlot,
  confirmButton: {
    variant: 'default' as const,
    className: 'bg-blue-600 hover:bg-blue-700 text-white',
    label: 'Verificar',
  },
  cancelButton: {
    variant: 'outline' as const,
    className: 'text-muted-foreground hover:bg-accent',
    label: 'Cancelar',
  },
  alertDialogContent: {
    className: 'max-w-md space-y-4',
  },
});

const useMessage = () => {
  const confirm = useConfirm();

  const error = async (message: string, title = 'Error!') => {
    return await confirm({
      title,
      description: message,
      confirmText: 'OK',
      cancelButton: null,
      icon: <XCircle className="size-5 text-red-500" />,
    });
  };

  const loading = async (message: string, title = 'Cargando...') => {
    return await confirm({
      title,
      description: message,
      confirmText: 'OK',
      cancelButton: null,
      icon: <Info className="size-5 text-blue-500" />,
    });
  };

  const success = async (message: string, title = 'Éxito!') => {
    return await confirm({
      title,
      description: message,
      confirmText: 'OK',
      cancelButton: null,
      icon: <CheckCircle className="size-5 text-green-500" />,
    });
  };

  const warning = async (message: string, title = 'Advertencia!') => {
    return await confirm({
      title,
      description: message,
      confirmText: 'OK',
      cancelButton: null,
      icon: <AlertTriangle className="size-5 text-yellow-500" />,
    });
  };

  const showConfirm = async (message: string, options: Partial<Pick<MessageOptions, 'title' | 'confirmText' | 'cancelText'>> = {}) => {
    return await confirm({
      title: options.title ?? 'Confirmar',
      description: message,
      confirmText: 'OK',
      cancelText: 'Cancelar',
      icon: <QuestionMarkIcon className="size-5 text-blue-500" />,
      ...options,
    });
  };

  const password = async (message: string, options: Partial<Pick<MessageOptions, 'title' | 'confirmText' | 'cancelText'>> = {}) => {
    let inputValue = '';

    const confirmConfig = getConfirmationConfig(
      <PasswordConfirmContent
        onValueChange={(disabled, value) => {
          inputValue = value;
          confirm.updateConfig((prev) => ({
            ...prev,
            confirmButton: { ...prev.confirmButton, disabled },
          }));
        }}
      />
    );

    const isConfirmed = await confirm({
      description: message,
      title: 'Autenticación requerida',
      confirmText: 'Verificar',
      cancelText: 'Cancelar',
      ...confirmConfig,
      ...options,
    });

    return { confirmed: isConfirmed, password: inputValue };
  };

  const verificationCode = async (message: string, options: Partial<Pick<MessageOptions, 'title' | 'confirmText' | 'cancelText'>> = {}) => {
    let inputValue = '';

    const confirmConfig = getConfirmationConfig(
      <VerificationCode
        onValueChange={(disabled, value) => {
          inputValue = value;
          confirm.updateConfig((prev) => ({
            ...prev,
            confirmButton: { ...prev.confirmButton, disabled },
          }));
        }}
      />
    );

    const isConfirmed = await confirm({
      description: message,
      title: 'Código de verificación',
      confirmText: 'Verificar',
      cancelText: 'Cancelar',
      ...confirmConfig,
      ...options,
    });

    return { confirmed: isConfirmed, code: inputValue };
  };

  return { error, loading, success, warning, password, confirm: showConfirm, verificationCode };
};

export default useMessage;
