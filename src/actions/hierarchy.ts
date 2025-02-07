'use server';

import { auth } from '@/server/auth';
import { db } from '@/server/db-server';

class UserNotFoundErr extends Error {}

export const getHierarchyAndLevelsByTenantId = async (tenantId: string) => {
  const session = await auth();
  if (!session) throw new UserNotFoundErr('User not found');

  const hierarchy = await db.requestHierarchy.findFirstOrThrow({
    select: {
      id: true,
      name: true,
      description: true,
      levels: { select: { id: true, name: true, position: true } },
    },
    where: { tenantId },
  });

  const levels = hierarchy.levels.sort((a, b) => a.position - b.position);

  return { hierarchy, levels };
};
