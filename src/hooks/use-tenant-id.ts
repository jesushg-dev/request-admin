import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { locales, useRouter } from '@/i18n/routing';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';

import { extractTenantId } from '@/lib/utils';

/**
 * @deprecated Prefer using `useTenantContext()` from `components/hoc/tenant-provider.tsx`
 * to access the tenant ID in your components.
 * This hook is primarily for legacy support and will be removed in future versions.
 * It extracts the tenant ID from the current pathname and optionally redirects to a login page if the tenant ID is missing.
 */
const useTenantId = (redirectOnMissing: boolean = true): string => {
  const router = useRouter();
  const pathname = usePathname();

  const tenantId = pathname ? extractTenantId(pathname, locales) : undefined;

  useEffect(() => {
    if (!tenantId && redirectOnMissing) {
      router.replace(DEFAULT_LOGIN_REDIRECT);
    }
  }, [tenantId, redirectOnMissing, router]);

  return tenantId ?? '';
};

export default useTenantId;
