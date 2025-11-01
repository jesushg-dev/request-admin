'use server';

import { currentSession } from '@/server/auth-server';
import { getDb } from '@/server/db-client';

import { ModuleDefaultArgs } from '@/types/zenstackhq/module';

import { ModuleScope } from '../../prisma/module';

class UserNotFoundErr extends Error {}

export const getModuleByTenantIdAndScope = async (tenantId: string, scope: ModuleScope) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  const db = await getDb();
  const modules = await db.module.findMany({
    ...ModuleDefaultArgs,
    where: { tenantId, feature: { some: { scope: scope, isActive: true } } },
  });

  // Filter out inactive features and features that don't match the scope we're looking for
  const filteredModules = modules.map((module) => ({
    ...module,
    feature: module.feature.filter((f) => f.scope === scope && f.isActive),
  }));

  return filteredModules;
};
