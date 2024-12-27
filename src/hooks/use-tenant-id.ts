import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { locales, useRouter } from '@/i18n/routing';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';

import { extractTenantId } from '@/lib/utils';

const useTenantId = (redirectOnMissing: boolean = true): string => {
  const pathname = usePathname();
  const router = useRouter();

  const tenantId = pathname ? extractTenantId(pathname, locales) : undefined;

  useEffect(() => {
    if (!tenantId && redirectOnMissing) {
      router.replace(DEFAULT_LOGIN_REDIRECT);
    }
  }, [tenantId, redirectOnMissing, router]);

  return tenantId ?? '';
};

export default useTenantId;
