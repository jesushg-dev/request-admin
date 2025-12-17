'use server';

import { locales, redirect } from '@/i18n/routing';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { currentSession, auth } from '@/server/auth-server';
import { getDb } from '@/server/db-client';
import { PrismaModules } from '@/../prisma/module';
import { createSystemRoles, SYSTEM_ROLES } from '@/../prisma/role';

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

  const db = await getDb();
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

/**
 * Initializes global modules and features if they don't exist
 * Then enables all modules for the new tenant by default
 */
async function initializeGlobalModulesAndFeatures(db: Awaited<ReturnType<typeof getDb>>) {
  // Check if modules already exist (they should be global now)
  const existingModules = await db.module.findMany();
  
  if (existingModules.length === 0) {
    // Create global modules and features if they don't exist
    for (const [, applicationModule] of Object.entries(PrismaModules)) {
      await db.module.create({
        data: {
          name: applicationModule.name.es,
          description: applicationModule.description.es,
          createdBy: 'system',
          feature: {
            create: Object.entries(applicationModule.features).map(([, feature]) => ({
              name: feature.name.es,
              key: feature.action,
              description: feature.description.es,
              scope: feature.scope,
              createdBy: 'system',
            })),
          },
        },
      });
    }
  }
}

/**
 * Enables all global modules for a tenant by default
 * Tenants can later disable modules they don't need via TenantModule
 */
async function enableDefaultModulesForTenant(
  db: Awaited<ReturnType<typeof getDb>>,
  tenantId: string,
  userId: string
) {
  // Get all active global modules
  const allModules = await db.module.findMany({
    where: { isActive: true, deletedAt: null },
  });

  // Enable all modules by default for the new tenant
  await db.tenantModule.createMany({
    data: allModules.map((module) => ({
      tenantId,
      moduleId: module.id,
      isEnabled: true,
      createdBy: userId,
    })),
    skipDuplicates: true,
  });
}

/**
 * Creates a new tenant with all necessary initialization:
 * - Creates the tenant via Better Auth
 * - Initializes global modules and features if they don't exist
 * - Enables all modules for the new tenant by default (via TenantModule)
 * - Creates system roles (Administrador, Coordinador, Analista, Distribuidor)
 * 
 * @param data Tenant creation data (name, slug, logo)
 * @returns The created tenant
 */
export async function createTenantWithInitialization(data: { name: string; slug: string; logo?: string }) {
  const session = await currentSession();
  if (!session?.user) {
    throw new Error('Unauthorized: You must be logged in to create a tenant');
  }

  const db = await getDb();

  // 1. Create tenant via Better Auth
  const organization = await auth.api.createOrganization({
    body: {
      name: data.name,
      slug: data.slug,
      logo: data.logo,
    },
    headers: new Headers(),
  });

  if (!organization?.data?.id) {
    throw new Error('Failed to create tenant');
  }

  const tenantId = organization.data.id;

  try {
    // 2. Initialize global modules and features if they don't exist
    await initializeGlobalModulesAndFeatures(db);

    // 3. Enable all modules for the new tenant by default
    await enableDefaultModulesForTenant(db, tenantId, session.user.id);

    // 4. Create system roles (without assigning users)
    // We'll create roles without user assignments initially
    // Users can be assigned roles later when they join the tenant
    for (const roleData of SYSTEM_ROLES) {
      // Find features by key (now global, no tenantId needed)
      const features = await db.feature.findMany({
        where: {
          key: { in: roleData.features },
        },
      });

      const role = await db.role.create({
        data: {
          name: roleData.name,
          description: roleData.description,
          tenantId,
          createdBy: session.user.id,
          roleFeature: {
            create: features.map((feature) => ({
              tenant: { connect: { id: tenantId } },
              feature: { connect: { id: feature.id } },
              createdBy: session.user.id,
            })),
          },
        },
      });
    }

    return {
      id: tenantId,
      name: organization.data.name,
      slug: organization.data.slug,
      logo: organization.data.logo,
    };
  } catch (error) {
    // If initialization fails, we should rollback the tenant creation
    // For now, we'll just throw the error
    // TODO: Implement proper transaction/rollback
    console.error('Error initializing tenant data:', error);
    throw new Error(`Failed to initialize tenant: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
