'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from '@/i18n/routing';
import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-server';
import { type Locale } from 'next-intl';

import { AssignmentHierarchyWithLevelsType, RequestHierarchyWithLevelsType } from '@/types/prisma/hierarchy';
import { generateUuid } from '@/lib/id';
import { HierarchyFormStepperValues } from '@/components/common/hierarchy/hierarchy-form-stepper';

class UserNotFoundErr extends Error {}

export const upsertRequestHierarchy = async (data: HierarchyFormStepperValues, tenantId: string, locale: Locale) => {
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
          position: index + 1,
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

  revalidatePath(`/admin/${tenantId}/configurations/request-hierarchies`);

  redirect({ href: { params: { tenantId }, pathname: '/admin/[tenantId]/configurations/request-hierarchies' }, locale });
};

export const upsertAssignmentHierarchy = async (data: HierarchyFormStepperValues, tenantId: string, locale: Locale) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');
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
          position: index + 1,
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
  revalidatePath(`/admin/${tenantId}/configurations/assignment-hierarchies`);
  redirect({ href: { params: { tenantId }, pathname: '/admin/[tenantId]/configurations/assignment-hierarchies' }, locale });
};

export const getRequestHierarchyAndLevelsById = async (tenantId: string, id: string): Promise<HierarchyFormStepperValues & { categoriesCount: number }> => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');
  const hierarchy = await db.requestHierarchy.findFirstOrThrow({
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      levels: {
        select: {
          id: true,
          name: true,
          description: true,
          position: true,
        },
      },
      _count: {
        select: {
          categories: true,
        },
      },
    },
    where: { tenantId, id },
  });

  return {
    id: hierarchy.id,
    name: hierarchy.name ?? '',
    description: hierarchy.description ?? '',
    isActive: hierarchy.isActive ?? true,
    levels: hierarchy.levels
      .sort((a, b) => a.position - b.position)
      .map((level) => ({
        id: level.id,
        name: level.name,
        description: level.description ?? '',
        isActive: true,
      })) ?? [{ id: generateUuid(), name: '', isActive: true }],
    categoriesCount: hierarchy._count.categories,
  };
};

export const getAssignmentHierarchyAndLevelsById = async (tenantId: string, id: string): Promise<HierarchyFormStepperValues & { categoriesCount: number }> => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  const hierarchy = await db.assignmentHierarchy.findFirstOrThrow({
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      levels: {
        select: {
          id: true,
          name: true,
          description: true,
          position: true,
        },
      },
      _count: {
        select: {
          categories: true,
        },
      },
    },
    where: { tenantId, id },
  });

  return {
    id: hierarchy.id,
    name: hierarchy.name ?? '',
    description: hierarchy.description ?? '',
    isActive: hierarchy.isActive ?? true,
    levels: hierarchy.levels
      .sort((a, b) => a.position - b.position)
      .map((level) => ({
        id: level.id,
        name: level.name,
        description: level.description ?? '',
        isActive: true,
      })) ?? [{ id: generateUuid(), name: '', isActive: true }],
    categoriesCount: hierarchy._count.categories,
  };
};

export const getRequestHierarchiesAndLevelsByTenantId = async (locale: Locale, tenantId: string): Promise<RequestHierarchyWithLevelsType[]> => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  const hierarchies = await db.requestHierarchy.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      levels: { select: { id: true, name: true, position: true } },
    },
    where: { tenantId },
  });

  if (!hierarchies) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/request-hierarchies', params: { tenantId } } });
  }

  return hierarchies.map((h) => ({
    id: h.id,
    name: h.name,
    description: h.description,
    levels: h.levels.sort((a, b) => a.position - b.position),
  }));
};

export const getAssignmentHierarchiesAndLevelsByTenantId = async (locale: Locale, tenantId: string): Promise<AssignmentHierarchyWithLevelsType[]> => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  const hierarchies = await db.assignmentHierarchy.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      levels: { select: { id: true, name: true, position: true } },
    },
    where: { tenantId },
  });

  if (!hierarchies) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/assignment-hierarchies', params: { tenantId } } });
  }

  return hierarchies.map((h) => ({
    id: h.id,
    name: h.name,
    description: h.description,
    levels: h.levels.sort((a, b) => a.position - b.position),
  }));
};
