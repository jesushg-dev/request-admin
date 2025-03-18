'use server';

import { locales, redirect } from '@/i18n/routing';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-server';

import { extractTenantId } from '@/lib/utils';
import { TenantFormValues } from '@/components/common/tenant/tenant-form';

class UserNotFoundErr extends Error {}

export const getTenantIdFromUrl = async (url: string, redirectOnMissing: boolean = true): Promise<string> => {
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

export const getTenantInformation = async (tenantId: string): Promise<TenantFormValues> => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  const response = await db.tenant.findFirst({
    where: {
      id: tenantId,
    },
    select: {
      name: true,
      slug: true,
      logo: true,
      websiteUrl: true,
      title: true,
      description: true,
      primaryColor: true,
      secondaryColor: true,
      contactEmail: true,
      contactPhone: true,
      address: true,
    },
  });

  if (!response) {
    throw new Error('Tenant not found');
  }

  return {
    ...response,
    slug: response.slug ?? '',
    logo: response.logo ?? undefined,
    websiteUrl: response.websiteUrl ?? undefined,
    title: response.title ?? undefined,
    description: response.description ?? undefined,
    primaryColor: response.primaryColor ?? undefined,
    secondaryColor: response.secondaryColor ?? undefined,
    contactEmail: response.contactEmail ?? undefined,
    contactPhone: response.contactPhone ?? undefined,
    address: response.address ?? undefined,
  };
};
