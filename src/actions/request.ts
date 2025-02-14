'use server';

import { PermissionActions } from '@/constants/permissions';
import { auth } from '@/server/auth';
import { db } from '@/server/db-server';

import { generateUuid } from '@/lib/id';
import { RequestFormStepperType } from '@/components/common/request/request-form-stepper';

class UserNotFoundErr extends Error {}

export const upsertRequest = async (tenantId: string, data: RequestFormStepperType) => {
  const session = await auth();
  if (!session) throw new UserNotFoundErr('User not found');

  // find the supervisor for the area
  const area = await db.area.findFirstOrThrow({
    select: {
      userAreas: {
        select: { userTenantId: true },
        where: {
          role: { areaRoleFeatures: { some: { feature: { key: PermissionActions.REQUEST_MANAGEMENT.ASSIGN_USER } } } },
        },
      },
    },
    where: { id: data.areaId.value, tenantId },
  });

  const assignmentType = await db.assignmentCategory.findFirstOrThrow({
    select: { id: true },
  });

  await db.request.upsert({
    create: {
      tenantId,
      issueSubject: data.issueSubject,
      description: data.description,
      priority: data.priority,
      comment: data.comment,
      statusId: data.statusId,
      requestAssignments: {
        create: {
          tenantId,
          typeId: assignmentType.id,
          statusId: data.statusId,
          requestCategoryId: data.requestCategory[data.requestCategory.length - 1].value,
          assignmentCategoryId: data.assignmentCategory[data.assignmentCategory.length - 1].value,
          assignmentDate: new Date(),
          assignedUsers: {
            create: area.userAreas.map((ua) => ({
              tenantId,
              isCoordinator: true,
              role: 'Coordinator',
              userTenantId: ua.userTenantId,
            })),
          },
        },
      },
    },
    update: {
      tenantId,
      statusId: data.statusId,
    },
    where: {
      id: data.id ?? generateUuid(),
      tenantId,
    },
  });
};

export const getPrioritiesAsOptions = async (tenantId: string) => {
  const session = await auth();
  if (!session) throw new UserNotFoundErr();

  const priorities = await db.requestPriorityType.findMany({
    select: {
      id: true,
      name: true,
    },
    where: { tenantId },
  });

  return priorities.map((priority) => ({
    label: priority.name,
    value: priority.id,
  }));
};

export const getStatusesAsOptions = async (tenantId: string) => {
  const session = await auth();
  if (!session) throw new UserNotFoundErr();

  const statuses = await db.requestStatusType.findMany({
    select: {
      id: true,
      name: true,
    },
    where: { tenantId },
  });

  return statuses.map((status) => ({
    label: status.name,
    value: status.id,
  }));
};
