// Import after mocks
import { auth, currentSession } from '@/server/auth-server';
import { db } from '@/server/db-client';

import { getCurrentUserTenant, getIdentityTypesAsOptions, getRolesAsOptions, getUsersAsOptions, upsertUser } from '../user';

// Mock external dependencies
jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn(),
  auth: {
    api: {
      signUpEmail: jest.fn(),
    },
  },
}));

jest.mock('@/server/db-client', () => ({
  db: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userTenant: {
      findUniqueOrThrow: jest.fn(),
    },
    identificationType: {
      findMany: jest.fn(),
    },
    role: {
      findMany: jest.fn(),
    },
  },
}));

describe('User Actions', () => {
  const mockSession = { user: { id: 'user-123' }, tenantId: 'tenant-123' };
  const mockTenantId = 'tenant-1';

  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('getUsersAsOptions', () => {
    it('should throw UserNotFoundErr when no session exists', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);
      await expect(getUsersAsOptions(mockTenantId)).rejects.toThrow();
    });

    it('should return formatted user options', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          username: 'john.doe',
          email: 'john@example.com',
          userTenants: [
            {
              id: 'user-tenant-1',
              person: {
                firstName: 'John',
                lastName: 'Doe',
              },
            },
          ],
        },
      ];

      (db.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await getUsersAsOptions(mockTenantId);

      expect(result).toEqual([
        {
          label: 'John Doe @john.doe',
          value: 'user-tenant-1',
        },
      ]);

      expect(db.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          username: true,
          email: true,
          userTenants: {
            select: {
              id: true,
              person: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
            where: { tenantId: mockTenantId },
          },
        },
        where: { userTenants: { every: { tenantId: mockTenantId } } },
      });
    });

    it('should handle users without person data', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          username: 'john.doe',
          email: 'john@example.com',
          userTenants: [
            {
              id: 'user-tenant-1',
              person: null,
            },
          ],
        },
      ];

      (db.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await getUsersAsOptions(mockTenantId);

      expect(result).toEqual([
        {
          label: 'john.doe',
          value: 'user-tenant-1',
        },
      ]);
    });
  });

  describe('getIdentityTypesAsOptions', () => {
    it('should return formatted identity type options', async () => {
      const mockTypes = [
        { id: 'type-1', name: 'Passport', regex: '^[A-Z0-9]{9}$' },
        { id: 'type-2', name: 'ID Card', regex: '^[0-9]{8}$' },
      ];

      (db.identificationType.findMany as jest.Mock).mockResolvedValue(mockTypes);

      const result = await getIdentityTypesAsOptions(mockTenantId);

      expect(result).toEqual([
        { label: 'Passport', value: 'type-1', regex: '^[A-Z0-9]{9}$' },
        { label: 'ID Card', value: 'type-2', regex: '^[0-9]{8}$' },
      ]);
    });
  });

  describe('getRolesAsOptions', () => {
    it('should return formatted role options', async () => {
      const mockRoles = [
        { id: 'role-1', name: 'Admin' },
        { id: 'role-2', name: 'User' },
      ];

      (db.role.findMany as jest.Mock).mockResolvedValue(mockRoles);

      const result = await getRolesAsOptions(mockTenantId);

      expect(result).toEqual([
        { label: 'Admin', value: 'role-1' },
        { label: 'User', value: 'role-2' },
      ]);
    });
  });

  describe('getCurrentUserTenant', () => {
    it('should return current user tenant ID', async () => {
      const mockUserTenant = { id: 'user-tenant-1' };
      (db.userTenant.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockUserTenant);

      const result = await getCurrentUserTenant(mockTenantId);

      expect(result).toEqual({ userTenantId: 'user-tenant-1' });
      expect(db.userTenant.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { userId_tenantId: { userId: mockSession.user.id, tenantId: mockTenantId } },
        select: { id: true },
      });
    });
  });

  describe('upsertUser', () => {
    const mockUserData = {
      user: {
        id: 'user-tenant-1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        isTwoFactorRequired: false,
        phone: '',
        identificationNumber: '',
        identificationTypeId: { value: 'type-1', label: 'Passport' },
      },
      roles: [{ id: 'role-1', roleId: { value: 'role-1', label: 'Admin' }, isActive: true }],
      areaRoles: [
        {
          id: 'area-role-1',
          areaId: { value: 'area-1', label: 'Area 1' },
          roleId: { value: 'role-1', label: 'Admin' },
          isActive: true,
        },
      ],
    };

    it('should create new user when user does not exist', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);
      (auth.api.signUpEmail as unknown as jest.Mock).mockResolvedValue({});

      await upsertUser(mockTenantId, mockUserData);

      expect(auth.api.signUpEmail).toHaveBeenCalledWith({
        body: expect.objectContaining({
          email: mockUserData.user.email,
          name: expect.stringMatching(/john\.doe[a-f0-9]{4}/),
        }),
      });
    });

    it('should update existing user', async () => {
      const existingUser = { id: 'user-1' };
      (db.user.findUnique as jest.Mock).mockResolvedValue(existingUser);
      (db.user.update as jest.Mock).mockResolvedValue(existingUser);

      await upsertUser(mockTenantId, mockUserData);

      expect(db.user.update).toHaveBeenCalledWith({
        where: { email: mockUserData.user.email },
        data: expect.objectContaining({
          userTenants: {
            upsert: expect.objectContaining({
              where: { userId_tenantId: { userId: existingUser.id, tenantId: mockTenantId } },
              create: expect.any(Object),
              update: expect.any(Object),
            }),
          },
        }),
      });
    });
  });
});
