'use server';

import { getDb } from '@/server/db-client';

/**
 * Verifies if a module is enabled for a tenant
 * @param tenantId The tenant ID
 * @param moduleId The module ID
 * @returns true if the module is enabled (or no record exists = enabled by default), false otherwise
 */
export async function isModuleEnabledForTenant(tenantId: string, moduleId: string): Promise<boolean> {
  const db = await getDb();

  const tenantModule = await db.tenantModule.findUnique({
    where: {
      tenantId_moduleId: {
        tenantId,
        moduleId,
      },
    },
  });

  // If no record exists, module is enabled by default
  if (!tenantModule) {
    return true;
  }

  return tenantModule.isEnabled;
}

/**
 * Verifies if a module is available for a tenant considering:
 * 1. The module is enabled for the tenant (TenantModule)
 * 2. The tenant's plan includes features from this module (PlanFeature)
 * @param tenantId The tenant ID
 * @param moduleId The module ID
 * @returns true if the module is available, false otherwise
 */
export async function isModuleAvailableForTenant(tenantId: string, moduleId: string): Promise<boolean> {
  const db = await getDb();

  // 1. Check if the tenant has the module enabled
  const isEnabled = await isModuleEnabledForTenant(tenantId, moduleId);
  if (!isEnabled) {
    return false;
  }

  // 2. Check if the tenant's plan includes features from this module
  const subscription = await db.subscription.findFirst({
    where: {
      tenantId,
      status: 'active',
    },
    include: {
      plan: {
        include: {
          features: {
            include: {
              feature: {
                include: {
                  module: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!subscription) {
    return false;
  }

  // Check if any feature from this module is in the plan
  const hasModuleFeatures = subscription.plan.features.some((pf) => pf.feature.moduleId === moduleId);

  return hasModuleFeatures;
}

/**
 * Gets all modules available for a tenant
 * Filters by:
 * 1. Module is enabled for the tenant (TenantModule)
 * 2. Tenant's plan includes features from the module (PlanFeature)
 * @param tenantId The tenant ID
 * @returns Array of available modules with their features
 */
export async function getAvailableModulesForTenant(tenantId: string) {
  const db = await getDb();

  // Get tenant's active subscription
  const subscription = await db.subscription.findFirst({
    where: {
      tenantId,
      status: 'active',
    },
    include: {
      plan: {
        include: {
          features: {
            include: {
              feature: {
                include: {
                  module: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!subscription) {
    return [];
  }

  // Get all modules that have features in the plan
  const moduleIdsInPlan = new Set(subscription.plan.features.map((pf) => pf.feature.moduleId));

  // Get all modules
  const allModules = await db.module.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      id: {
        in: Array.from(moduleIdsInPlan),
      },
    },
    include: {
      feature: {
        where: {
          isActive: true,
          deletedAt: null,
        },
      },
      tenantModules: {
        where: {
          tenantId,
        },
      },
    },
  });

  // Filter modules that are enabled for this tenant
  const availableModules = allModules.filter((module) => {
    const tenantModule = module.tenantModules[0];
    // If no record exists, module is enabled by default
    return !tenantModule || tenantModule.isEnabled;
  });

  return availableModules;
}

/**
 * Gets all features available for a tenant
 * Filters by:
 * 1. Feature's module is enabled for the tenant (TenantModule)
 * 2. Feature is included in the tenant's plan (PlanFeature)
 * @param tenantId The tenant ID
 * @returns Array of available features
 */
export async function getAvailableFeaturesForTenant(tenantId: string) {
  const db = await getDb();

  // Get tenant's active subscription
  const subscription = await db.subscription.findFirst({
    where: {
      tenantId,
      status: 'active',
    },
    include: {
      plan: {
        include: {
          features: {
            include: {
              feature: {
                include: {
                  module: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!subscription) {
    return [];
  }

  // Get all features in the plan
  const planFeatures = subscription.plan.features.map((pf) => pf.feature);

  // Get tenant module settings
  const tenantModules = await db.tenantModule.findMany({
    where: {
      tenantId,
    },
  });

  const tenantModuleMap = new Map(tenantModules.map((tm) => [tm.moduleId, tm.isEnabled]));

  // Filter features where:
  // 1. The feature's module is enabled for the tenant (or no record = enabled by default)
  // 2. The feature is in the plan
  const availableFeatures = planFeatures.filter((feature) => {
    const isModuleEnabled = tenantModuleMap.get(feature.moduleId) ?? true;
    return isModuleEnabled;
  });

  return availableFeatures;
}
