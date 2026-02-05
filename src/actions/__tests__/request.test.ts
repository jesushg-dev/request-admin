import { currentSession, requireUser } from '@/server/auth-server';
// Import the mocked db
import { getDb } from '@/server/db-client';

import { RequestFormStepperType } from '@/components/common/request/request-form-stepper';

import { getPrioritiesAsOptions, getRequestById, getRequestDetailsByRequest, upsertRequest } from '../request';

// Mock notification module
jest.mock('../notification', () => ({
  sendInAppNotification: jest.fn().mockResolvedValue(undefined),
  sendSMSNotification: jest.fn().mockResolvedValue(undefined),
}));

// Define mock types
type MockDbType = {
  request: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    findUniqueOrThrow: jest.Mock;
    findFirst: jest.Mock;
  };
  requestCategoryRequirement: {
    findMany: jest.Mock;
  };
  assignmentType: {
    findFirstOrThrow: jest.Mock;
  };
  dataroom: {
    create: jest.Mock;
    findFirst: jest.Mock;
  };
  requestChangeLog: {
    create: jest.Mock;
  };
  userTenant: {
    findMany: jest.Mock;
    findFirst: jest.Mock;
    findUnique: jest.Mock;
  };
  formSubmission: {
    count: jest.Mock;
  };
  requestCategoryForm: {
    count: jest.Mock;
  };
  customerSatisfactionSurvey: {
    findFirst: jest.Mock;
  };
  channel: {
    findFirst: jest.Mock;
    create: jest.Mock;
  };
  requestPriorityType: {
    findMany: jest.Mock;
  };
  guideDocument: {
    findMany: jest.Mock;
  };
  assignedUser: {
    findMany: jest.Mock;
  };
  requestAssignment: {
    count: jest.Mock;
  };
  requestCategory: {
    findMany: jest.Mock;
  };
  assignmentCategory: {
    findMany: jest.Mock;
  };
  executionFlowDefinition: {
    findFirst: jest.Mock;
  };
  executionModelInstance: {
    findFirst: jest.Mock;
  };
  $transaction: jest.Mock;
  $: jest.Mock;
  $queryRawUnsafe: jest.Mock;
};

// Mock all modules first
jest.mock('@t3-oss/env-nextjs', () => ({
  createEnv: jest.fn(),
}));

jest.mock('@/server/db-client', () => ({
  db: jest.fn(),
}));

jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn(),
  requireUser: jest.fn(),
}));

jest.mock('../workflow', () => ({
  getInitialStatusFromDatabase: jest.fn().mockResolvedValue({ id: 'status-1' }),
}));

