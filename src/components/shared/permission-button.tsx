'use client';

import { I18Link } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { ReactNode } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export type PermissionButtonProps = Omit<ButtonProps, 'asChild' | 'disabled'> & {
  hasPermission: boolean;
  href?: I18Link;
  onClick?: () => void;
  children: ReactNode;
  disabledTooltip?: string;
};

export function PermissionButton({
  hasPermission,
  href,
  onClick,
  children,
  disabledTooltip,
  className,
  ...buttonProps
}: PermissionButtonProps) {
  const t = useTranslations('system.roleGate.errors');

  if (!hasPermission) {
    return (
      <Button
        {...buttonProps}
        disabled
        className={cn('opacity-50 cursor-not-allowed', className)}
        title={disabledTooltip || t('noPermission')}
        aria-disabled={true}>
        {children}
      </Button>
    );
  }

  if (href) {
    return (
      <Button {...buttonProps} asChild className={className}>
        <Link href={href}>{children}</Link>
      </Button>
    );
  }

  return (
    <Button {...buttonProps} onClick={onClick} className={className}>
      {children}
    </Button>
  );
}

