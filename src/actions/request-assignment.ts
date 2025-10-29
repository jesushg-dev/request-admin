'use server';

import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-server';
import { Prisma } from '@prisma/client';

import { NotificationTypeEnum } from '@/types/notification';
import { RequestMetadata } from '@/types/prisma/request';
import { AuthorizationError, ConcurrentModificationError, ValidationError } from '@/lib/error';
import { normalizeValue } from '@/lib/utils';
import { AssignRequestFormValues } from '@/components/common/request/detail/assign-request-modal';
import { ReassignAreaFormValues } from '@/components/common/request/detail/reassign-area-modal';

import { sendInAppNotification } from './notification';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';

type UUID = string;
type FieldName = 'status' | 'priority';
type DBField = 'statusId' | 'priorityId';

type UpdateRequestFieldParams = {
  tenantId: UUID;
  requestId: UUID;
  userId: UUID;
  fieldName: FieldName;
  dbField: DBField;
  newValue: UUID;
  metadata?: string;
};

const IsNotEmpty = (id: string, fieldName: string): void => {
  if (!id) throw new ValidationError(`Invalid ${fieldName}: ${id}`);
};

const handleAssignmentUpdate = async ({
  tenantId,
  requestId,
  userId,
  fieldName,
  metadata,
  newAssignmentData,
  oldValue,
  newValue,
}: {
  tenantId: UUID;
  requestId: UUID;
  userId: UUID;
  fieldName: string;
  metadata: string;
  newAssignmentData: Prisma.RequestAssignmentUncheckedCreateInput;
  oldValue: string;
  newValue: string;
}) => {
  try {
    await db.$transaction([
      db.requestAssignment.updateMany({
        where: { requestId, tenantId, isActive: true },
        data: { isActive: false },
      }),
      db.requestAssignment.create({
        data: { ...newAssignmentData, isActive: true, tenantId, requestId },
      }),
      db.requestChangeLog.create({
        data: {
          tenantId,
          requestId,
          fieldName,
          oldValue,
          newValue,
          metadata,
          updatedBy: userId,
          updatedAt: new Date(),
        },
      }),
    ]);
  } catch (error) {
    throw new ConcurrentModificationError(`Failed to update ${fieldName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const updateRequestField = async ({ tenantId, requestId, userId, fieldName, dbField, newValue, metadata }: UpdateRequestFieldParams): Promise<Record<DBField, UUID>> => {
  IsNotEmpty(tenantId, 'tenantId');
  IsNotEmpty(requestId, 'requestId');
  IsNotEmpty(newValue, `${fieldName}Id`);
  IsNotEmpty(userId, 'userId');

  const lastAssignment = await db.requestAssignment.findFirstOrThrow({
    where: { requestId, tenantId, isActive: true },
    include: { assignedUsers: true },
  });

  if (lastAssignment[dbField] === newValue) {
    throw new ValidationError(`No changes detected in ${fieldName}`);
  }

  const newAssignmentData: Prisma.RequestAssignmentUncheckedCreateInput = {
    ...lastAssignment,
    id: undefined,
    [dbField]: newValue,
    assignedUsers: { connect: lastAssignment.assignedUsers.map((user) => ({ id: user.id })) },
  };

  await handleAssignmentUpdate({
    tenantId,
    requestId,
    userId,
    fieldName,
    metadata: metadata || '',
    newAssignmentData,
    oldValue: String(lastAssignment[dbField]),
    newValue: String(newValue),
  });

  return { [dbField]: newValue } as Record<DBField, UUID>;
};

export const updateCurrentStatus = async (tenantId: UUID, requestId: UUID, statusId: UUID, metadata: RequestMetadata): Promise<{ statusId: UUID }> => {
  const session = await currentSession();
  if (!session?.user?.id) throw new AuthorizationError('Authentication required');

  // RBAC: require global or scoped permission to set status
  const lastAssignment = await db.requestAssignment.findFirstOrThrow({ where: { requestId, tenantId, isActive: true }, select: { areaId: true } });
  const auth = await getAuthContext(tenantId);
  const canSetStatus =
    auth.hasPermissions([PermissionActions.REQUEST_MANAGEMENT.SCOPED_SET_STATUS]) ||
    auth.hasAreaPermissions(lastAssignment.areaId, [PermissionActions.REQUEST_MANAGEMENT.SCOPED_SET_STATUS]);
  if (!canSetStatus) throw new AuthorizationError('Forbidden: insufficient permissions to change status');

  return updateRequestField({
    tenantId,
    requestId,
    userId: session.user.id,
    fieldName: 'status',
    dbField: 'statusId',
    newValue: statusId,
    metadata: JSON.stringify(metadata),
  });
};

export const updateCurrentPriority = async (tenantId: UUID, requestId: UUID, priorityId: UUID, metadata: RequestMetadata): Promise<{ priorityId: UUID }> => {
  const session = await currentSession();
  if (!session?.user?.id) throw new AuthorizationError('Authentication required');

  // RBAC: require global or scoped permission to set priority
  const lastAssignment = await db.requestAssignment.findFirstOrThrow({ where: { requestId, tenantId, isActive: true }, select: { areaId: true } });
  const auth = await getAuthContext(tenantId);
  const canSetPriority =
    auth.hasPermissions([PermissionActions.REQUEST_MANAGEMENT.SCOPED_SET_PRIORITY]) ||
    auth.hasAreaPermissions(lastAssignment.areaId, [PermissionActions.REQUEST_MANAGEMENT.SCOPED_SET_PRIORITY]);
  if (!canSetPriority) throw new AuthorizationError('Forbidden: insufficient permissions to change priority');

  if (metadata.type !== 'PRIORITY_CHANGE') {
    throw new ValidationError('Invalid metadata type for priority change');
  }

  if (metadata.type === 'PRIORITY_CHANGE' && !metadata.reason) {
    throw new ValidationError('Reason is required for priority change');
  }

  return updateRequestField({
    tenantId,
    requestId,
    userId: session.user.id,
    fieldName: 'priority',
    dbField: 'priorityId',
    newValue: priorityId,
    metadata: JSON.stringify(metadata),
  });
};

export const updateCurrentAssignedUsers = async (tenantId: UUID, requestId: UUID, data: AssignRequestFormValues): Promise<{ assignedUsers: UUID[] }> => {
  const session = await currentSession();
  if (!session?.user?.id) throw new AuthorizationError('Authentication required');

  // RBAC: require assign permissions
  const lastAssignmentHeader = await db.requestAssignment.findFirstOrThrow({ where: { requestId, tenantId, isActive: true }, select: { areaId: true } });
  const auth = await getAuthContext(tenantId);
  const canAssign =
    auth.hasPermissions([PermissionActions.REQUEST_MANAGEMENT.ASSIGN_USER]) ||
    auth.hasAreaPermissions(lastAssignmentHeader.areaId, [PermissionActions.REQUEST_MANAGEMENT.SCOPED_ASSIGN_USER]);
  if (!canAssign) throw new AuthorizationError('Forbidden: insufficient permissions to assign users');

  const lastAssignment = await db.requestAssignment.findFirstOrThrow({
    where: { requestId, tenantId, isActive: true },
    include: { assignedUsers: true },
  });

  const newAssignmentData: Prisma.RequestAssignmentUncheckedCreateInput = {
    ...lastAssignment,
    id: undefined,
    comment: data.comments,
    assignedUsers: {
      create: data.assignees.map(({ user, isCoordinator }) => ({
        tenantId,
        userTenantId: String(user.value),
        role: 'N/A',
        isCoordinator,
      })),
    },
  };

  await handleAssignmentUpdate({
    tenantId,
    requestId,
    userId: session.user.id,
    fieldName: 'assignedUsers',
    metadata: JSON.stringify({
      type: 'ASSIGNMENT_CHANGE',
      users: data.assignees.map(({ user, isCoordinator }) => ({
        userId: String(user.value),
        isCoordinator,
      })),
    }),
    newAssignmentData,
    oldValue: JSON.stringify(lastAssignment.assignedUsers),
    newValue: JSON.stringify(data.assignees),
  });

  await sendInAppNotification({
    tenantId,
    body: {
      type: NotificationTypeEnum.ASSIGNMENT,
      data: {
        requestId: lastAssignment.requestId,
      },
    },
    recipients: data.assignees.map(({ user }) => ({ userTenantId: String(user.value) })),
  });

  return { assignedUsers: data.assignees.map(({ user }) => String(user.value)) };
};

export const updateCurrentClassification = async (tenantId: UUID, requestId: UUID, data: ReassignAreaFormValues) => {
  const session = await currentSession();
  if (!session?.user?.id) throw new AuthorizationError('Authentication required');

  // RBAC: require scoped edit permission to reclassify (area/category)
  const lastAssignmentHeader = await db.requestAssignment.findFirstOrThrow({ where: { requestId, tenantId, isActive: true }, select: { areaId: true } });
  const auth = await getAuthContext(tenantId);
  const canEdit =
    auth.hasPermissions([PermissionActions.REQUEST_MANAGEMENT.EDIT]) ||
    auth.hasAreaPermissions(lastAssignmentHeader.areaId, [PermissionActions.REQUEST_MANAGEMENT.SCOPED_EDIT]);
  if (!canEdit) throw new AuthorizationError('Forbidden: insufficient permissions to reclassify request');

  const lastAssignment = await db.requestAssignment.findFirstOrThrow({
    where: { requestId, tenantId, isActive: true },
    include: { assignedUsers: true },
  });

  const newValues = {
    areaId: data.areaId.value,
    requestCategoryId: data.requestCategory.at(-1)?.value || '',
    assignmentCategoryId: data.assignmentCategory.at(-1)?.value || '',
  };

  if (lastAssignment.areaId === newValues.areaId && lastAssignment.requestCategoryId === newValues.requestCategoryId && lastAssignment.assignmentCategoryId === newValues.assignmentCategoryId) {
    throw new ValidationError('No changes detected in classification');
  }

  if (!normalizeValue(newValues.requestCategoryId) && !normalizeValue(newValues.assignmentCategoryId)) {
    throw new ValidationError('Request category and assignment category are required');
  }

  const newAssignmentData: Prisma.RequestAssignmentUncheckedCreateInput = {
    ...lastAssignment,
    id: undefined,
    comment: data.reason,
    areaId: newValues.areaId,
    requestCategoryId: newValues.requestCategoryId,
    assignmentCategoryId: newValues.assignmentCategoryId,
    assignedUsers: { connect: lastAssignment.assignedUsers.map((user) => ({ id: user.id })) },
  };

  await handleAssignmentUpdate({
    tenantId,
    requestId,
    userId: session.user.id,
    fieldName: 'classification',
    metadata: JSON.stringify({
      type: 'ASSIGNMENT_AREA_CHANGE',
      reason: data.reason,
      notify: String(data.notify.value),
    }),
    newAssignmentData,
    oldValue: JSON.stringify({
      areaId: lastAssignment.areaId,
      requestCategoryId: lastAssignment.requestCategoryId,
      assignmentCategoryId: lastAssignment.assignmentCategoryId,
    }),
    newValue: JSON.stringify(newValues),
  });

  return { areaId: newValues.areaId };
};

// ========================
// MASSIVE ASSIGNMENT
// ========================
export const getTenantUsers = async (tenantId: UUID) => {
  const session = await currentSession();
  if (!session?.user?.id) throw new AuthorizationError('Authentication required');

  const users = await db.userTenant.findMany({
    where: { tenantId },
    select: {
      id: true,
      person: { select: { firstName: true, lastName: true } },
      user: { select: { email: true } },
    },
  });

  return users.map((user) => ({
    id: user.id,
    label: user.person ? `${user.person.firstName} ${user.person.lastName} (${user.user.email})` : user.user.email,
    value: user.id,
  }));
};

export const getAvailableRequestsForUser = async (tenantId: UUID, userTenantId: UUID) => {
  const session = await currentSession();
  if (!session?.user?.id) throw new AuthorizationError('Authentication required');

  // Get user's areas
  const userAreas = await db.userTenantArea.findMany({
    where: { userTenantId, tenantId },
    select: { areaId: true },
  });

  const areaIds = userAreas.map((ua) => ua.areaId);

  if (areaIds.length === 0) {
    return [];
  }

  // Get requests that are in the user's areas and not already assigned to this user
  const requests = await db.request.findMany({
    where: {
      tenantId,
      isDraft: false,
      requestAssignments: {
        some: {
          areaId: { in: areaIds },
          isActive: true,
          assignedUsers: {
            none: {
              userTenantId,
              tenantId,
            },
          },
        },
      },
    },
    select: {
      id: true,
      slug: true,
      issueSubject: true,
      requestAssignments: {
        where: { isActive: true },
        take: 1,
        select: {
          status: { select: { name: true } },
          priority: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return requests.map((request) => ({
    id: request.id,
    slug: request.slug,
    title: request.issueSubject,
    status: request.requestAssignments[0]?.status?.name || 'N/A',
    priority: request.requestAssignments[0]?.priority?.name || 'N/A',
  }));
};

export const assignRequestsMassively = async (tenantId: UUID, userTenantId: UUID, requestIds: UUID[], comments?: string) => {
  const session = await currentSession();
  if (!session?.user?.id) throw new AuthorizationError('Authentication required');

  if (requestIds.length === 0) {
    throw new ValidationError('Debe seleccionar al menos una solicitud');
  }

  const auth = await getAuthContext(tenantId);
  const results = [];

  for (const requestId of requestIds) {
    try {
      const lastAssignment = await db.requestAssignment.findFirstOrThrow({
        where: { requestId, tenantId, isActive: true },
        include: { assignedUsers: true },
      });

      // RBAC per request: require global assign or scoped assign in this area
      const canAssign =
        auth.hasPermissions([PermissionActions.REQUEST_MANAGEMENT.ASSIGN_USER]) ||
        auth.hasAreaPermissions(lastAssignment.areaId, [PermissionActions.REQUEST_MANAGEMENT.SCOPED_ASSIGN_USER]);
      if (!canAssign) {
        results.push({ requestId, success: false, message: 'Sin permisos para asignar en el área' });
        continue;
      }

      // Check if user is already assigned
      const alreadyAssigned = lastAssignment.assignedUsers.some((au) => au.userTenantId === userTenantId);
      if (alreadyAssigned) {
        results.push({ requestId, success: false, message: 'Usuario ya está asignado a esta solicitud' });
        continue;
      }

      const newAssignmentData: Prisma.RequestAssignmentUncheckedCreateInput = {
        ...lastAssignment,
        id: undefined,
        comment: comments,
        assignedUsers: {
          create: [
            ...lastAssignment.assignedUsers.map((au) => ({
              tenantId,
              userTenantId: au.userTenantId,
              role: au.role,
              isCoordinator: au.isCoordinator,
            })),
            {
              tenantId,
              userTenantId,
              role: 'User',
              isCoordinator: false,
            },
          ],
        },
      };

      await db.$transaction([
        db.requestAssignment.updateMany({
          where: { requestId, tenantId, isActive: true },
          data: { isActive: false },
        }),
        db.requestAssignment.create({
          data: { ...newAssignmentData, isActive: true, tenantId, requestId },
        }),
        db.requestChangeLog.create({
          data: {
            tenantId,
            requestId,
            fieldName: 'assignedUsers',
            oldValue: JSON.stringify(lastAssignment.assignedUsers.map((au) => au.userTenantId)),
            newValue: JSON.stringify([...lastAssignment.assignedUsers.map((au) => au.userTenantId), userTenantId]),
            updatedBy: session.user.id,
            updatedAt: new Date(),
          },
        }),
      ]);

      await sendInAppNotification({
        tenantId,
        body: {
          type: NotificationTypeEnum.ASSIGNMENT,
          data: { requestId },
        },
        recipients: [{ userTenantId }],
      });

      results.push({ requestId, success: true });
    } catch (error) {
      results.push({
        requestId,
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  return results;
};