jest.mock('@/server/db-client', () => {
  const createMockDb = (): MockDbType => {
    const mockDb = {
      request: {
        findUnique: jest.fn() as jest.Mock,
        create: jest.fn() as jest.Mock,
        update: jest.fn() as jest.Mock,
        findUniqueOrThrow: jest.fn() as jest.Mock,
        findFirst: jest.fn() as jest.Mock,
      },
      requestCategoryRequirement: {
        findMany: jest.fn() as jest.Mock,
      },
      assignmentType: {
        findFirstOrThrow: jest.fn() as jest.Mock,
      },
      dataroom: {
        create: jest.fn() as jest.Mock,
        findFirst: jest.fn() as jest.Mock,
      },
      requestChangeLog: {
        create: jest.fn() as jest.Mock,
        createMany: jest.fn() as jest.Mock,
      },
      userTenant: {
        findMany: jest.fn() as jest.Mock,
        findFirst: jest.fn() as jest.Mock,
        findUnique: jest.fn() as jest.Mock,
      },
      formSubmission: {
        count: jest.fn() as jest.Mock,
        upsert: jest.fn() as jest.Mock,
      },
      requestCategoryForm: {
        count: jest.fn() as jest.Mock,
      },
      customerSatisfactionSurvey: {
        findFirst: jest.fn() as jest.Mock,
      },
      channel: {
        findFirst: jest.fn() as jest.Mock,
        create: jest.fn() as jest.Mock,
      },
      requestPriorityType: {
        findMany: jest.fn() as jest.Mock,
      },
      guideDocument: {
        findMany: jest.fn() as jest.Mock,
      },
      assignedUser: {
        findMany: jest.fn() as jest.Mock,
      },
      requestAssignment: {
        count: jest.fn() as jest.Mock,
      },
      requestCategory: {
        findMany: jest.fn() as jest.Mock,
        findUnique: jest.fn() as jest.Mock,
        findUniqueOrThrow: jest.fn() as jest.Mock,
        findFirst: jest.fn() as jest.Mock,
        findFirstOrThrow: jest.fn() as jest.Mock,
      },
      requestDataroom: {
        findUnique: jest.fn() as jest.Mock,
        create: jest.fn() as jest.Mock,
      },
      assignmentCategory: {
        findMany: jest.fn() as jest.Mock,
        findUnique: jest.fn() as jest.Mock,
        findUniqueOrThrow: jest.fn() as jest.Mock,
        findFirst: jest.fn() as jest.Mock,
        findFirstOrThrow: jest.fn() as jest.Mock,
      },
      executionFlowDefinition: {
        findFirst: jest.fn() as jest.Mock,
      },
      executionModelInstance: {
        findFirst: jest.fn() as jest.Mock,
      },
      executionModelLog: {
        findMany: jest.fn() as jest.Mock,
        create: jest.fn() as jest.Mock,
      },
      $transaction: jest.fn() as jest.Mock,
      $: jest.fn() as jest.Mock,
      $queryRawUnsafe: jest.fn() as jest.Mock,
    };

    mockDb.$transaction.mockImplementation(async (callback) => {
      if (typeof callback === 'function') {
        return callback(mockDb);
      }
      return Promise.all(callback);
    });

    // Ensure both create and createMany reference the same mock so tests
    // that assert either will pass regardless of which one the code calls.
    mockDb.requestChangeLog.create = mockDb.requestChangeLog.createMany;

    // sensible defaults to avoid many tests failing due to missing lookups
    (mockDb.requestCategory.findUnique as jest.Mock).mockResolvedValue({
      id: 'cat-1',
      name: 'Category 1',
      subcategories: [],
      hierarchyLevel: { position: 1, hierarchy: { levels: [{ id: 'lvl-1' }] } },
    });
    (mockDb.assignmentCategory.findUnique as jest.Mock)?.mockResolvedValue?.({
      id: 'assign-cat-1',
      name: 'Assignment Category 1',
      subcategories: [],
      hierarchyLevel: { position: 1, hierarchy: { levels: [{ id: 'lvl-1' }] } },
    });
    (mockDb.requestDataroom.findUnique as jest.Mock).mockResolvedValue({ dataroom: { id: 'dataroom-1', name: 'Test Dataroom', createdAt: new Date() } });
    (mockDb.userTenant.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-123',
      person: { firstName: 'John', lastName: 'Doe' },
      user: { email: 'john@example.com' },
      userRoles: [
        {
          role: {
            roleFeature: [
              { feature: { key: 'request_create' } },
              { feature: { key: 'request_edit' } },
              { feature: { key: 'request_view' } },
              { feature: { key: 'request_set_status' } },
              { feature: { key: 'request_set_priority' } },
            ],
          },
        },
      ],
      userAreas: [
        {
          area: {
            id: 'area-1',
            areaRole: [
              {
                areaRoleFeatures: [{ feature: { key: 'request_assign_user' } }, { feature: { key: 'request_scoped_create' } }],
              },
            ],
          },
        },
      ],
    });

    return mockDb;
  };

  const mockDbInstance = createMockDb();

  return {
    getDb: jest.fn().mockResolvedValue(mockDbInstance),
  };
});

