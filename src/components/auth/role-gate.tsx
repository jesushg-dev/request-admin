'use client';

import { useTranslations } from 'next-intl';

import { useCurrentRole } from '@/hooks/use-current-role';
import { FormError } from '@/components/prullenbak/form-error';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRole: string;
}

export const RoleGate = ({ children, allowedRole }: RoleGateProps) => {
  const t = useTranslations('system.roleGate');
  const features = useCurrentRole();

  if (!features?.includes(allowedRole)) {
    return <FormError message={t('errors.noFeature')} />;
  }

  return <>{children}</>;
};
