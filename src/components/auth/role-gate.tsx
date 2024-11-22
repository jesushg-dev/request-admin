'use client';

import { useCurrentRole } from '@/hooks/use-current-role.hook';
import { FormError } from '@/components/form-error';
import { useTranslations } from 'next-intl';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRole: string;
}

export const RoleGate = ({ children, allowedRole }: RoleGateProps) => {
  const t = useTranslations('system.roleGate');
  const permissions = useCurrentRole();

  if (!permissions?.includes(allowedRole)) {
    return <FormError message={t('errors.noPermission')} />;
  }

  return <>{children}</>;
};
