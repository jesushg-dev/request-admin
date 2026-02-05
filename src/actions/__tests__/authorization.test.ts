import { currentSession, requireUser } from '@/server/auth-server';
import { getDb } from '@/server/db-client';

import { getAuthContext } from '../authorization';

// Mock the dependencies
jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn(),
  requireUser: jest.fn(),
}));

const mockDb = {
  userTenant: {
    findUnique: jest.fn(),
  },
};

jest.mock('@/server/db-client', () => ({
  getDb: jest.fn(),
}));

describe('Authorization Module', () => {
  const mockTenantId = 'test-tenant-id';
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue(mockDb);
    (requireUser as jest.Mock).mockImplementation(async () => {
      const s = await (currentSession as any)();
      return s?.user ?? s;
    });
  });

  describe('getAuthContext', () => {
    it('should throw AuthorizationError when no session exists', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(getAuthContext(mockTenantId)).rejects.toThrow('Unauthorized');
    });

    it('should return true for all permissions when user is global admin', async () => {
      (currentSession as jest.Mock).mockResolvedValue({
        user: {
          id: mockUserId,
          isGlobalAdmin: true,
        },
      });

      const auth = await getAuthContext(mockTenantId);
      expect(auth.hasPermissions(['ANY_PERMISSION'])).toBe(true);
      expect(auth.hasAreaPermissions('any-area', ['ANY_PERMISSION'])).toBe(true);
    });

    it('should return true for all permissions when user has admin role', async () => {
      (currentSession as jest.Mock).mockResolvedValue({
        user: {
          id: mockUserId,
          role: 'admin',
        },
      });

      const auth = await getAuthContext(mockTenantId);
      expect(auth.hasPermissions(['ANY_PERMISSION'])).toBe(true);
      expect(auth.hasAreaPermissions('any-area', ['ANY_PERMISSION'])).toBe(true);
    });

    it('should check permissions correctly for regular user', async () => {
      const mockPermissions = ['PERMISSION_1', 'PERMISSION_2'];

      (currentSession as jest.Mock).mockResolvedValue({
        user: {
          id: mockUserId,
          role: 'user',
        },
      });

      (mockDb.userTenant.findUnique as jest.Mock).mockResolvedValue({
        userRoles: [
          {
            role: {
              roleFeature: [{ feature: { key: 'PERMISSION_1' } }],
            },
          },
        ],
        userAreas: [
          {
            area: {
              id: 'test-area',
              areaRole: [
                {
                  areaRoleFeatures: [{ feature: { key: 'AREA_PERMISSION_1' } }],
                },
              ],
            },
          },
        ],
      });

      const auth = await getAuthContext(mockTenantId);

      // Test single permission
      expect(auth.hasPermissions('PERMISSION_1')).toBe(true);
      expect(auth.hasPermissions('PERMISSION_2')).toBe(false);

      // Test multiple permissions with requireAll
      expect(auth.hasPermissions(mockPermissions, { requireAll: true })).toBe(false);
      expect(auth.hasPermissions(mockPermissions, { requireAll: false })).toBe(true);

      // Test area permissions
      expect(auth.hasAreaPermissions('test-area', 'AREA_PERMISSION_1')).toBe(true);
      expect(auth.hasAreaPermissions('test-area', 'AREA_PERMISSION_2')).toBe(false);
      expect(auth.hasAreaPermissions('non-existent-area', 'AREA_PERMISSION_1')).toBe(false);
    });

    it('should handle case when user has no tenant permissions', async () => {
      (currentSession as jest.Mock).mockResolvedValue({
        user: {
          id: mockUserId,
          role: 'user',
        },
      });

      (mockDb.userTenant.findUnique as jest.Mock).mockResolvedValue(null);

      const auth = await getAuthContext(mockTenantId);
      expect(auth.hasPermissions(['ANY_PERMISSION'])).toBe(false);
      expect(auth.hasAreaPermissions('any-area', ['ANY_PERMISSION'])).toBe(false);
    });
  });
});
