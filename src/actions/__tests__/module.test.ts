import { currentSession } from '@/server/auth-server';
import { getDb } from '@/server/db-client';

import { getModuleByTenantIdAndScope } from '../module';

// Mock the dependencies
jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn(),
}));

const mockDb = {
  module: {
    findMany: jest.fn(),
  },
};

jest.mock('@/server/db-client', () => ({
  getDb: jest.fn(),
}));

describe('Module Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue(mockDb);
  });

  describe('getModuleByTenantIdAndScope', () => {
    const mockTenantId = 'test-tenant-id';
    const mockScope = 'global';

    it('should throw UserNotFoundErr when no session exists', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(getModuleByTenantIdAndScope(mockTenantId, mockScope)).rejects.toThrow('User not found');
    });

    it('should return filtered modules when session exists', async () => {
      // Mock session
      (currentSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });

      // Mock database response
      const mockModules = [
        {
          id: '1',
          name: 'Test Module',
          feature: [
            { id: '1', scope: 'global', isActive: true },
            { id: '2', scope: 'area', isActive: true },
            { id: '3', scope: 'global', isActive: false },
          ],
        },
      ];

      (mockDb.module.findMany as jest.Mock).mockResolvedValue(mockModules);

      const result = await getModuleByTenantIdAndScope(mockTenantId, mockScope);

      // Verify the result
      expect(result).toHaveLength(1);
      expect(result[0].feature).toHaveLength(1);
      expect(result[0].feature[0].scope).toBe('global');
      expect(result[0].feature[0].isActive).toBe(true);

      // Verify the database query
      expect(mockDb.module.findMany).toHaveBeenCalledWith({
        select: {
          description: true,
          feature: {
            orderBy: {
              name: 'asc',
            },
            select: {
              description: true,
              id: true,
              isActive: true,
              name: true,
              scope: true,
            },
          },
          id: true,
          isActive: true,
          name: true,
        },
        where: {
          tenantId: mockTenantId,
          feature: {
            some: {
              scope: mockScope,
              isActive: true,
            },
          },
        },
      });
    });

    it('should return empty array when no modules match the criteria', async () => {
      // Mock session
      (currentSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });

      // Mock empty database response
      (mockDb.module.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getModuleByTenantIdAndScope(mockTenantId, mockScope);

      expect(result).toHaveLength(0);
    });
  });
});