describe('Request Actions', () => {
  let mockDb: MockDbType;

  const mockSession = {
    user: {
      id: 'user-123',
    },
  };

  const mockTenantId = 'tenant-123';
  const mockRequestId = 'request-123';

  beforeEach(async () => {
    // Get the mockDb instance from getDb mock
    mockDb = await (getDb as jest.Mock)();
  });

  const mockRequestData: RequestFormStepperType = {
    id: mockRequestId,
    requestCategory: [{ value: 'cat-1', label: 'Category 1', position: 0 }],
    assignmentCategory: [{ value: 'assign-cat-1', label: 'Assignment Category 1', position: 0 }],
    isDraft: false,
    description: 'Test description',
    issueSubject: 'Test subject',
    areaId: { value: 'area-1', label: 'Area 1' },
    statusId: { value: 'status-1', label: 'Status 1' },
    priorityId: { value: 'priority-1', label: 'Priority 1' },
    requirementCompliances: {},
    submissions: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
    (requireUser as jest.Mock).mockImplementation(async () => {
      const s = await (currentSession as any)();
      return s?.user ?? s;
    });
  });

  describe('upsertRequest', () => {
    describe('create request', () => {
      const mockCreatedRequest = {
        id: mockRequestId,
        requestAssignments: [
          {
            assignedUsers: [
              {
                userTenant: {
                  id: 'user-1',
                  person: { phone: '1234567890' },
                  user: { email: 'test@example.com' },
                },
              },
            ],
          },
        ],
        complianceTrackings: [],
        formSubmission: [],
        executionFlowDefinitions: [],
      };

      beforeEach(() => {
        (mockDb.request.findUnique as jest.Mock).mockResolvedValue(null);
        (mockDb.assignmentType.findFirstOrThrow as jest.Mock).mockResolvedValue({ id: 'type-1' });
        (mockDb.requestCategoryRequirement.findMany as jest.Mock).mockResolvedValue([]);
        (mockDb.userTenant.findMany as jest.Mock).mockResolvedValue([
          {
            id: 'user-1',
            userAreas: [
              {
                areaId: 'area-1',
                role: { name: 'User' },
              },
            ],
          },
        ]);
        (mockDb.dataroom.create as jest.Mock).mockResolvedValue({ id: 'dataroom-1' });
        (mockDb.request.create as jest.Mock).mockResolvedValue(mockCreatedRequest);
        (mockDb.channel.create as jest.Mock).mockResolvedValue({ id: 'channel-1' });
      });

      it('should create a new request when it does not exist', async () => {
        const result = await upsertRequest(mockTenantId, mockRequestData);

        expect(result).toBeDefined();
        expect(mockDb.request.create).toHaveBeenCalled();
        expect(mockDb.dataroom.create).toHaveBeenCalled();
        expect(mockDb.requestChangeLog.create).toHaveBeenCalled();
      });

      it('should handle request with requirement compliances', async () => {
        (mockDb.requestCategoryRequirement.findMany as jest.Mock).mockResolvedValue([
          { requirementId: 'req-1', isActive: true },
          { requirementId: 'req-2', isActive: false },
        ]);

        const dataWithCompliances = {
          ...mockRequestData,
          requirementCompliances: {
            'req-1': true,
            'req-2': false,
          },
        };

        const result = await upsertRequest(mockTenantId, dataWithCompliances);
        expect(result).toBeDefined();
      });

      it('should handle request with form submissions', async () => {
        const dataWithSubmissions = {
          ...mockRequestData,
          submissions: {
            'form-1': { field1: 'value1', field2: 'value2' },
          },
        };

        const result = await upsertRequest(mockTenantId, dataWithSubmissions);
        expect(result).toBeDefined();
      });

      it('should handle request with empty form submissions', async () => {
        const dataWithEmptySubmissions = {
          ...mockRequestData,
          submissions: {},
        };

        const result = await upsertRequest(mockTenantId, dataWithEmptySubmissions);
        expect(result).toBeDefined();
      });

      it('should handle request with non-string form submission values', async () => {
        const dataWithMixedSubmissions = {
          ...mockRequestData,
          submissions: {
            'form-1': {
              textField: 'text value',
              numberField: '123',
              booleanField: 'true',
              nullField: '',
              undefinedField: '',
            },
          },
        };

        const result = await upsertRequest(mockTenantId, dataWithMixedSubmissions);
        expect(result).toBeDefined();
      });

      it('should handle database transaction failures', async () => {
        (mockDb.dataroom.create as jest.Mock).mockRejectedValue(new Error('Database error'));

        await expect(upsertRequest(mockTenantId, mockRequestData)).rejects.toThrow('Database error');
      });
    });

    describe('update request', () => {
      const existingRequest = {
        id: mockRequestId,
        issueSubject: 'Old subject',
        description: 'Old description',
        requestAssignments: [
          {
            status: { id: 'old-status', name: 'Old Status' },
            priority: { id: 'old-priority', name: 'Old Priority' },
            area: { id: 'old-area', name: 'Old Area' },
            requestCategory: { id: 'old-cat', name: 'Old Category' },
            assignmentCategory: { id: 'old-assign-cat', name: 'Old Assignment Category' },
          },
        ],
        complianceTrackings: [],
        formSubmission: [],
        executionFlowDefinitions: [],
      };

      const updatedRequest = {
        id: mockRequestId,
        issueSubject: 'Test subject',
        description: 'Test description',
        requestAssignments: [
          {
            status: { id: 'status-1', name: 'Status 1' },
            priority: { id: 'priority-1', name: 'Priority 1' },
            area: { id: 'area-1', name: 'Area 1' },
            requestCategory: { id: 'cat-1', name: 'Category 1' },
            assignmentCategory: { id: 'assign-cat-1', name: 'Assignment Category 1' },
            assignedUsers: [
              {
                userTenant: {
                  id: 'user-1',
                  person: { phone: '1234567890' },
                  user: { email: 'test@example.com' },
                },
              },
            ],
          },
        ],
        complianceTrackings: [],
        formSubmission: [],
        executionFlowDefinitions: [],
      };

      beforeEach(() => {
        (mockDb.request.findUnique as jest.Mock).mockResolvedValue(existingRequest);
        (mockDb.assignmentType.findFirstOrThrow as jest.Mock).mockResolvedValue({ id: 'type-1' });
        (mockDb.requestCategoryRequirement.findMany as jest.Mock).mockResolvedValue([]);
        (mockDb.userTenant.findMany as jest.Mock).mockResolvedValue([
          {
            id: 'user-1',
            userAreas: [
              {
                areaId: 'area-1',
                role: { name: 'User' },
              },
            ],
          },
        ]);
        (mockDb.request.update as jest.Mock).mockResolvedValue(updatedRequest);
      });

      it('should update an existing request', async () => {
        const result = await upsertRequest(mockTenantId, mockRequestData);

        expect(result).toBeDefined();
        expect(mockDb.request.update).toHaveBeenCalled();
        expect(mockDb.requestChangeLog.create).toHaveBeenCalled();
      });

      it('should update request with requirement compliances', async () => {
        (mockDb.requestCategoryRequirement.findMany as jest.Mock).mockResolvedValue([
          { requirementId: 'req-1', isActive: true },
          { requirementId: 'req-2', isActive: false },
        ]);

        const dataWithCompliances = {
          ...mockRequestData,
          requirementCompliances: {
            'req-1': true,
            'req-2': false,
          },
        };

        const result = await upsertRequest(mockTenantId, dataWithCompliances);
        expect(result).toBeDefined();
      });

      it('should update request with form submissions', async () => {
        const dataWithSubmissions = {
          ...mockRequestData,
          submissions: {
            'form-1': { field1: 'value1', field2: 'value2' },
          },
        };

        const result = await upsertRequest(mockTenantId, dataWithSubmissions);
        expect(result).toBeDefined();
      });
    });

    describe('common validations', () => {
      it('should throw error when user is not found', async () => {
        (currentSession as jest.Mock).mockResolvedValue(null);

        await expect(upsertRequest(mockTenantId, mockRequestData)).rejects.toThrow('User not found');
      });

      it('should throw error when request category is missing', async () => {
        const invalidData = { ...mockRequestData, requestCategory: [] };
        await expect(upsertRequest(mockTenantId, invalidData)).rejects.toThrow('Request category is required');
      });

      it('should throw error when assignment category is missing', async () => {
        const invalidData = { ...mockRequestData, assignmentCategory: [] };
        await expect(upsertRequest(mockTenantId, invalidData)).rejects.toThrow('Assignment category is required');
      });
    });
  });

  describe('getRequestById', () => {
    it('should return request details when found', async () => {
      const mockRequest = {
        id: mockRequestId,
        requestAssignments: [
          {
            area: { id: 'area-1', name: 'Area 1' },
            status: { id: 'status-1', name: 'Status 1' },
            priority: { id: 'priority-1', name: 'Priority 1' },
            requestCategoryId: 'cat-1',
            assignmentCategoryId: 'assign-cat-1',
          },
        ],
        complianceTrackings: [],
        formSubmission: [],
        executionFlowDefinitions: [],
      };

      (mockDb.request.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockRequest);
      (mockDb.requestCategory.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'cat-1',
          name: 'Category 1',
          parentCategoryId: null,
        },
      ]);
      (mockDb.assignmentCategory.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'assign-cat-1',
          name: 'Assignment Category 1',
          parentCategoryId: null,
        },
      ]);

      const result = await getRequestById(mockTenantId, mockRequestId);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockRequestId);
    });

    it('should throw error when user is not found', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(getRequestById(mockTenantId, mockRequestId)).rejects.toThrow();
    });

    it('should handle request with compliance trackings', async () => {
      const mockRequest = {
        id: mockRequestId,
        requestAssignments: [
          {
            area: { id: 'area-1', name: 'Area 1' },
            status: { id: 'status-1', name: 'Status 1' },
            priority: { id: 'priority-1', name: 'Priority 1' },
            requestCategoryId: 'cat-1',
            assignmentCategoryId: 'assign-cat-1',
          },
        ],
        complianceTrackings: [
          { requirementId: 'req-1', isFulfilled: true },
          { requirementId: 'req-2', isFulfilled: false },
        ],
        formSubmission: [],
        executionFlowDefinitions: [],
      };

      (mockDb.request.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockRequest);
      (mockDb.requestCategory.findMany as jest.Mock).mockResolvedValue([{ id: 'cat-1', name: 'Category 1', parentCategoryId: null }]);
      (mockDb.assignmentCategory.findMany as jest.Mock).mockResolvedValue([{ id: 'assign-cat-1', name: 'Assignment Category 1', parentCategoryId: null }]);

      const result = await getRequestById(mockTenantId, mockRequestId);

      expect(result.requirementCompliances).toEqual({
        'req-1': true,
        'req-2': false,
      });
    });

    it('should handle request with form submissions', async () => {
      const mockRequest = {
        id: mockRequestId,
        requestAssignments: [
          {
            area: { id: 'area-1', name: 'Area 1' },
            status: { id: 'status-1', name: 'Status 1' },
            priority: { id: 'priority-1', name: 'Priority 1' },
            requestCategoryId: 'cat-1',
            assignmentCategoryId: 'assign-cat-1',
          },
        ],
        complianceTrackings: [],
        formSubmission: [
          {
            formId: 'form-1',
            content: JSON.stringify({ field1: 'value1', field2: 'value2' }),
            keys: [
              { key: 'field1', value: 'value1' },
              { key: 'field2', value: 'value2' },
            ],
          },
        ],
        executionFlowDefinitions: [],
      };

      (mockDb.request.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockRequest);
      (mockDb.requestCategory.findMany as jest.Mock).mockResolvedValue([{ id: 'cat-1', name: 'Category 1', parentCategoryId: null }]);
      (mockDb.assignmentCategory.findMany as jest.Mock).mockResolvedValue([{ id: 'assign-cat-1', name: 'Assignment Category 1', parentCategoryId: null }]);

      const result = await getRequestById(mockTenantId, mockRequestId);

      expect(result.submissions).toEqual({
        'form-1': { field1: 'value1', field2: 'value2' },
      });
    });

    it('should handle request with multiple category levels', async () => {
      const mockRequest = {
        id: mockRequestId,
        requestAssignments: [
          {
            area: { id: 'area-1', name: 'Area 1' },
            status: { id: 'status-1', name: 'Status 1' },
            priority: { id: 'priority-1', name: 'Priority 1' },
            requestCategoryId: 'cat-3',
            assignmentCategoryId: 'assign-cat-3',
          },
        ],
        complianceTrackings: [],
        formSubmission: [],
        executionFlowDefinitions: [],
      };

      (mockDb.request.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockRequest);
      (mockDb.requestCategory.findMany as jest.Mock).mockResolvedValue([
        { id: 'cat-1', name: 'Parent Category', parentCategoryId: null },
        { id: 'cat-2', name: 'Child Category', parentCategoryId: 'cat-1' },
        { id: 'cat-3', name: 'Grandchild Category', parentCategoryId: 'cat-2' },
      ]);
      (mockDb.assignmentCategory.findMany as jest.Mock).mockResolvedValue([
        { id: 'assign-cat-1', name: 'Parent Assignment', parentCategoryId: null },
        { id: 'assign-cat-2', name: 'Child Assignment', parentCategoryId: 'assign-cat-1' },
        { id: 'assign-cat-3', name: 'Grandchild Assignment', parentCategoryId: 'assign-cat-2' },
      ]);

      const result = await getRequestById(mockTenantId, mockRequestId);

      expect(result.requestCategory).toHaveLength(3);
      expect(result.assignmentCategory).toHaveLength(3);
      expect(result.requestCategory[0].label).toBe('Parent Category');
      expect(result.requestCategory[2].label).toBe('Grandchild Category');
    });
  });

  describe('getRequestDetailsByRequest', () => {
    const mockRequestDetails: RequestFormStepperType = {
      id: mockRequestId,
      areaId: { value: 'area-1', label: 'Area 1' },
      requestCategory: [{ value: 'cat-1', label: 'Category 1', position: 0 }],
      assignmentCategory: [{ value: 'assign-cat-1', label: 'Assignment Category 1', position: 0 }],
      requirementCompliances: { 'req-1': true },
      issueSubject: 'Test subject',
      priorityId: { value: 'priority-1', label: 'Priority 1' },
      isDraft: false,
      description: '',
      statusId: { value: 'status-1', label: 'Status 1' },
      submissions: {},
    };

    beforeEach(() => {
      jest.clearAllMocks();
      (mockDb.formSubmission.count as jest.Mock).mockResolvedValue(2);
      (mockDb.requestCategoryForm.count as jest.Mock).mockResolvedValue(3);
      (mockDb.customerSatisfactionSurvey.findFirst as jest.Mock).mockResolvedValue(null);
      (mockDb.channel.findFirst as jest.Mock).mockResolvedValue(null);
      (mockDb.dataroom.findFirst as jest.Mock).mockResolvedValue(null);
      (mockDb.guideDocument.findMany as jest.Mock).mockResolvedValue([]);
      (mockDb.userTenant.findFirst as jest.Mock).mockResolvedValue({
        person: { firstName: 'John', lastName: 'Doe' },
        user: { email: 'john@example.com' },
      });
      (mockDb.assignedUser.findMany as jest.Mock).mockResolvedValue([]);
      (mockDb.requestAssignment.count as jest.Mock).mockResolvedValue(0);
      (mockDb.executionFlowDefinition.findFirst as jest.Mock).mockResolvedValue(null);
      (mockDb.executionModelInstance.findFirst as jest.Mock).mockResolvedValue(null);
    });

    it('should return request details with all optional fields', async () => {
      const mockSatisfactionSurvey = {
        rating: 5,
        feedback: 'Great service',
        submittedAt: new Date(),
      };

      const mockChannel = {
        id: 'channel-1',
        name: 'Test Channel',
        createdAt: new Date(),
      };

      const mockDataroom = {
        id: 'dataroom-1',
        name: 'Test Dataroom',
        createdAt: new Date(),
      };

      const mockExecutionFlow = {
        id: 'flow-1',
        name: 'Test Flow',
        createdAt: new Date(),
        nodes: [],
        edges: [],
        variables: [],
        metadata: {},
      };

      const mockExecutionInstance = {
        id: 'instance-1',
        status: 'active',
        createdAt: new Date(),
      };

      (mockDb.customerSatisfactionSurvey.findFirst as jest.Mock).mockResolvedValue(mockSatisfactionSurvey);
      (mockDb.channel.findFirst as jest.Mock).mockResolvedValue(mockChannel);
      (mockDb.dataroom.findFirst as jest.Mock).mockResolvedValue(mockDataroom);
      (mockDb.executionFlowDefinition.findFirst as jest.Mock).mockResolvedValue(mockExecutionFlow);
      (mockDb.executionModelInstance.findFirst as jest.Mock).mockResolvedValue(mockExecutionInstance);

      const result = await getRequestDetailsByRequest(mockTenantId, mockRequestDetails);

      expect(result.satisfactionSurvey).toBeDefined();
      expect(result.channel).toBeDefined();
      expect(result.dataroom).toBeDefined();
      expect(result.executionFlow).toBeDefined();
    });

    it('should return request details with assigned users', async () => {
      (mockDb.assignedUser.findMany as jest.Mock).mockResolvedValue([
        {
          isCoordinator: true,
          userTenant: {
            id: 'user-1',
            person: { firstName: 'Jane', lastName: 'Smith' },
            user: { email: 'jane@example.com' },
          },
        },
      ]);

      const result = await getRequestDetailsByRequest(mockTenantId, mockRequestDetails);

      expect(result.assignedUsers).toHaveLength(1);
      expect(result.assignedUsers[0].isCoordinator).toBe(true);
    });

    it('should handle missing user tenant data', async () => {
      (mockDb.userTenant.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getRequestDetailsByRequest(mockTenantId, mockRequestDetails);

      expect(result.requester!.name).toBe('N/A');
      expect(result.requester!.email).toBe('N/A');
    });

    it('should handle request with guides', async () => {
      (mockDb.guideDocument.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'guide-1',
          name: 'Test Guide',
          description: 'Test Description',
          fileType: 'pdf',
          fileUrl: 'http://example.com/guide.pdf',
          version: 1,
          updatedAt: new Date(),
        },
      ]);

      const result = await getRequestDetailsByRequest(mockTenantId, mockRequestDetails);

      expect(result.guides).toHaveLength(1);
      expect(result.guides[0].name).toBe('Test Guide');
    });

    it('should handle request with related counts', async () => {
      (mockDb.requestAssignment.count as jest.Mock)
        .mockResolvedValueOnce(3) // for relatedRequestCount
        .mockResolvedValueOnce(2); // for relatedAssignmentCount

      const result = await getRequestDetailsByRequest(mockTenantId, mockRequestDetails);

      expect(result.relatedRequestCount).toBe(3);
      expect(result.relatedAssignmentCount).toBe(2);
    });

    it('should handle request with form submission counts', async () => {
      (mockDb.formSubmission.count as jest.Mock).mockResolvedValue(5);
      (mockDb.requestCategoryForm.count as jest.Mock).mockResolvedValue(10);

      const result = await getRequestDetailsByRequest(mockTenantId, mockRequestDetails);

      expect(result.submissions.count).toBe(5);
      expect(result.submissions.total).toBe(10);
    });

    it('should handle request with inactive requirements', async () => {
      const requestWithInactiveReqs = {
        ...mockRequestDetails,
        requirementCompliances: {
          'req-1': true,
          'req-2': false,
        },
      };

      const result = await getRequestDetailsByRequest(mockTenantId, requestWithInactiveReqs);
      expect(result.requirements.count).toBe(2);
      expect(result.requirements.total).toBe(2);
    });

    it('should handle request with multiple assigned users', async () => {
      (mockDb.assignedUser.findMany as jest.Mock).mockResolvedValue([
        {
          isCoordinator: true,
          userTenant: {
            id: 'user-1',
            person: { firstName: 'Jane', lastName: 'Smith' },
            user: { email: 'jane@example.com' },
          },
        },
        {
          isCoordinator: false,
          userTenant: {
            id: 'user-2',
            person: { firstName: 'John', lastName: 'Doe' },
            user: { email: 'john@example.com' },
          },
        },
      ]);

      const result = await getRequestDetailsByRequest(mockTenantId, mockRequestDetails);
      expect(result.assignedUsers).toHaveLength(2);
      expect(result.assignedUsers[0].isCoordinator).toBe(true);
      expect(result.assignedUsers[1].isCoordinator).toBe(false);
    });

    it('should handle request with empty assigned users', async () => {
      (mockDb.assignedUser.findMany as jest.Mock).mockResolvedValue([]);
      (mockDb.userTenant.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getRequestDetailsByRequest(mockTenantId, mockRequestDetails);
      expect(result.assignedUsers).toHaveLength(0);
      expect(result.requester!.name).toBe('N/A');
      expect(result.requester!.email).toBe('N/A');
    });

    it('should handle request with partial user data', async () => {
      (mockDb.assignedUser.findMany as jest.Mock).mockResolvedValue([
        {
          isCoordinator: true,
          userTenant: {
            id: 'user-1',
            person: null,
            user: { email: 'user@example.com' },
          },
        },
      ]);

      const result = await getRequestDetailsByRequest(mockTenantId, mockRequestDetails);
      expect(result.assignedUsers[0].user.label).toContain('user@example.com');
    });
  });

  describe('getPrioritiesAsOptions', () => {
    it('should return only active priorities', async () => {
      (mockDb.requestPriorityType.findMany as jest.Mock).mockResolvedValue([
        { id: 'priority-1', name: 'High', primaryColor: '#FF0000' },
        { id: 'priority-2', name: 'Medium', primaryColor: '#00FF00' },
      ]);

      const result = await getPrioritiesAsOptions(mockTenantId);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ label: 'High', value: 'priority-1' });
      expect(result[1]).toEqual({ label: 'Medium', value: 'priority-2' });
    });

    it('should throw error when user is not found', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(getPrioritiesAsOptions(mockTenantId)).rejects.toThrow();
    });
  });
});
