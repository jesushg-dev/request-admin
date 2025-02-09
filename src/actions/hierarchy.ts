'use server';

import { redirect } from '@/i18n/routing';
import { auth } from '@/server/auth';
import { db } from '@/server/db-server';

class UserNotFoundErr extends Error {}

export const getHierarchyAndLevelsByTenantId = async (locale: string, tenantId: string) => {
  const session = await auth();
  if (!session) throw new UserNotFoundErr('User not found');

  const hierarchy = await db.requestHierarchy.findFirst({
    select: {
      id: true,
      name: true,
      description: true,
      levels: { select: { id: true, name: true, position: true } },
    },
    where: { tenantId },
  });

  if (!hierarchy) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/requests-portal/request-types/hierarchies/new', params: { tenantId } } });
  }

  const levels = hierarchy.levels.sort((a, b) => a.position - b.position);

  return { hierarchy, levels };
};
