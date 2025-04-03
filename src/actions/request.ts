'use server';

import { AssignmentTypeEnum } from '@/constants/assignment-type';
import { PermissionActions } from '@/constants/permissions';
import { STATUS } from '@/constants/requests';
import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-server';

import { RequestDefaultArgs, RequestDetailsType, RequestType } from '@/types/prisma/request';
import { UserAreaWithRoleType, UserTenantWithAreaDefaultArgs } from '@/types/prisma/user';
import { RequestFormStepperType } from '@/components/common/request/request-form-stepper';

class UserNotFoundErr extends Error {}

type AssignmentWithRelations = {
  status: { id: string; name: string };
  priority: { id: string; name: string };
  area: { id: string; name: string };
  requestCategory: { id: string; name: string };
  assignmentCategory: { id: string; name: string };
  isActive: boolean;
};

export const upsertRequest = async (tenantId: string, data: RequestFormStepperType) => {
  const session = await currentSession();
  if (!session?.user?.id) throw new UserNotFoundErr('User not found');

  // Validate categories
  if (data.requestCategory.length === 0) throw new Error('Request category is required');
  if (data.assignmentCategory.length === 0) throw new Error('Assignment category is required');

  // Get existing request with relations
  const existingRequest = await db.request.findUnique({
    ...RequestDefaultArgs,
    where: { id: data.id, tenantId },
  });

  return existingRequest ? await handleUpdate(existingRequest, tenantId, data, session.user.id) : await handleCreate(tenantId, data, session.user.id);
};

// ========================
// CREATE REQUEST
// ========================
const handleCreate = async (tenantId: string, data: RequestFormStepperType, userId: string) => {
  const [userAreas, requirementCompliances, assignmentType] = await Promise.all([
    getAreaWithSupervisors(tenantId, data.areaId.value),
    db.requestCategoryRequirement.findMany({
      where: { categoryId: { in: data.requestCategory.map((rc) => rc.value) } },
      select: { requirementId: true, isActive: true },
    }),
    db.assignmentType.findFirstOrThrow({
      where: { systemName: AssignmentTypeEnum.SERVICE_REQUEST, tenantId },
      select: { id: true },
    }),
  ]);

  return db.$transaction(async (tx) => {
    // Create Dataroom
    const newDataroom = await tx.dataroom.create({
      data: {
        tenantId,
        pId: `request-${data.id}`,
        name: `Request ${data.id}`,
        description: data.description,
        createdBy: userId,
      },
    });

    console.log('🚀 ~ handleCreate ~ newDataroom:', newDataroom);

    // Create Request and associate with Dataroom
    const newRequest = await tx.request.create({
      data: {
        id: data.id,
        tenantId,
        issueSubject: data.issueSubject,
        description: data.description,
        comment: data.comment,
        requestAssignments: {
          create: createAssignmentData(tenantId, data, assignmentType.id, userAreas),
        },
        complianceTrackings: {
          create: requirementCompliances.map((rc) => ({
            tenantId,
            isArchived: !rc.isActive,
            requirementId: rc.requirementId,
            isFulfilled: data.requirementCompliances[rc.requirementId] ?? false,
          })),
        },
        formSubmission: {
          create: processFormSubmissions(data.submissions, tenantId),
        },
        channel: {
          create: {
            tenantId,
            name: `Request ${data.id}`,
          },
        },
        dataroom: {
          connect: {
            id: newDataroom.id,
          },
        },
      },
    });

    console.log('🚀 ~ handleCreate ~ newRequest:', newRequest);

    // Log the change in request creation
    await tx.requestChangeLog.create({
      data: {
        tenantId,
        requestId: newRequest.id,
        changedBy: userId,
        fieldName: 'request_created',
        oldValue: null,
        newValue: null,
        changedAt: new Date(),
      },
    });

    // Return the request with the dataroomId
    return { ...newRequest, dataroomId: newDataroom.id };
  });
};

// ========================
// UPDATE REQUEST
// ========================
const handleUpdate = async (existingRequest: RequestType, tenantId: string, data: RequestFormStepperType, userId: string) => {
  const [area, requirementCompliances, assignmentType] = await Promise.all([
    getAreaWithSupervisors(tenantId, data.areaId.value),
    db.requestCategoryRequirement.findMany({
      where: { categoryId: { in: data.requestCategory.map((rc) => rc.value) } },
      select: { requirementId: true, isActive: true },
    }),
    db.assignmentType.findFirstOrThrow({
      where: { systemName: AssignmentTypeEnum.SERVICE_REQUEST, tenantId },
      select: { id: true },
    }),
  ]);

  return db.$transaction(async (tx) => {
    // Update main request
    const updatedRequest = await tx.request.update({
      where: { id: existingRequest.id, tenantId },
      data: {
        issueSubject: data.issueSubject,
        description: data.description,
        comment: data.comment,
        requestAssignments: {
          updateMany: {
            where: { isActive: true },
            data: { isActive: false },
          },
          create: createAssignmentData(tenantId, data, assignmentType.id, area),
        },
        complianceTrackings: {
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
              isFulfilled: data.requirementCompliances[rc.requirementId] ?? false,
            },
            update: {
              isArchived: !rc.isActive,
              isFulfilled: data.requirementCompliances[rc.requirementId] ?? false,
            },
          })),
        },
        formSubmission: {
          upsert: processFormSubmissions(data.submissions, tenantId).map((s) => ({
            where: {
              formId_tenantId_requestId: {
                tenantId,
                formId: s.formId,
                requestId: data.id,
              },
            },
            create: s,
            update: {
              content: s.content,
              keys: {
                deleteMany: {},
                createMany: { data: s.keys.createMany.data },
              },
            },
          })),
        },
      },
      include: {
        requestAssignments: {
          where: { isActive: true },
          include: {
            status: true,
            priority: true,
            area: true,
            requestCategory: true,
            assignmentCategory: true,
          },
        },
      },
    });

    // Detect and log changes
    const changes = detectChanges(existingRequest, updatedRequest);

    for (const change of changes) {
      await tx.requestChangeLog.create({
        data: {
          tenantId,
          requestId: updatedRequest.id,
          changedBy: userId,
          fieldName: change.fieldName,
          oldValue: change.oldValue?.toString().substring(0, 500), // Limit to 500 characters
          newValue: change.newValue?.toString().substring(0, 500),
          changedAt: new Date(),
        },
      });
    }

    return updatedRequest;
  });
};

