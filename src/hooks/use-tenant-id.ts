import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { locales, useRouter } from '@/i18n/routing';

import { extractTenantId } from '@/lib/utils';

const useTenantId = (redirectOnMissing: boolean = true): string => {
  const pathname = usePathname();
  const router = useRouter();

  const tenantId = pathname ? extractTenantId(pathname, locales) : undefined;

  useEffect(() => {
    if (!tenantId && redirectOnMissing) {
      router.replace('/tenants');
    }
  }, [tenantId, redirectOnMissing, router]);

  return tenantId ?? '';
};

export default useTenantId;
