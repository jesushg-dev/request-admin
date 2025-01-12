import { locales, redirect } from '@/i18n/routing';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';

import { extractTenantId } from '@/lib/utils';

export const getTenantIdFromUrl = (url: string, redirectOnMissing: boolean = true): string => {
  const tenantId = extractTenantId(url, locales);

  if (!tenantId && redirectOnMissing) {
    redirect({
      href: DEFAULT_LOGIN_REDIRECT,
      //todo: find a way to get the locale from the url
      locale: locales[0],
    });
  }

  return tenantId ?? '';
};
