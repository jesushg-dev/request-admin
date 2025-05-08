import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-server';

import { updateCurrentPriority, updateCurrentStatus } from '../request-detail';

// Mock the dependencies
jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn(),
}));

jest.mock('@/server/db-server', () => ({
  db: {
    request: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    requestChangeLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('Request Detail Actions', () => {
  const mockTenantId = 'tenant-123';
  const mockRequestId = 'request-123';
  const mockUserId = 'user-123';
  const mockStatusId = 'status-123';
  const mockPriorityId = 'priority-123';

  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue({
      user: { id: mockUserId },
    });
  });

  describe('updateCurrentStatus', () => {
    it('should successfully update request status', async () => {
      // Mock the database responses
      (db.request.findUnique as jest.Mock).mockResolvedValue({
        id: mockRequestId,
        requestAssignments: [{ statusId: 'old-status-123' }],
      });

      (db.$transaction as jest.Mock).mockResolvedValue([{}, {}]);

      const result = await updateCurrentStatus(mockTenantId, mockRequestId, mockStatusId);

      expect(result).toEqual({ statusId: mockStatusId });
      expect(db.$transaction).toHaveBeenCalled();
      expect(db.requestChangeLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: mockTenantId,
          requestId: mockRequestId,
          changedBy: mockUserId,
          fieldName: 'status',
          newValue: mockStatusId,
        }),
      });
    });

    it('should throw AuthorizationError when user is not authenticated', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(updateCurrentStatus(mockTenantId, mockRequestId, mockStatusId)).rejects.toThrow('Authentication required');
    });

    it('should throw RequestNotFoundError when request does not exist', async () => {
      (db.request.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(updateCurrentStatus(mockTenantId, mockRequestId, mockStatusId)).rejects.toThrow('Request not found');
    });

    it('should throw RequestAssignmentError when no active assignments exist', async () => {
      (db.request.findUnique as jest.Mock).mockResolvedValue({
        id: mockRequestId,
        requestAssignments: [],
      });

      await expect(updateCurrentStatus(mockTenantId, mockRequestId, mockStatusId)).rejects.toThrow('No active request assignments found');
    });
  });

  describe('updateCurrentPriority', () => {
    it('should successfully update request priority', async () => {
      // Mock the database responses
      (db.request.findUnique as jest.Mock).mockResolvedValue({
        id: mockRequestId,
        requestAssignments: [{ priorityId: 'old-priority-123' }],
      });

      (db.$transaction as jest.Mock).mockResolvedValue([{}, {}]);

      const result = await updateCurrentPriority(mockTenantId, mockRequestId, mockPriorityId);

      expect(result).toEqual({ priorityId: mockPriorityId });
      expect(db.$transaction).toHaveBeenCalled();
      expect(db.requestChangeLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: mockTenantId,
          requestId: mockRequestId,
          changedBy: mockUserId,
          fieldName: 'priority',
          newValue: mockPriorityId,
        }),
      });
    });

    it('should throw AuthorizationError when user is not authenticated', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(updateCurrentPriority(mockTenantId, mockRequestId, mockPriorityId)).rejects.toThrow('Authentication required');
    });

    it('should throw RequestNotFoundError when request does not exist', async () => {
      (db.request.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(updateCurrentPriority(mockTenantId, mockRequestId, mockPriorityId)).rejects.toThrow('Request not found');
    });

    it('should throw RequestAssignmentError when no active assignments exist', async () => {
      (db.request.findUnique as jest.Mock).mockResolvedValue({
        id: mockRequestId,
        requestAssignments: [],
      });

      await expect(updateCurrentPriority(mockTenantId, mockRequestId, mockPriorityId)).rejects.toThrow('No active request assignments found');
    });
  });
});
