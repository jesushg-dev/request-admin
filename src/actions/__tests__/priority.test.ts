import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-client';

import { getRequestPriorityTypeAsFormById, getRequestPriorityTypesAsOptions } from '../priority';

// Mock the dependencies
jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn(),
}));

jest.mock('@/server/db-client', () => ({
  db: {
    requestPriorityType: {
      findMany: jest.fn(),
      findFirstOrThrow: jest.fn(),
    },
  },
}));

describe('Priority Actions', () => {
  const mockSession = { user: { id: 'user-1' } };
  const mockTenantId = 'tenant-1';
  const mockPriorityId = 'priority-1';

  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('getRequestPriorityTypesAsOptions', () => {
    it('should throw error when user is not found', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(getRequestPriorityTypesAsOptions(mockTenantId)).rejects.toThrow('User not found');
    });

    it('should return priority types for tenant', async () => {
      const mockPriorityTypes = [
        { id: '1', name: 'High', level: 1 },
        { id: '2', name: 'Medium', level: 2 },
      ];

      (db.requestPriorityType.findMany as jest.Mock).mockResolvedValue(mockPriorityTypes);

      const result = await getRequestPriorityTypesAsOptions(mockTenantId);

      expect(result).toEqual(mockPriorityTypes);
      expect(db.requestPriorityType.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
        },
        where: { tenantId: mockTenantId, isActive: true },
      });
    });
  });

  describe('getRequestPriorityTypeAsFormById', () => {
    it('should throw error when user is not found', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(getRequestPriorityTypeAsFormById(mockPriorityId, mockTenantId)).rejects.toThrow('User not found');
    });

    it('should return priority type form data', async () => {
      const mockPriority = {
        id: mockPriorityId,
        name: 'High Priority',
        description: 'Urgent matters',
        primaryColor: '#FF0000',
        level: 1,
        isActive: true,
      };

      (db.requestPriorityType.findFirstOrThrow as jest.Mock).mockResolvedValue(mockPriority);

      const result = await getRequestPriorityTypeAsFormById(mockPriorityId, mockTenantId);

      expect(result).toEqual({
        ...mockPriority,
        isDefault: false,
        description: mockPriority.description,
      });

      expect(db.requestPriorityType.findFirstOrThrow).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
          primaryColor: true,
          level: true,
          isActive: true,
        },
        where: { id: mockPriorityId, tenantId: mockTenantId },
      });
    });

    it('should handle null description', async () => {
      const mockPriority = {
        id: mockPriorityId,
        name: 'High Priority',
        description: null,
        primaryColor: '#FF0000',
        level: 1,
        isActive: true,
      };

      (db.requestPriorityType.findFirstOrThrow as jest.Mock).mockResolvedValue(mockPriority);

      const result = await getRequestPriorityTypeAsFormById(mockPriorityId, mockTenantId);

      expect(result.description).toBe('');
    });
  });
});
