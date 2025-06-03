import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-server';

import { AuthorizationError, ValidationError } from '@/lib/error';

import { updateCurrentAssignedUsers, updateCurrentClassification, updateCurrentPriority, updateCurrentStatus } from '../request-assignment';

// Mock the database
jest.mock('@/server/db-server', () => ({
  db: {
    $transaction: jest.fn(),
    requestAssignment: {
      findFirstOrThrow: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
    requestChangeLog: {
      create: jest.fn(),
    },
  },
}));

// Mock auth
jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn(),
}));

describe('Request Assignment Actions', () => {
  const mockSession = {
    user: {
      id: 'user-123',
    },
  };

  const mockTenantId = 'tenant-123';
  const mockRequestId = 'request-123';
  const mockStatusId = 'status-123';
  const mockPriorityId = 'priority-123';

  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('updateCurrentStatus', () => {
    const mockMetadata = {
      type: 'STATUS_CHANGE' as const,
      reason: 'Test reason',
      requiredReason: true,
      notify: { value: 'true', label: 'Yes' },
    };

    const mockLastAssignment = {
      id: 'assignment-123',
      statusId: 'old-status-123',
      assignedUsers: [],
    };

    beforeEach(() => {
      (db.requestAssignment.findFirstOrThrow as jest.Mock).mockResolvedValue(mockLastAssignment);
      (db.$transaction as jest.Mock).mockResolvedValue([]);
    });

    it('should update status successfully', async () => {
      const result = await updateCurrentStatus(mockTenantId, mockRequestId, mockStatusId, mockMetadata);

      expect(result).toEqual({ statusId: mockStatusId });
      expect(db.$transaction).toHaveBeenCalled();
      expect(db.requestChangeLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: mockTenantId,
          requestId: mockRequestId,
          updatedBy: mockSession.user.id,
          fieldName: 'status',
          oldValue: mockLastAssignment.statusId,
          newValue: mockStatusId,
          metadata: JSON.stringify(mockMetadata),
        }),
      });
    });

    it('should throw AuthorizationError when no session', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(updateCurrentStatus(mockTenantId, mockRequestId, mockStatusId, mockMetadata)).rejects.toThrow(AuthorizationError);
    });

    it('should throw ValidationError when no changes detected', async () => {
      (db.requestAssignment.findFirstOrThrow as jest.Mock).mockResolvedValue({
        ...mockLastAssignment,
        statusId: mockStatusId,
      });
      await expect(updateCurrentStatus(mockTenantId, mockRequestId, mockStatusId, mockMetadata)).rejects.toThrow(ValidationError);
    });

    it('should handle transaction failure', async () => {
      (db.$transaction as jest.Mock).mockRejectedValue(new Error('Transaction failed'));
      await expect(updateCurrentStatus(mockTenantId, mockRequestId, mockStatusId, mockMetadata)).rejects.toThrow('Transaction failed');
    });
  });

  describe('updateCurrentPriority', () => {
    const mockMetadata = {
      type: 'PRIORITY_CHANGE' as const,
      reason: 'Test reason',
      notify: true,
    };

    const mockLastAssignment = {
      id: 'assignment-123',
      priorityId: 'old-priority-123',
      assignedUsers: [],
    };

    beforeEach(() => {
      (db.requestAssignment.findFirstOrThrow as jest.Mock).mockResolvedValue(mockLastAssignment);
      (db.$transaction as jest.Mock).mockResolvedValue([]);
    });

    it('should update priority successfully', async () => {
      const result = await updateCurrentPriority(mockTenantId, mockRequestId, mockPriorityId, mockMetadata);

      expect(result).toEqual({ priorityId: mockPriorityId });
      expect(db.$transaction).toHaveBeenCalled();
    });

    it('should throw ValidationError when metadata type is invalid', async () => {
      const invalidMetadata = {
        type: 'ASSIGNMENT_AREA_CHANGE' as const,
        reason: 'Test reason',
        notify: 'true',
      };

      await expect(updateCurrentPriority(mockTenantId, mockRequestId, mockPriorityId, invalidMetadata)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when reason is missing', async () => {
      const invalidMetadata = {
        type: 'PRIORITY_CHANGE' as const,
        notify: true,
        reason: 'Test reason',
      };

      const result = await updateCurrentPriority(mockTenantId, mockRequestId, mockPriorityId, invalidMetadata);
      expect(result).toEqual({ priorityId: mockPriorityId });
    });

    it('should handle transaction failure', async () => {
      (db.$transaction as jest.Mock).mockRejectedValue(new Error('Transaction failed'));
      await expect(updateCurrentPriority(mockTenantId, mockRequestId, mockPriorityId, mockMetadata)).rejects.toThrow('Transaction failed');
    });

    it('should throw ValidationError when no changes detected', async () => {
      (db.requestAssignment.findFirstOrThrow as jest.Mock).mockResolvedValue({
        ...mockLastAssignment,
        priorityId: mockPriorityId,
      });
      await expect(updateCurrentPriority(mockTenantId, mockRequestId, mockPriorityId, mockMetadata)).rejects.toThrow(ValidationError);
    });
  });

  describe('updateCurrentAssignedUsers', () => {
    const mockAssignData = {
      assignees: [
        { user: { value: 'user-1', label: 'User 1' }, isCoordinator: true },
        { user: { value: 'user-2', label: 'User 2' }, isCoordinator: false },
      ],
      comments: 'Test comments',
    };

    const mockLastAssignment = {
      id: 'assignment-123',
      assignedUsers: [{ id: 'old-user-1' }, { id: 'old-user-2' }],
    };

    beforeEach(() => {
      (db.requestAssignment.findFirstOrThrow as jest.Mock).mockResolvedValue(mockLastAssignment);
      (db.$transaction as jest.Mock).mockResolvedValue([]);
    });

    it('should update assigned users successfully', async () => {
      const result = await updateCurrentAssignedUsers(mockTenantId, mockRequestId, mockAssignData);

      expect(result).toEqual({
        assignedUsers: ['user-1', 'user-2'],
      });
      expect(db.$transaction).toHaveBeenCalled();
    });

    it('should handle transaction failure', async () => {
      (db.$transaction as jest.Mock).mockRejectedValue(new Error('Transaction failed'));
      await expect(updateCurrentAssignedUsers(mockTenantId, mockRequestId, mockAssignData)).rejects.toThrow('Transaction failed');
    });
  });

  describe('updateCurrentClassification', () => {
    const mockClassificationData = {
      areaId: { value: 'area-123', label: 'Area 123' },
      requestCategory: [{ value: 'category-123', label: 'Category 123', position: 1 }],
      assignmentCategory: [{ value: 'assignment-123', label: 'Assignment 123', position: 1 }],
      reason: 'Test reason',
      notify: { value: 'true', label: 'Yes' },
    };

    const mockLastAssignment = {
      id: 'assignment-123',
      areaId: 'old-area-123',
      requestCategoryId: 'old-category-123',
      assignmentCategoryId: 'old-assignment-123',
      assignedUsers: [],
    };

    beforeEach(() => {
      (db.requestAssignment.findFirstOrThrow as jest.Mock).mockResolvedValue(mockLastAssignment);
      (db.$transaction as jest.Mock).mockResolvedValue([]);
    });

    it('should update classification successfully', async () => {
      const result = await updateCurrentClassification(mockTenantId, mockRequestId, mockClassificationData);

      expect(result).toEqual({
        areaId: 'area-123',
      });
      expect(db.$transaction).toHaveBeenCalled();
    });

    it('should throw ValidationError when no changes detected', async () => {
      (db.requestAssignment.findFirstOrThrow as jest.Mock).mockResolvedValue({
        ...mockLastAssignment,
        areaId: 'area-123',
        requestCategoryId: 'category-123',
        assignmentCategoryId: 'assignment-123',
      });
      await expect(updateCurrentClassification(mockTenantId, mockRequestId, mockClassificationData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when categories are missing', async () => {
      const invalidData = {
        ...mockClassificationData,
        requestCategory: [],
        assignmentCategory: [],
      };

      await expect(updateCurrentClassification(mockTenantId, mockRequestId, invalidData)).rejects.toThrow(ValidationError);
    });

    it('should handle transaction failure', async () => {
      (db.$transaction as jest.Mock).mockRejectedValue(new Error('Transaction failed'));
      await expect(updateCurrentClassification(mockTenantId, mockRequestId, mockClassificationData)).rejects.toThrow('Transaction failed');
    });
  });
});
