import { redirect } from 'next/navigation';
import { locales } from '@/i18n/routing';

import { extractTenantId } from '@/lib/utils';

export const getTenantIdFromUrl = (url: string, redirectOnMissing: boolean = true): string => {
  const tenantId = extractTenantId(url, locales);

  if (!tenantId && redirectOnMissing) {
    redirect('/tenants');
  }

  return tenantId ?? '';
};
