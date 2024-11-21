'use client';

import { useCurrentRole } from '@/hooks/use-current-role.hook';
import { FormError } from '@/components/form-error';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRole: string;
}

export const RoleGate = ({ children, allowedRole }: RoleGateProps) => {
  const permissions = useCurrentRole();

  if (permissions?.includes(allowedRole)) {
    return <FormError message="You do not have permission to view this content!" />;
  }

  return <>{children}</>;
};
