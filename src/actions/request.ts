'use server';

import { AssignmentTypeEnum } from '@/constants/assignment-type';
import { PermissionActions } from '@/constants/permissions';
import { STATUS } from '@/constants/requests';
import { auth } from '@/server/auth';
import { db } from '@/server/db-server';
import { keysSchema } from '@/services/schemas/form';

import { RequestDetailsType } from '@/types/prisma/request';
import { RequestFormStepperType } from '@/components/common/request/request-form-stepper';

class UserNotFoundErr extends Error {}

export const upsertRequest = async (tenantId: string, data: RequestFormStepperType) => {
  const session = await auth();
  if (!session) throw new UserNotFoundErr('User not found');

  // Validate required categories
  if (data.requestCategory.length === 0) throw new Error('Request category is required');
  if (data.assignmentCategory.length === 0) throw new Error('Assignment category is required');

  // Get area with supervisor information
  const area = await db.area.findFirstOrThrow({
    select: {
      userAreas: {
        select: {
          userTenantId: true,
          role: { select: { name: true } },
        },
        where: {
          role: { areaRoleFeatures: { some: { feature: { key: PermissionActions.REQUEST_MANAGEMENT.ASSIGN_USER } } } },
        },
      },
    },
    where: { id: data.areaId.value, tenantId },
  });

  // Get requirement compliances in a single query
  const requirementCompliances = await db.requestCategoryRequirement.findMany({
    where: {
      categoryId: { in: data.requestCategory.map((rc) => rc.value) },
    },
    select: { requirementId: true, isActive: true },
  });

  // Get assignment type once
  const assignmentType = await db.assignmentType.findFirstOrThrow({
    select: { id: true },
    where: { systemName: AssignmentTypeEnum.SERVICE_REQUEST, tenantId },
  });

  // Process form submissions with proper error handling
  const processSubmissions = (submissions: typeof data.submissions) => {
    if (!submissions) return [];

    return Object.entries(submissions).map(([formId, response]) => {
      const keys = keysSchema.safeParse(response);
      if (!keys.success) throw new Error(`Invalid keys provided for form ${formId}`);

      return {
        formId,
        content: JSON.stringify(response),
        dataKeys: Object.entries(keys.data).map(([key, value]) => ({ key, value })),
      };
    });
  };

  const processedSubmissions = processSubmissions(data.submissions);

  return await db.request.upsert({
    where: {
      id: data.id,
      tenantId,
    },
    create: {
      id: data.id,
      tenantId,
      issueSubject: data.issueSubject,
      description: data.description,
      comment: data.comment,
      requestAssignments: {
        create: {
          tenantId,
          typeId: assignmentType.id,
          areaId: data.areaId.value,
          statusId: data.statusId.value,
          priorityId: data.priorityId.value,
          requestCategoryId: data.requestCategory.slice(-1)[0].value,
          assignmentCategoryId: data.assignmentCategory.slice(-1)[0].value,
          assignmentDate: new Date(),
          assignedUsers: {
            create: area.userAreas.map((ua) => ({
              tenantId,
              isCoordinator: true,
              role: ua.role.name,
              userTenantId: ua.userTenantId,
            })),
          },
        },
      },
      complianceTrackings: {
        create: requirementCompliances.map((rc) => ({
          tenantId,
          isArchived: !rc.isActive,
          requirementId: rc.requirementId,
          //requestCategoryId: rc.categoryId,
          isFulfilled: data.requirementCompliances[rc.requirementId] ?? false,
        })),
      },
      formSubmission: {
        create: processedSubmissions.map(({ formId, content, dataKeys }) => ({
          tenantId,
          formId,
          content,
          keys: { createMany: { data: dataKeys.map((k) => ({ ...k, tenantId })) } },
        })),
      },
      channel: {
        create: {
          tenantId,
          name: `Request ${data.id}`,
        },
      },
    },
    update: {
      issueSubject: data.issueSubject,
      description: data.description,
      comment: data.comment,
      requestAssignments: {
        // Archive previous assignments
        updateMany: {
          where: { isActive: true, requestId: data.id },
          data: { isActive: false },
        },
        // Create new assignment
        create: {
          tenantId,
          typeId: assignmentType.id,
          areaId: data.areaId.value,
          statusId: data.statusId.value,
          priorityId: data.priorityId.value,
          requestCategoryId: data.requestCategory.slice(-1)[0].value,
          assignmentCategoryId: data.assignmentCategory.slice(-1)[0].value,
          assignmentDate: new Date(),
          assignedUsers: {
            create: area.userAreas.map((ua) => ({
              tenantId,
              isCoordinator: true,
              role: ua.role.name,
              userTenantId: ua.userTenantId,
            })),
          },
        },
      },
      complianceTrackings: {
        // Upsert compliance tracking records
        upsert: requirementCompliances.map((rc) => ({
          where: {
            unique_compliance_tracking: {
              tenantId,
              requirementId: rc.requirementId,
              requestId: data.id,
            },
          },
          create: {
            tenantId,
            isArchived: !rc.isActive,
            requirementId: rc.requirementId,
            //requestCategoryId: rc.categoryId,
            isFulfilled: data.requirementCompliances[rc.requirementId] ?? false,
          },
          update: {
            tenantId,
            isArchived: !rc.isActive,
            requirementId: rc.requirementId,
            //requestCategoryId: rc.categoryId,
            isFulfilled: data.requirementCompliances[rc.requirementId] ?? false,
          },
        })),
      },
      formSubmission: {
        // Upsert form submissions with atomic key updates
        upsert: processedSubmissions.map(({ formId, content, dataKeys }) => ({
          where: {
            formId_tenantId_requestId: { tenantId, formId, requestId: data.id },
          },
          create: {
            tenantId,
            formId,
            content,
            keys: { createMany: { data: dataKeys.map((k) => ({ ...k, tenantId })) } },
          },
          update: {
            tenantId,
            formId,
            content,
            keys: {
              deleteMany: {},
              createMany: { data: dataKeys.map((k) => ({ ...k, tenantId })) },
            },
          },
        })),
      },
    },
  });
};

