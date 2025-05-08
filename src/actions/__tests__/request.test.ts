import { currentSession } from '@/server/auth-server';
// Import the mocked db
import { db } from '@/server/db-server';

import { RequestFormStepperType } from '@/components/common/request/request-form-stepper';

import { getPrioritiesAsOptions, getRequestById, getRequestDetailsByRequest, upsertRequest } from '../request';

// Define mock types
type MockDbType = {
  request: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    findUniqueOrThrow: jest.Mock;
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
  };
  requestPriorityType: {
    findMany: jest.Mock;
  };
  guideDocument: {
    findMany: jest.Mock;
  };
  $transaction: jest.Mock;
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
}));

jest.mock('../workflow', () => ({
  getInitialStatusFromDatabase: jest.fn().mockResolvedValue({ id: 'status-1' }),
}));

// Mock database using a factory function
jest.mock('@/server/db-server', () => {
  const createMockDb = (): MockDbType => {
    const db = {
      request: {
        findUnique: jest.fn() as jest.Mock,
        create: jest.fn() as jest.Mock,
        update: jest.fn() as jest.Mock,
        findUniqueOrThrow: jest.fn() as jest.Mock,
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
      },
      userTenant: {
        findMany: jest.fn() as jest.Mock,
      },
      formSubmission: {
        count: jest.fn() as jest.Mock,
      },
      requestCategoryForm: {
        count: jest.fn() as jest.Mock,
      },
      customerSatisfactionSurvey: {
        findFirst: jest.fn() as jest.Mock,
      },
      channel: {
        findFirst: jest.fn() as jest.Mock,
      },
      requestPriorityType: {
        findMany: jest.fn() as jest.Mock,
      },
      guideDocument: {
        findMany: jest.fn() as jest.Mock,
      },
      $transaction: jest.fn() as jest.Mock,
      $queryRawUnsafe: jest.fn() as jest.Mock,
    };

    db.$transaction.mockImplementation((callback) => callback(db));
    return db;
  };

  return {
    db: createMockDb(),
  };
});

describe('Request Actions', () => {
  const mockSession = {
    user: {
      id: 'user-123',
    },
  };

  const mockTenantId = 'tenant-123';
  const mockRequestId = 'request-123';

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
  });

  describe('upsertRequest', () => {
    it('should create a new request when it does not exist', async () => {
      (db.request.findUnique as jest.Mock).mockResolvedValue(null);
      (db.assignmentType.findFirstOrThrow as jest.Mock).mockResolvedValue({ id: 'type-1' });
      (db.requestCategoryRequirement.findMany as jest.Mock).mockResolvedValue([]);
      (db.userTenant.findMany as jest.Mock).mockResolvedValue([]);
      (db.dataroom.create as jest.Mock).mockResolvedValue({ id: 'dataroom-1' });
      (db.request.create as jest.Mock).mockResolvedValue({ id: mockRequestId });

      const result = await upsertRequest(mockTenantId, mockRequestData);

      expect(result).toBeDefined();
      expect(db.request.create).toHaveBeenCalled();
      expect(db.dataroom.create).toHaveBeenCalled();
      expect(db.requestChangeLog.create).toHaveBeenCalled();
    });

    it('should update an existing request', async () => {
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
          },
        ],
      };

      (db.request.findUnique as jest.Mock).mockResolvedValue(existingRequest);
      (db.assignmentType.findFirstOrThrow as jest.Mock).mockResolvedValue({ id: 'type-1' });
      (db.requestCategoryRequirement.findMany as jest.Mock).mockResolvedValue([]);
      (db.userTenant.findMany as jest.Mock).mockResolvedValue([]);
      (db.request.update as jest.Mock).mockResolvedValue(updatedRequest);

      const result = await upsertRequest(mockTenantId, mockRequestData);

      expect(result).toBeDefined();
      expect(db.request.update).toHaveBeenCalled();
      expect(db.requestChangeLog.create).toHaveBeenCalled();
    });

    it('should throw error when user is not found', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(upsertRequest(mockTenantId, mockRequestData)).rejects.toThrow('User not found');
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
      };

      (db.request.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockRequest);
      (db.$queryRawUnsafe as jest.Mock).mockResolvedValue([
        { id: 'cat-1', name: 'Category 1', level: 0 },
        { id: 'assign-cat-1', name: 'Assignment Category 1', level: 0 },
      ]);

      const result = await getRequestById(mockTenantId, mockRequestId);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockRequestId);
    });

    it('should throw error when user is not found', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(getRequestById(mockTenantId, mockRequestId)).rejects.toThrow();
    });
  });

  describe('getRequestDetailsByRequest', () => {
    it('should return request details with all related information', async () => {
      (db.formSubmission.count as jest.Mock).mockResolvedValue(5);
      (db.requestCategoryForm.count as jest.Mock).mockResolvedValue(10);
      (db.customerSatisfactionSurvey.findFirst as jest.Mock).mockResolvedValue({
        rating: 4,
        feedback: 'Great service',
        submittedAt: new Date(),
      });
      (db.channel.findFirst as jest.Mock).mockResolvedValue({
        id: 'channel-1',
        name: 'Test Channel',
        createdAt: new Date(),
      });
      (db.dataroom.findFirst as jest.Mock).mockResolvedValue({
        id: 'dataroom-1',
        name: 'Test Dataroom',
        createdAt: new Date(),
      });
      (db.guideDocument.findMany as jest.Mock).mockResolvedValue([
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

      const result = await getRequestDetailsByRequest(mockTenantId, mockRequestData);

      expect(result).toBeDefined();
      expect(result.submissions).toBeDefined();
      expect(result.satisfactionSurvey).toBeDefined();
      expect(result.channel).toBeDefined();
      expect(result.dataroom).toBeDefined();
      expect(result.guides).toBeDefined();
      expect(result.guides).toHaveLength(1);
    });
  });

  describe('getPrioritiesAsOptions', () => {
    it('should return priorities as options', async () => {
      const mockPriorities = [
        { id: 'priority-1', name: 'High', primaryColor: '#FF0000' },
        { id: 'priority-2', name: 'Medium', primaryColor: '#00FF00' },
      ];

      (db.requestPriorityType.findMany as jest.Mock).mockResolvedValue(mockPriorities);

      const result = await getPrioritiesAsOptions(mockTenantId);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        label: 'High',
        value: 'priority-1',
      });
    });
  });
});
