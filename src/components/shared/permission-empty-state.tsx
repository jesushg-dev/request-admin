'use client';

import { useTranslations } from 'next-intl';

import EmptyState from './empty-state';

export type PermissionEmptyStateProps = {
  title?: string;
  description?: string;
  className?: string;
};

export function PermissionEmptyState({ title, description, className }: PermissionEmptyStateProps) {
  const t = useTranslations('system.roleGate.errors');

  return (
    <div className="flex flex-1 items-center justify-center">
      <EmptyState title={title ?? t('noPermission')} description={description ?? t('noPermissionDescription')} className={className} />
    </div>
  );
}