export const getRequestById = async (tenantId: string, requestId: string): Promise<RequestFormStepperType> => {
  const session = await auth();
  if (!session) throw new UserNotFoundErr();

  const request = await db.request.findUniqueOrThrow({
    where: { id: requestId, tenantId },
    include: {
      requestAssignments: {
        select: {
          area: {
            select: { id: true, name: true },
          },
          status: {
            select: { id: true, name: true },
          },
          priority: {
            select: { id: true, name: true },
          },
          requestCategoryId: true,
          assignmentCategoryId: true,
        },
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      complianceTrackings: {
        select: { requirementId: true, isFulfilled: true },
      },
      formSubmission: {
        select: { formId: true, content: true, keys: { select: { key: true, value: true } } },
      },
    },
  });

  const requestCategory = await getAncestorCategories(request.requestAssignments[0].requestCategoryId, 'RequestCategory');
  const assignmentCategory = await getAncestorCategories(request.requestAssignments[0].assignmentCategoryId, 'AssignmentCategory');

  return {
    id: request.id,
    requestCategory,
    assignmentCategory,
    comment: request.comment ?? '',
    description: request.description ?? '',
    issueSubject: request.issueSubject ?? '',
    areaId: { value: request.requestAssignments[0].area.id, label: request.requestAssignments[0].area.name },
    statusId: { value: request.requestAssignments[0].status.id, label: request.requestAssignments[0].status.name },
    priorityId: { value: request.requestAssignments[0].priority.id, label: request.requestAssignments[0].priority.name },
    requirementCompliances: request.complianceTrackings.reduce(
      (acc, rc) => {
        acc[rc.requirementId] = rc.isFulfilled;
        return acc;
      },
      {} as Record<string, boolean>
    ),
    submissions: request.formSubmission.reduce(
      (acc, fs) => {
        acc[fs.formId] = JSON.parse(fs.content);
        return acc;
      },
      {} as Record<string, Record<string, string>>
    ),
  };
};

export const getRequestDetailsByRequest = async (tenantId: string, request: RequestFormStepperType): Promise<RequestDetailsType> => {
  const session = await auth();
  if (!session) throw new UserNotFoundErr();

  // Get total submissions count
  const submissions = await db.formSubmission.count({ where: { requestId: request.id, tenantId } });
  const requestCategoryIds = request.requestCategory.map((rc) => rc.value);
  const forms = await db.categoryForm.count({ where: { categoryId: { in: requestCategoryIds }, tenantId } });
  const satisfactionSurvey = await db.customerSatisfactionSurvey.findFirst({
    where: { requestId: request.id },
    select: { rating: true, feedback: true, submittedAt: true },
  });
  const channel = await db.channel.findFirst({
    select: { id: true, name: true, createdAt: true },
    where: { requestId: request.id },
  });

  return {
    submissions: {
      count: submissions,
      total: forms,
    },
    requirements: {
      count: Object.keys(request.requirementCompliances).length,
      total: Object.keys(request.requirementCompliances).length,
    },
    satisfactionSurvey: satisfactionSurvey ?? undefined,
    channel: channel ?? undefined,
  };
};

export const getPrioritiesAsOptions = async (tenantId: string) => {
  const session = await auth();
  if (!session) throw new UserNotFoundErr();

  const priorities = await db.requestPriorityType.findMany({
    select: { id: true, name: true, primaryColor: true },
    where: { tenantId },
  });

  return priorities.map((status) => ({
    label: status.name,
    value: status.id,
  }));
};

export const getStatusesAsOptions = async (tenantId: string, levels: number[] = [STATUS.DRAFT, STATUS.REVIEW, STATUS.APPROVED, STATUS.IMPLEMENTING, STATUS.CLOSED]) => {
  const session = await auth();
  if (!session) throw new UserNotFoundErr();

  const priorities = await db.requestStatusType.findMany({
    select: { id: true, name: true },
    where: { tenantId, level: { in: levels } },
  });

  return priorities.map((priority) => ({
    label: priority.name,
    value: priority.id,
  }));
};

async function getAncestorCategories(categoryId: string, tableName: 'RequestCategory' | 'AssignmentCategory') {
  if (!['RequestCategory', 'AssignmentCategory'].includes(tableName)) throw new Error('Invalid table name');

  const query = `
    WITH Ancestors AS (
      SELECT id, name, parentCategoryId, 0 AS [level] 
      FROM ${tableName} WHERE id = @categoryId
      UNION ALL
      SELECT c.id, c.name, c.parentCategoryId, a.[level] + 1 
      FROM ${tableName} c 
      INNER JOIN Ancestors a ON c.id = a.parentCategoryId
    )
    SELECT id, name, [level] FROM Ancestors ORDER BY [level] DESC;
  `;

  const ancestors: { id: string; name: string; parentCategoryId: string | null; level: number }[] = await db.$queryRawUnsafe(query.replace('@categoryId', `'${categoryId}'`));

  return ancestors.map((category, index) => ({
    label: category.name,
    value: category.id,
    position: index,
  }));
}
