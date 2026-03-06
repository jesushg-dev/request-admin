'use server';

import { headers } from 'next/headers';
import { locales, redirect } from '@/i18n/routing';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { auth, currentSession } from '@/server/auth-server';
import { db } from '@/server/db-client';

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
      themeColors: true,
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
    themeColors: response.themeColors ?? undefined,
    contactEmail: response.contactEmail ?? undefined,
    contactPhone: response.contactPhone ?? undefined,
    address: response.address ?? undefined,
  };
};

/**
 * Creates a new tenant with all necessary initialization:
 * - Creates the tenant via Better Auth with all additional fields
 * - Module initialization is handled in the afterCreateOrganization hook
 *
 * @param data Tenant creation data including all form fields
 * @returns The created tenant
 */
export async function createTenantWithInitialization(data: {
  name: string;
  slug: string;
  logo?: string;
  websiteUrl?: string;
  title?: string;
  description?: string;
  primaryColor?: string;
  secondaryColor?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  planId?: string;
}) {
  const session = await currentSession();
  if (!session?.user) {
    throw new Error('Unauthorized: You must be logged in to create a tenant');
  }

  // Create organization via Better Auth
  // The afterCreateOrganization hook will handle module initialization
  // All additional fields are automatically handled by Better Auth schema
  // Note: planId is not part of the Better Auth schema, so it's handled separately
  const organization = await auth.api.createOrganization({
    body: {
      name: data.name,
      slug: data.slug,
      logo: data.logo,
      websiteUrl: data.websiteUrl,
      title: data.title,
      description: data.description,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      address: data.address,
    },
    headers: await headers(),
  });

  // Handle planId separately if provided (this would need to be implemented in your database logic)
  // For now, we'll skip it since it's not in the Better Auth schema

  // Better Auth returns the organization directly, not wrapped in a data property
  if (!organization?.id) {
    throw new Error('Failed to create tenant');
  }

  // Note: Module initialization is handled in the afterCreateOrganization hook
  // Roles and areas should be created by the user according to their needs
  // We don't create them automatically to avoid unnecessary data

  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    logo: organization.logo ?? undefined,
  };
}

/**
 * Sets the active organization (tenant) in the session.
 * Call this when the user selects a tenant so Better Auth stores activeOrganizationId.
 * Uses raw Prisma (db) for the access check so it does not depend on ZenStack generate.
 */
export async function setActiveTenant(tenantId: string): Promise<void> {
  const session = await currentSession();
  if (!session?.user) {
    throw new Error('Unauthorized: You must be logged in to set active tenant');
  }
  const link = await db.userTenant.findUnique({
    where: { userId_tenantId: { userId: session.user.id, tenantId } },
    select: { isActive: true },
  });
  if (!link || !link.isActive) {
    throw new Error('You do not have access to this organization');
  }
  await auth.api.setActiveOrganization({
    body: { organizationId: tenantId },
    headers: await headers(),
  });
}
