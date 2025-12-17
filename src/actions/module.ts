'use server';

import { currentSession } from '@/server/auth-server';
import { getDb } from '@/server/db-client';
import { getAvailableModulesForTenant, isModuleEnabledForTenant } from '@/lib/module-availability';

import { ModuleDefaultArgs } from '@/types/zenstackhq/module';

import { ModuleScope } from '../../prisma/module';

class UserNotFoundErr extends Error {}

/**
 * Gets modules available for a tenant filtered by scope
 * Now uses global modules and checks availability via TenantModule and PlanFeature
 * @param tenantId The tenant ID
 * @param scope The scope to filter by ('global' or 'area')
 * @returns Array of available modules with features matching the scope
 */
export const getModuleByTenantIdAndScope = async (tenantId: string, scope: ModuleScope) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  // Get available modules for the tenant (considers TenantModule and PlanFeature)
  const availableModules = await getAvailableModulesForTenant(tenantId);

  // Filter modules that have features matching the requested scope
  const modulesWithScope = availableModules.filter((module) =>
    module.feature.some((f) => f.scope === scope && f.isActive)
  );

  // Filter features to only include those matching the scope
  const filteredModules = modulesWithScope.map((module) => ({
    ...module,
    feature: module.feature.filter((f) => f.scope === scope && f.isActive),
  }));

  return filteredModules;
};
