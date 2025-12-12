'use server';

import { getAuthContext } from '@/actions/authorization';
import { AssignmentTypeEnum } from '@/constants/assignment-type';
import { PermissionActions } from '@/constants/permissions';
import { currentSession } from '@/server/auth-server';
import { getDb } from '@/server/db-client';

import { NotificationTypeEnum } from '@/types/notification';
import { ExecutionFlowDefaultArgs } from '@/types/zenstackhq/execution-flow';
import { RequestDefaultArgs, RequestDetailsType, RequestType } from '@/types/zenstackhq/request';
import { UserAreaWithRoleType, UserTenantWithAreaDefaultArgs } from '@/types/zenstackhq/user';
import { transformExecutionFlowToZodSchema } from '@/lib/execution-flow';
import { normalizeValue } from '@/lib/utils';
import { RequestFormStepperType } from '@/components/common/request/request-form-stepper';

import { sendInAppNotification /*, sendSMSNotification*/ } from './notification';
import { getInitialStatusFromDatabase } from './workflow';

class UserNotFoundErr extends Error {}

/**
 * Validates that a category is a leaf node (no subcategories) and at the last level of the hierarchy.
 * @param categoryName - Name of the category for error messages
 * @param subcategoryCount - Number of subcategories the category has
 * @param levelPosition - Position of the category's hierarchy level
 * @param totalLevels - Total number of levels in the hierarchy
 * @param categoryType - Type of category ('Request' or 'Assignment') for error messages
 * @throws Error if the category is not a valid leaf category
 */
const validateLeafCategory = (categoryName: string, subcategoryCount: number, levelPosition: number, totalLevels: number, categoryType: 'Request' | 'Assignment'): void => {
  // Check if category has subcategories (not a leaf node)
  if (subcategoryCount > 0) {
    throw new Error(`${categoryType} category "${categoryName}" cannot be selected directly. Please select a more specific subcategory.`);
  }

  // Check if category is at the last level of the hierarchy
  if (levelPosition !== totalLevels) {
    throw new Error(`${categoryType} category "${categoryName}" is not at the last level of the hierarchy (level ${levelPosition} of ${totalLevels}). Please select a category from the final level.`);
  }
};

type AssignmentWithRelations = {
  status: { id: string; name: string };
  priority: { id: string; name: string };
  area: { id: string; name: string };
  requestCategory: { id: string; name: string };
  assignmentCategory: { id: string; name: string };
  assignedUsers: {
    userTenant: {
      id: string;
      person: { phone: string | null } | null;
      user: { email: string | null };
    };
    role: string;
  }[];
  isActive: boolean;
};

