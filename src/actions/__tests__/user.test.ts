// Import after mocks
import { auth, currentSession, requireUser } from '@/server/auth-server';
import { getDb } from '@/server/db-client';

import { UserTenantScopedFormValues } from '@/components/common/user/user-tenant-scoped-form';

import { getCurrentUserTenant, getIdentityTypesAsOptions, getRolesAsOptions, getUsersAsOptions, processInvitationAcceptance, upsertUser } from '../user';

// Mock next/headers
jest.mock('next/headers', () => ({
  headers: jest.fn().mockReturnValue({}),
}));

// Mock external dependencies
jest.mock('@/server/auth-server', () => {
  const mockCreateInvitation = jest.fn().mockResolvedValue({ id: 'invitation-1' });
  const mockAcceptInvitation = jest.fn().mockResolvedValue({ invitation: { organizationId: 'tenant-1' } });

  return {
    currentSession: jest.fn(),
    requireUser: jest.fn(),
    auth: {
      api: {
        signUpEmail: jest.fn(),
        createInvitation: mockCreateInvitation,
        acceptInvitation: mockAcceptInvitation,
        listMembers: jest.fn().mockResolvedValue({ members: [], total: 0 }),
      },
    },
  };
});

const mockDb = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  userTenant: {
    findMany: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  identificationType: {
    findMany: jest.fn(),
  },
  role: {
    findMany: jest.fn(),
  },
  person: {
    findFirst: jest.fn(),
  },
  invitationTenant: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('@/server/db-client', () => ({
  getDb: jest.fn(),
}));

describe('User Actions', () => {
  const mockSession = { user: { id: 'user-123' }, tenantId: 'tenant-123' };
  const mockTenantId = 'tenant-1';

  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
    (requireUser as jest.Mock).mockImplementation(async () => {
      const s = await (currentSession as any)();
      return s?.user ?? s;
    });
    (getDb as jest.Mock).mockResolvedValue(mockDb);
  });

  describe('getUsersAsOptions', () => {
    it('should throw UserNotFoundErr when no session exists', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);
      await expect(getUsersAsOptions(mockTenantId)).rejects.toThrow();
    });

    it('should return formatted user options', async () => {
      const mockUserTenants = [
        {
          id: 'user-tenant-1',
          user: {
            id: 'user-1',
            email: 'john@example.com',
            username: 'john.doe',
          },
          person: {
            firstName: 'John',
            lastName: 'Doe',
            image: null,
          },
        },
      ];

      (mockDb.userTenant.findMany as jest.Mock).mockResolvedValue(mockUserTenants);

      const result = await getUsersAsOptions(mockTenantId);

      expect(result).toEqual([
        {
          label: 'John Doe',
          value: 'user-tenant-1',
        },
      ]);

      expect(mockDb.userTenant.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          user: { select: { id: true, email: true, username: true } },
          person: { select: { image: true, firstName: true, lastName: true } },
        },
        where: { tenantId: mockTenantId, isActive: true },
        orderBy: { user: { username: 'asc' } },
      });
    });
  });

  describe('getIdentityTypesAsOptions', () => {
    it('should return formatted identity type options', async () => {
      const mockTypes = [
        { id: 'type-1', name: 'Passport', regex: '^[A-Z0-9]{9}$' },
        { id: 'type-2', name: 'ID Card', regex: '^[0-9]{8}$' },
      ];

      (mockDb.identificationType.findMany as jest.Mock).mockResolvedValue(mockTypes);

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

      (mockDb.role.findMany as jest.Mock).mockResolvedValue(mockRoles);

      const result = await getRolesAsOptions(mockTenantId);

      expect(result).toEqual([
        { label: 'Admin', value: 'role-1' },
        { label: 'User', value: 'role-2' },
      ]);
    });
  });

  describe('getCurrentUserTenant', () => {
    it('should return current user tenant ID', async () => {
      const mockUserTenant = {
        id: 'user-tenant-1',
        user: {
          id: 'user-1',
          email: 'john@example.com',
          username: 'john.doe',
        },
        person: {
          id: null,
          firstName: 'John',
          lastName: 'Doe',
          image: null,
        },
      };
      (mockDb.userTenant.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockUserTenant);

      const result = await getCurrentUserTenant(mockTenantId);

      expect(result).toEqual({
        userTenantId: 'user-tenant-1',
        userId: 'user-1',
        userEmail: 'john@example.com',
        userUsername: 'john.doe',
        personId: null,
        personFirstName: 'John',
        personLastName: 'Doe',
        personImage: null,
        displayUserName: 'John Doe',
      });
    });
  });

  describe('upsertUser', () => {
    const mockUserData: UserTenantScopedFormValues = {
      user: {
        id: 'user-tenant-1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        isTwoFactorRequired: false,
        isAdmin: false,
        isEditing: false,
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

    it('should create invitation for new user', async () => {
      (mockDb.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await upsertUser(mockTenantId, mockUserData);

      expect(result).toEqual({
        isNewUser: true,
        email: mockUserData.user.email,
        invitationId: 'invitation-1',
      });

      expect(auth.api.createInvitation).toHaveBeenCalledWith({
        headers: expect.any(Object),
        body: {
          resend: true,
          email: mockUserData.user.email,
          role: 'member',
          organizationId: mockTenantId,
        },
      });

      expect(mockDb.invitationTenant.update).toHaveBeenCalledWith({
        where: { id: 'invitation-1' },
        data: {
          metadata: expect.stringContaining('"firstName":"John"'),
        },
      });
    });

    it('should update existing user', async () => {
      const existingUser = { id: 'user-1' };
      (mockDb.user.findUnique as jest.Mock).mockResolvedValue(existingUser);
      (mockDb.userTenant.findUnique as jest.Mock).mockResolvedValue({ personId: 'person-1' });
      (mockDb.person.findFirst as jest.Mock).mockResolvedValue(null);
      (mockDb.user.update as jest.Mock).mockResolvedValue(existingUser);

      // Ensure Better Auth returns the member for this user so update path is followed
      jest.mocked(auth.api.listMembers).mockResolvedValueOnce({
        members: [
          {
            id: 'member-1',
            organizationId: mockTenantId,
            role: 'member',
            createdAt: new Date(),
            userId: 'user-1',
            user: { id: 'user-1', name: 'John Doe', email: 'john@example.com', image: undefined },
          },
        ],
        total: 1,
      });

      await upsertUser(mockTenantId, mockUserData);

      expect(mockDb.user.update).toHaveBeenCalledWith({
        select: { id: true, email: true, username: true },
        where: { id: existingUser.id },
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

    it('should throw error if phone number already exists', async () => {
      const existingUser = { id: 'user-1' };
      (mockDb.user.findUnique as jest.Mock).mockResolvedValue(existingUser);
      (mockDb.userTenant.findUnique as jest.Mock).mockResolvedValue({ personId: 'person-1' });
      (mockDb.person.findFirst as jest.Mock).mockResolvedValue({ id: 'existing-person' });

      // Ensure Better Auth returns the member so the update path is taken
      jest.mocked(auth.api.listMembers).mockResolvedValueOnce({
        members: [
          {
            id: 'member-1',
            organizationId: mockTenantId,
            role: 'member',
            createdAt: new Date(),
            userId: existingUser.id,
            user: { id: existingUser.id, name: 'John Doe', email: 'john@example.com', image: undefined },
          },
        ],
        total: 1,
      });

      await expect(
        upsertUser(mockTenantId, {
          ...mockUserData,
          user: { ...mockUserData.user, phone: '1234567890' },
        })
      ).rejects.toThrow('Phone number is already registered in this tenant.');
    });
  });

  describe('processInvitationAcceptance', () => {
    const mockInvitationId = 'invitation-1';
    const mockMetadata = {
      firstName: 'John',
      lastName: 'Doe',
      isAdmin: false,
      isTwoFactorRequired: false,
      roles: [{ roleId: 'role-1', isActive: true }],
      areaRoles: [{ areaId: 'area-1', roleId: 'role-1', isActive: true }],
    };

    it('should process invitation acceptance successfully', async () => {
      (currentSession as jest.Mock).mockResolvedValue({
        session: {
          userId: 'user-123',
        },
      });

      (mockDb.invitationTenant.findUnique as jest.Mock).mockResolvedValue({
        tenantId: mockTenantId,
        metadata: JSON.stringify(mockMetadata),
      });

      const result = await processInvitationAcceptance(mockInvitationId);

      expect(result).toEqual({ tenantId: mockTenantId });
      expect(mockDb.userTenant.update).toHaveBeenCalledWith({
        where: { userId_tenantId: { userId: 'user-123', tenantId: mockTenantId } },
        data: expect.objectContaining({
          isTermAccepted: true,
          role: 'member',
          isTwoFactorRequired: false,
          isActive: true,
        }),
      });
    });

    it('should throw error if invitation metadata not found', async () => {
      (mockDb.invitationTenant.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(processInvitationAcceptance(mockInvitationId)).rejects.toThrow('Invitation metadata not found');
    });

    it('should throw error if invitation acceptance fails', async () => {
      (mockDb.invitationTenant.findUnique as jest.Mock).mockResolvedValue({
        tenantId: mockTenantId,
        metadata: JSON.stringify(mockMetadata),
      });
      (auth.api.acceptInvitation as unknown as jest.Mock).mockResolvedValue(null);

      await expect(processInvitationAcceptance(mockInvitationId)).rejects.toThrow('Failed to accept invitation');
    });
  });
});
