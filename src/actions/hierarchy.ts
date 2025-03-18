'use server';

import { redirect } from '@/i18n/routing';
import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-server';
import { type Locale } from 'next-intl';

import { HierarchyFormStepperValues } from '@/components/common/hierarchy/hierarchy-form-stepper';

class UserNotFoundErr extends Error {}

export const upsertRequestHierarchy = async (data: HierarchyFormStepperValues, tenantId: string): Promise<HierarchyFormStepperValues> => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  await db.requestHierarchy.upsert({
    where: { id: data.id, tenantId },
    create: {
      id: data.id,
      name: data.name,
      description: data.description,
      isActive: data.isActive,
      tenantId: tenantId,
      levels: {
        create: data.levels.map((level, index) => ({
          id: level.id,
          name: level.name,
          description: level.description,
          position: index,
          isActive: true,
          tenantId,
        })),
      },
    },
    update: {
      name: data.name,
      description: data.description,
      isActive: data.isActive,
      levels: {
        update: data.levels.map((level) => ({
          where: { id: level.id },
          data: {
            name: level.name,
            description: level.description,
            isActive: true,
          },
        })),
      },
    },
  });

  return data;
};

export const upsertAssignmentHierarchy = async (data: HierarchyFormStepperValues, tenantId: string): Promise<HierarchyFormStepperValues> => {
  await db.assignmentHierarchy.upsert({
    where: { id: data.id, tenantId },
    create: {
      id: data.id,
      name: data.name,
      description: data.description,
      isActive: data.isActive,
      tenantId: tenantId,
      levels: {
        create: data.levels.map((level, index) => ({
          id: level.id,
          name: level.name,
          description: level.description,
          position: index,
          isActive: true,
          tenantId,
        })),
      },
    },
    update: {
      name: data.name,
      description: data.description,
      isActive: data.isActive,
      levels: {
        update: data.levels.map((level) => ({
          where: { id: level.id },
          data: {
            name: level.name,
            description: level.description,
            isActive: true,
          },
        })),
      },
    },
  });

  return data;
};

export const getRequestHierarchyAndLevelsByTenantId = async (locale: Locale, tenantId: string) => {
  const session = await currentSession();
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
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/settings/hierarchies/request', params: { tenantId } } });
  }

  const levels = hierarchy.levels.sort((a, b) => a.position - b.position);

  return { hierarchy, levels };
};

export const getAssignmentHierarchyAndLevelsByTenantId = async (locale: Locale, tenantId: string) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  const hierarchy = await db.assignmentHierarchy.findFirst({
    select: {
      id: true,
      name: true,
      description: true,
      levels: { select: { id: true, name: true, position: true } },
    },
    where: { tenantId },
  });

  if (!hierarchy) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/settings/hierarchies/assignment', params: { tenantId } } });
  }

  const levels = hierarchy.levels.sort((a, b) => a.position - b.position);

  return { hierarchy, levels };
};