export const upsertRequest = async (tenantId: string, data: RequestFormStepperType) => {
  const session = await currentSession();
  if (!session?.user?.id) throw new UserNotFoundErr('User not found');

  const db = await getDb();

  // Validate categories
  if (data.requestCategory.length === 0) throw new Error('Request category is required');
  if (data.assignmentCategory.length === 0) throw new Error('Assignment category is required');

  // Validate that only leaf categories (last level, no subcategories) are selected
  const finalRequestCategoryId = data.requestCategory.slice(-1)[0].value;
  const finalAssignmentCategoryId = data.assignmentCategory.slice(-1)[0].value;

  const [requestCategory, assignmentCategory] = await Promise.all([
    db.requestCategory.findUnique({
      where: { id: finalRequestCategoryId, tenantId },
      select: {
        id: true,
        name: true,
        subcategories: { select: { id: true } },
        hierarchyLevel: {
          select: {
            id: true,
            position: true,
            hierarchy: {
              select: {
                id: true,
                levels: {
                  select: { id: true, position: true },
                  orderBy: { position: 'asc' },
                },
              },
            },
          },
        },
      },
    }),
    db.assignmentCategory.findUnique({
      where: { id: finalAssignmentCategoryId, tenantId },
      select: {
        id: true,
        name: true,
        subcategories: { select: { id: true } },
        hierarchyLevel: {
          select: {
            id: true,
            position: true,
            hierarchy: {
              select: {
                id: true,
                levels: {
                  select: { id: true, position: true },
                  orderBy: { position: 'asc' },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  if (!requestCategory) {
    throw new Error('Request category not found');
  }
  if (!assignmentCategory) {
    throw new Error('Assignment category not found');
  }

  // Validate request category: must be a leaf node (no subcategories) and at the last hierarchy level
  validateLeafCategory(requestCategory.name, requestCategory.subcategories.length, requestCategory.hierarchyLevel.position, requestCategory.hierarchyLevel.hierarchy.levels.length, 'Request');

  // Validate assignment category: must be a leaf node (no subcategories) and at the last hierarchy level
  validateLeafCategory(
    assignmentCategory.name,
    assignmentCategory.subcategories.length,
    assignmentCategory.hierarchyLevel.position,
    assignmentCategory.hierarchyLevel.hierarchy.levels.length,
    'Assignment'
  );

  // Get existing request with relations
  const existingRequest = await db.request.findUnique({
    ...RequestDefaultArgs,
    where: { id: data.id, tenantId },
  });

  // RBAC checks
  const auth = await getAuthContext(tenantId);
  const targetAreaId = existingRequest ? existingRequest.requestAssignments.find((ra) => ra.isActive)?.areaId || existingRequest.requestAssignments[0]?.areaId : data.areaId.value;

  if (existingRequest) {
    const canEdit = auth.hasPermissions([PermissionActions.REQUEST_MANAGEMENT.EDIT]) || auth.hasAreaPermissions(targetAreaId, [PermissionActions.REQUEST_MANAGEMENT.SCOPED_EDIT]);
    if (!canEdit) {
      throw new Error('Forbidden: lacking permissions to edit this request');
    }
  } else {
    const canCreate = auth.hasPermissions([PermissionActions.REQUEST_MANAGEMENT.CREATE]) || auth.hasAreaPermissions(targetAreaId, [PermissionActions.REQUEST_MANAGEMENT.SCOPED_CREATE]);
    if (!canCreate) {
      throw new Error('Forbidden: lacking permissions to create request in this area');
    }
  }

  //check if flow exists
  const flow = await db.executionFlowDefinition.findFirst({
    where: { requestCategoryId: data.requestCategory.slice(-1)[0].value, tenantId, isActive: true },
    select: { id: true },
  });

  const result = existingRequest ? await handleUpdate(existingRequest, tenantId, data, session.user.id, flow?.id) : await handleCreate(tenantId, data, session.user.id, flow?.id);
  const recipients: string[] = result.requestAssignments.flatMap((assignment: AssignmentWithRelations) => assignment.assignedUsers.map((user) => user.userTenant.id));

  await sendInAppNotification({
    tenantId,
    body: {
      type: NotificationTypeEnum.ASSIGNMENT,
      data: {
        requestId: data.id,
      },
    },
    recipients: recipients.map((userTenantId) => ({ userTenantId })),
  });

  /*
  const phones = result.requestAssignments.flatMap((assignment: AssignmentWithRelations) =>
    assignment.assignedUsers.map((user) => user.userTenant.person?.phone).filter((phone): phone is string => typeof phone === 'string' && phone.trim() !== '')
  );
  const phoneNumbers = Array.from(new Set(phones));
  await sendSMSNotification({
    tenantId,
    locale: 'es',
    type: NotificationTypeEnum.ASSIGNMENT,
    data: {
      requestId: data.id,
    },
    recipients: phoneNumbers.map((phone) => ({ phoneNumber: phone })),
  });*/

  return result;
};

// ========================
// CREATE REQUEST
// ========================
// ========================
// BETTER SOLUTION: Handle form submissions after request creation
// ========================
const handleCreate = async (tenantId: string, data: RequestFormStepperType, userId: string, flowId: string | null = null) => {
  const db = await getDb();
  // Move data preparation OUTSIDE the transaction
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

  // Pre-process assignment data outside transaction
  const assignmentData = await createAssignmentData(tenantId, data, assignmentType.id, userAreas);
  const formSubmissionData = processFormSubmissions(data.submissions, tenantId);
  const complianceData = requirementCompliances.map((rc) => ({
    tenantId,
    isArchived: !rc.isActive,
    requirementId: rc.requirementId,
    isFulfilled: data.requirementCompliances[rc.requirementId] ?? false,
  }));

  return db.$transaction(
    async (tx) => {
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

      // Create Request
      const newRequest = await tx.request.create({
        data: {
          id: data.id,
          tenantId,
          issueSubject: data.issueSubject,
          description: data.description,
          isDraft: data.isDraft,
          requestAssignments: {
            create: assignmentData,
          },
          complianceTrackings: {
            createMany: {
              data: complianceData,
            },
          },
          channel: {
            create: {
              tenantId,
              name: `Request ${data.id}`,
            },
          },
          executionModelInstance: flowId
            ? {
                create: {
                  tenantId,
                  flowId: flowId,
                  status: 'idle',
                },
              }
            : undefined,
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
              assignedUsers: {
                include: {
                  userTenant: {
                    select: {
                      id: true,
                      role: true,
                      person: {
                        select: {
                          phone: true,
                        },
                      },
                      user: {
                        select: {
                          email: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          requestDatarooms: {
            select: {
              dataroomId: true,
            },
          },
        },
      });

      // Handle form submissions separately with upsert
      for (const submission of formSubmissionData) {
        await tx.formSubmission.upsert({
          where: {
            formId_tenantId_requestId: {
              tenantId: submission.tenantId,
              formId: submission.formId,
              requestId: data.id,
            },
          },
          create: {
            formId: submission.formId,
            tenantId: submission.tenantId,
            requestId: data.id,
            content: submission.content,
            keys: {
              createMany: {
                data: submission.keys.createMany.data,
              },
            },
          },
          update: {
            content: submission.content,
            keys: {
              deleteMany: {},
              createMany: {
                data: submission.keys.createMany.data,
              },
            },
          },
        });
      }

      // Create Request-Dataroom relationship through junction table
      await tx.requestDataroom.create({
        data: {
          tenantId,
          requestId: newRequest.id,
          dataroomId: newDataroom.id,
          createdBy: userId,
        },
      });

      // Log the change in request creation
      await tx.requestChangeLog.create({
        data: {
          tenantId,
          requestId: newRequest.id,
          updatedBy: userId,
          updatedAt: new Date(),
          fieldName: 'request_created',
          oldValue: null,
          newValue: null,
        },
      });

      // Return the request (dataroom is accessible via requestDatarooms relation)
      return newRequest;
    },
    {
      // Increase timeout to 15 seconds
      timeout: 15000,
      // Set isolation level if needed
      isolationLevel: 'ReadCommitted',
    }
  );
};

// ========================
// UPDATE REQUEST (Alternative approach - Split transactions)
// ========================
const handleUpdate = async (existingRequest: RequestType, tenantId: string, data: RequestFormStepperType, userId: string, flowId: string | null = null) => {
  const db = await getDb();
  // Move data preparation OUTSIDE the transaction
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

  // Pre-process all data outside transaction
  const assignmentData = await createAssignmentData(tenantId, data, assignmentType.id, area);
  const formSubmissionData = processFormSubmissions(data.submissions, tenantId);
  const complianceUpsertData = requirementCompliances.map((rc) => ({
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
  }));

  const formUpsertData = formSubmissionData.map((s) => ({
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
  }));

  return db.$transaction(
    async (tx) => {
      // Update main request
      const updatedRequest = await tx.request.update({
        where: { id: existingRequest.id, tenantId },
        data: {
          issueSubject: data.issueSubject,
          description: data.description,
          isDraft: data.isDraft,
          requestAssignments: {
            updateMany: {
              where: { isActive: true },
              data: { isActive: false },
            },
            create: assignmentData,
          },
          complianceTrackings: {
            upsert: complianceUpsertData,
          },
          formSubmission: {
            upsert: formUpsertData,
          },
          executionModelInstance: flowId
            ? {
                upsert: {
                  where: {
                    requestId: data.id, // Add proper where clause
                  },
                  create: {
                    tenantId,
                    flowId: flowId,
                    status: 'idle',
                  },
                  update: {
                    flowId: flowId,
                    status: 'idle',
                  },
                },
              }
            : undefined,
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
              assignedUsers: {
                include: {
                  userTenant: {
                    select: {
                      id: true,
                      role: true,
                      person: {
                        select: {
                          phone: true,
                        },
                      },
                      user: {
                        select: {
                          email: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          requestDatarooms: {
            select: {
              dataroomId: true,
            },
          },
        },
      });

      // Detect and log changes
      const changes = detectChanges(existingRequest, updatedRequest);

      // Batch create change logs if there are many
      if (changes.length > 0) {
        await tx.requestChangeLog.createMany({
          data: changes.map((change) => ({
            tenantId,
            requestId: updatedRequest.id,
            updatedBy: userId,
            updatedAt: new Date(),
            fieldName: change.fieldName,
            oldValue: change.oldValue?.toString().substring(0, 500),
            newValue: change.newValue?.toString().substring(0, 500),
          })),
        });
      }

      return updatedRequest;
    },
    {
      // Increase timeout to 15 seconds
      timeout: 15000,
      // Set isolation level if needed
      isolationLevel: 'ReadCommitted',
    }
  );
};

// ========================
// HELPER FUNCTIONS
// ========================
const getAreaWithSupervisors = async (tenantId: string, areaId: string) => {
  const db = await getDb();
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

const createAssignmentData = async (tenantId: string, data: RequestFormStepperType, assignmentTypeId: string, userAreas: UserAreaWithRoleType[]) => {
  const statusId = normalizeValue(data.statusId?.value) ?? (await getInitialStatusFromDatabase(tenantId, data.requestCategory.slice(-1)[0].value)).id;
  return {
    tenantId,
    typeId: assignmentTypeId,
    areaId: data.areaId.value,
    statusId: statusId,
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
  };
};

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
  const mainFields: Array<keyof typeof oldRequest> = ['issueSubject', 'description'];

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

  const db = await getDb();
  const request = await db.request.findUniqueOrThrow({
    where: { id: requestId, tenantId },
    select: {
      id: true,
      slug: true,
      issueSubject: true,
      description: true,
      isDraft: true,
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
    slug: request.slug ?? undefined,
    requestCategory,
    assignmentCategory,
    isDraft: request.isDraft,
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

  const db = await getDb();
  const requestCategoryId = request.requestCategory.slice(-1)[0].value;
  const assignmentCategoryId = request.assignmentCategory.slice(-1)[0].value;
  const requestCategoryIds = request.requestCategory.map((rc) => rc.value);

  // todo: we can improve this by using a single query
  const submissions = await db.formSubmission.count({ where: { requestId: request.id, tenantId } });
  const forms = await db.requestCategoryForm.count({ where: { categoryId: { in: requestCategoryIds }, tenantId } });
  const satisfactionSurvey = await db.customerSatisfactionSurvey.findFirst({
    where: { requestId: request.id },
    select: { rating: true, feedback: true, submittedAt: true },
  });
  const channel = await db.channel.findFirst({
    select: { id: true, name: true, createdAt: true },
    where: { requestId: request.id },
  });
  const requestDataroom = await db.requestDataroom.findUnique({
    where: { requestId: request.id },
    include: { dataroom: { select: { id: true, name: true, createdAt: true } } },
  });
  const dataroom = requestDataroom?.dataroom;

  const guides = await db.guideDocument.findMany({
    select: { id: true, name: true, description: true, fileType: true, fileUrl: true, version: true, updatedAt: true },
    where: { tenantId, requestCategoryId: { in: request.requestCategory.map((rc) => rc.value) } },
  });

  const requester = await db.userTenant.findFirst({
    where: { userId: session.user.id, tenantId },
    select: {
      person: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  const assignedUsers = await db.assignedUser.findMany({
    where: { requestAssignment: { requestId: request.id, tenantId, isActive: true } },
    select: {
      isCoordinator: true,
      userTenant: {
        select: {
          id: true,
          person: { select: { firstName: true, lastName: true } },
          user: { select: { email: true } },
        },
      },
    },
  });

  const relatedRequestCount = await db.requestAssignment.count({
    where: { requestCategoryId, requestId: { not: request.id }, tenantId, isActive: true },
  });

  const relatedAssignmentCount = await db.requestAssignment.count({
    where: { assignmentCategoryId, requestId: { not: request.id }, tenantId, isActive: true },
  });

  // todo: we should bring the last execution flow but at the same time respect the migration
  const executionFlow = await db.executionFlowDefinition.findFirst({
    where: { requestCategoryId, tenantId, isActive: true },
    ...ExecutionFlowDefaultArgs,
  });

  const executionId = await db.executionModelInstance.findFirst({
    //todo: check if status is correct
    where: { requestId: request.id, tenantId, status: { notIn: ['completed', 'failed'] } },
    select: { id: true },
  });

  // Get execution logs if execution exists
  const executionLogs = executionId?.id
    ? await db.executionModelLog.findMany({
        where: { executionId: executionId.id, tenantId },
        select: {
          id: true,
          nodeId: true,
          eventType: true,
          details: true,
          outcome: true,
          timestamp: true,
        },
        orderBy: {
          timestamp: 'asc',
        },
      })
    : [];

  return {
    guides,
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
    requester: {
      name: requester?.person ? `${requester.person.firstName} ${requester.person.lastName}` : 'N/A',
      email: requester?.user ? requester.user.email : 'N/A',
    },
    assignedUsers: (assignedUsers ?? []).map((user) => ({
      user: {
        value: user.userTenant.id,
        label: user.userTenant.person ? `${user.userTenant.person.firstName} ${user.userTenant.person.lastName} (${user.userTenant.user.email})` : user.userTenant.user.email,
      },
      isCoordinator: user.isCoordinator,
    })),
    relatedAssignmentCount,
    relatedRequestCount,
    executionFlow:
      executionFlow && executionId
        ? {
            executionId: executionId.id,
            diagram: transformExecutionFlowToZodSchema(executionFlow),
            logs: executionLogs,
          }
        : undefined,
  };
};

export const getPrioritiesAsOptions = async (tenantId: string) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  const db = await getDb();
  const priorities = await db.requestPriorityType.findMany({
    select: { id: true, name: true, primaryColor: true },
    where: { tenantId, isActive: true },
  });

  return priorities.map((status) => ({
    label: status.name,
    value: status.id,
  }));
};

async function getAncestorCategories(categoryId: string, tableName: 'RequestCategory' | 'AssignmentCategory') {
  if (!['RequestCategory', 'AssignmentCategory'].includes(tableName)) throw new Error('Invalid table name');

  const db = await getDb();
  let allCategories: { id: string; name: string; parentCategoryId: string | null }[] = [];
  if (tableName === 'RequestCategory') {
    allCategories = await db.requestCategory.findMany({
      select: { id: true, name: true, parentCategoryId: true },
    });
  } else {
    allCategories = await db.assignmentCategory.findMany({
      select: { id: true, name: true, parentCategoryId: true },
    });
  }

  // Build the ancestor tree in memory
  const categoryMap = new Map(allCategories.map((cat) => [cat.id, cat]));
  const ancestors: { id: string; name: string }[] = [];
  let currentId: string | null = categoryId;

  // Traverse up the tree to collect all ancestors
  while (currentId) {
    const category = categoryMap.get(currentId);
    if (!category) break;
    ancestors.push({ id: category.id, name: category.name });
    currentId = category.parentCategoryId;
  }

  // Return ancestors from the highest to the lowest
  return ancestors.reverse().map((category, index) => ({
    label: category.name,
    value: category.id,
    position: index,
  }));
}

export const getRequestsFilteredByAreaAccess = async (tenantId: string) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  const db = await getDb();
  const auth = await getAuthContext(tenantId);

  // Check if user has global VIEW permission
  const hasGlobalView = auth.hasPermissions([PermissionActions.REQUEST_MANAGEMENT.VIEW]);

  if (hasGlobalView) {
    // User can see all requests, no filtering needed
    return { tenantId };
  }

  // Get user's areas
  const userAreas = await db.userTenant.findUnique({
    where: { userId_tenantId: { userId: session.user.id, tenantId } },
    select: {
      userAreas: {
        where: { isActive: true },
        select: { areaId: true },
      },
    },
  });

  if (!userAreas || userAreas.userAreas.length === 0) {
    // User has no assigned areas, return filter that matches nothing
    return { tenantId, id: { in: [] } };
  }

  const areaIds = userAreas.userAreas.map((ua) => ua.areaId);

  // Return filter with area restriction
  return {
    tenantId,
    requestAssignments: {
      some: {
        isActive: true,
        areaId: { in: areaIds },
      },
    },
  };
};