// ========================
// HELPER FUNCTIONS
// ========================
const getAreaWithSupervisors = async (tenantId: string, areaId: string) => {
  return db.userTenant.findMany({
    ...UserTenantWithAreaDefaultArgs,
    where: {
      tenantId,
      OR: [
        // User has global permission to assign users
        {
          userAreas: {
            some: {
              role: {
                areaRoleFeatures: {
                  some: {
                    feature: {
                      key: PermissionActions.REQUEST_MANAGEMENT.ASSIGN_USER,
                    },
                  },
                },
              },
            },
          },
        },
        // User has scoped permission to assign users in the current area
        {
          userAreas: {
            some: {
              areaId: areaId,
              role: {
                areaRoleFeatures: {
                  some: {
                    feature: {
                      key: PermissionActions.REQUEST_MANAGEMENT.SCOPED_ASSIGN_USER,
                    },
                  },
                },
              },
            },
          },
        },
      ],
    },
  });
};

const createAssignmentData = (tenantId: string, data: RequestFormStepperType, assignmentTypeId: string, userAreas: UserAreaWithRoleType[]) => ({
  tenantId,
  typeId: assignmentTypeId,
  areaId: data.areaId.value,
  statusId: data.statusId.value,
  priorityId: data.priorityId.value,
  requestCategoryId: data.requestCategory.slice(-1)[0].value,
  assignmentCategoryId: data.assignmentCategory.slice(-1)[0].value,
  assignmentDate: new Date(),
  assignedUsers: {
    create: userAreas.map((ua) => ({
      tenantId,
      userTenantId: ua.id,
      role: ua.userAreas.find((ua) => ua.areaId === data.areaId.value)?.role.name ?? 'User',
    })),
  },
});

const processFormSubmissions = (submissions: RequestFormStepperType['submissions'], tenantId: string) => {
  if (!submissions) return [];

  return Object.entries(submissions).map(([formId, response]) => {
    const keys = Object.entries(response).reduce(
      (acc, [key, value]) => {
        if (typeof value === 'string' || typeof value === 'number') {
          acc[key] = value.toString();
        }
        return acc;
      },
      {} as Record<string, string>
    );

    return {
      formId,
      tenantId,
      content: JSON.stringify(response),
      keys: {
        createMany: {
          data: Object.entries(keys).map(([key, val]) => ({
            key,
            value: val,
            tenantId,
          })),
        },
      },
    };
  });
};

const detectChanges = (oldRequest: RequestType, newRequest: RequestType) => {
  const changes: Array<{
    fieldName: string;
    oldValue?: string | null;
    newValue?: string | null;
  }> = [];

  // Direct properties of the Request object
  const mainFields: Array<keyof typeof oldRequest> = ['issueSubject', 'description', 'comment'];

  // Compare the main fields of the request object
  for (const field of mainFields) {
    if (oldRequest[field] !== newRequest[field]) {
      changes.push({
        fieldName: field,
        oldValue: oldRequest[field]?.toString(),
        newValue: newRequest[field]?.toString(),
      });
    }
  }

  // Campos del Assignment
  // Fields of the assignment object
  const oldAssignment = oldRequest.requestAssignments[0];
  const newAssignment = newRequest.requestAssignments[0];

  if (oldAssignment && newAssignment) {
    // Safe type for assignment properties
    type AssignmentField = keyof Pick<AssignmentWithRelations, 'status' | 'priority' | 'area' | 'requestCategory' | 'assignmentCategory'>;

    const assignmentFields: { name: string; prop: AssignmentField }[] = [
      { name: 'status', prop: 'status' },
      { name: 'priority', prop: 'priority' },
      { name: 'area', prop: 'area' },
      { name: 'requestCategory', prop: 'requestCategory' },
      { name: 'assignmentCategory', prop: 'assignmentCategory' },
    ];

    // Compare nested fields
    for (const { name, prop } of assignmentFields) {
      const oldVal = oldAssignment[prop]?.name;
      const newVal = newAssignment[prop]?.name;

      if (oldVal !== newVal) {
        changes.push({
          fieldName: name,
          oldValue: oldVal,
          newValue: newVal,
        });
      }
    }
  }

  return changes;
};

export const getRequestById = async (tenantId: string, requestId: string): Promise<RequestFormStepperType> => {
  const session = await currentSession();
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
  const session = await currentSession();
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
  const dataroom = await db.dataroom.findFirst({
    where: { requestId: request.id },
    select: { id: true, name: true, createdAt: true },
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
    dataroom: dataroom ?? undefined,
  };
};

export const getPrioritiesAsOptions = async (tenantId: string) => {
  const session = await currentSession();
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
  const session = await currentSession();
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
