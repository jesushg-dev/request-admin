// Import after mocks
import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-client';

import { CreateRole, getRoleAsFormById, UpdateRole } from '../role';

// Mock external dependencies
jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn(),
}));

jest.mock('@/server/db-client', () => ({
  db: {
    role: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userTenantRole: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

describe('Role Actions', () => {
  const mockSession = { user: { id: 'user-123' }, tenantId: 'tenant-123' };
  const mockTenantId = 'tenant-1';
  const mockRoleIds = ['role-1', 'role-2'];

  const mockRole = {
    id: 'role-1',
    name: 'Test Role',
    description: 'Test Description',
    isActive: true,
    roleFeature: [
      {
        id: 'feature-1',
        isActive: true,
        feature: {
          id: 'feature-1',
          moduleId: 'module-1',
          description: 'Feature Description',
          module: {
            name: 'Test Module',
            description: 'Module Description',
          },
          name: 'Test Feature',
        },
      },
    ],
    userRole: [
      {
        id: 'user-role-1',
        userTenantId: 'user-tenant-1',
        isActive: true,
        userTenant: {
          person: {
            firstName: 'John',
            lastName: 'Doe',
          },
          user: {
            username: 'johndoe',
          },
        },
      },
    ],
  };

  const mockRoleFormData = {
    roles: [
      {
        id: 'role-1',
        name: 'Test Role',
        description: 'Test Description',
        isActive: true,
        features: [
          {
            id: 'feature-1',
            moduleId: 'module-1',
            moduleName: 'Test Module',
            moduleDescription: 'Module Description',
            featureId: 'feature-1',
            featureName: 'Test Feature',
            featureDescription: 'Feature Description',
            isActive: true,
          },
        ],
      },
    ],
    userRoles: [
      {
        id: 'user-role-1',
        isActive: true,
        userId: {
          value: 'user-tenant-1',
          label: 'John Doe @johndoe',
        },
        roleId: {
          value: 'role-1',
          label: 'Test Role',
        },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('getRoleAsFormById', () => {
    it('should throw UserNotFoundErr when no session exists', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(getRoleAsFormById(mockRoleIds, mockTenantId)).rejects.toThrow('User not found');
    });

    it('should return formatted role form data', async () => {
      (db.role.findMany as jest.Mock).mockResolvedValue([mockRole]);

      const result = await getRoleAsFormById(mockRoleIds, mockTenantId);

      expect(result).toEqual({
        roles: [
          {
            id: mockRole.id,
            name: mockRole.name,
            description: mockRole.description,
            isActive: mockRole.isActive,
            features: [
              {
                id: mockRole.roleFeature[0].id,
                moduleId: mockRole.roleFeature[0].feature.moduleId,
                moduleName: mockRole.roleFeature[0].feature.module.name,
                moduleDescription: mockRole.roleFeature[0].feature.module.description,
                featureId: mockRole.roleFeature[0].feature.id,
                featureName: mockRole.roleFeature[0].feature.name,
                featureDescription: mockRole.roleFeature[0].feature.description,
                isActive: mockRole.roleFeature[0].isActive,
              },
            ],
          },
        ],
        userRoles: [
          {
            id: mockRole.userRole[0].id,
            isActive: mockRole.userRole[0].isActive,
            userId: {
              value: mockRole.userRole[0].userTenantId,
              label: `${mockRole.userRole[0].userTenant.person.firstName} ${mockRole.userRole[0].userTenant.person.lastName} @${mockRole.userRole[0].userTenant.user.username}`,
            },
            roleId: {
              value: mockRole.id,
              label: mockRole.name,
            },
          },
        ],
      });

      expect(db.role.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          roleFeature: {
            select: {
              id: true,
              isActive: true,
              feature: {
                select: {
                  id: true,
                  moduleId: true,
                  description: true,
                  module: { select: { name: true, description: true } },
                  name: true,
                },
              },
            },
          },
          userRole: {
            select: {
              id: true,
              userTenantId: true,
              userTenant: {
                select: {
                  person: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                  user: {
                    select: {
                      username: true,
                    },
                  },
                },
              },
              isActive: true,
            },
            orderBy: { isActive: 'asc' },
          },
        },
        where: { id: { in: mockRoleIds }, tenantId: mockTenantId },
      });
    });

    it('should handle null description fields', async () => {
      const roleWithNullDescriptions = {
        ...mockRole,
        description: null,
        roleFeature: [
          {
            ...mockRole.roleFeature[0],
            feature: {
              ...mockRole.roleFeature[0].feature,
              description: null,
              module: {
                ...mockRole.roleFeature[0].feature.module,
                description: null,
              },
            },
          },
        ],
      };

      (db.role.findMany as jest.Mock).mockResolvedValue([roleWithNullDescriptions]);

      const result = await getRoleAsFormById(mockRoleIds, mockTenantId);

      expect(result.roles[0].description).toBe('');
      expect(result.roles[0].features[0].featureDescription).toBe('');
      expect(result.roles[0].features[0].moduleDescription).toBe('');
    });

    it('should handle user without person data', async () => {
      const roleWithUserWithoutPerson = {
        ...mockRole,
        userRole: [
          {
            ...mockRole.userRole[0],
            userTenant: {
              person: null,
              user: {
                username: 'johndoe',
              },
            },
          },
        ],
      };

      (db.role.findMany as jest.Mock).mockResolvedValue([roleWithUserWithoutPerson]);

      const result = await getRoleAsFormById(mockRoleIds, mockTenantId);

      expect(result.userRoles[0].userId.label).toBe('johndoe');
    });
  });

  describe('CreateRole', () => {
    it('should throw error when user is not found', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(CreateRole(mockRoleFormData, mockTenantId)).rejects.toThrow('User not found');
    });

    it('should create roles successfully', async () => {
      const mockCreatedRole = {
        id: 'new-role-1',
        name: 'Test Role',
        description: 'Test Description',
        isActive: true,
        roleFeature: [
          {
            id: 'new-feature-1',
            isActive: true,
            feature: {
              id: 'feature-1',
              moduleId: 'module-1',
              name: 'Test Feature',
              module: {
                name: 'Test Module',
              },
            },
          },
        ],
      };

      (db.role.findFirst as jest.Mock).mockResolvedValue(null);
      (db.role.create as jest.Mock).mockResolvedValue(mockCreatedRole);
      (db.userTenantRole.create as jest.Mock).mockResolvedValue({});

      const result = await CreateRole(mockRoleFormData, mockTenantId);

      expect(result).toEqual([mockCreatedRole]);
      expect(db.role.create).toHaveBeenCalledWith({
        data: {
          name: mockRoleFormData.roles[0].name,
          description: mockRoleFormData.roles[0].description,
          isActive: mockRoleFormData.roles[0].isActive,
          tenantId: mockTenantId,
          createdBy: mockSession.user.id,
          roleFeature: {
            create: mockRoleFormData.roles[0].features.map((feature) => ({
              tenantId: mockTenantId,
              isActive: feature.isActive,
              featureId: feature.featureId,
              createdBy: mockSession.user.id,
            })),
          },
        },
        include: {
          roleFeature: {
            include: {
              feature: {
                include: {
                  module: true,
                },
              },
            },
          },
        },
      });
    });

    it('should throw error when no roles provided', async () => {
      const emptyData = { roles: [], userRoles: [] };

      await expect(CreateRole(emptyData, mockTenantId)).rejects.toThrow('At least one role is required');
    });

    it('should throw error when role name is missing', async () => {
      const invalidData = {
        ...mockRoleFormData,
        roles: [{ ...mockRoleFormData.roles[0], name: '' }],
      };

      await expect(CreateRole(invalidData, mockTenantId)).rejects.toThrow('Role name is required');
    });

    it('should throw error when role name already exists', async () => {
      (db.role.findFirst as jest.Mock).mockResolvedValue({ id: 'existing-role' });

      await expect(CreateRole(mockRoleFormData, mockTenantId)).rejects.toThrow('A role with the name "Test Role" already exists');
    });

    it('should handle user role assignments', async () => {
      const mockCreatedRole = {
        id: 'role-1',
        name: 'Test Role',
        roleFeature: [],
      };

      (db.role.findFirst as jest.Mock).mockResolvedValue(null);
      (db.role.create as jest.Mock).mockResolvedValue(mockCreatedRole);
      (db.userTenantRole.create as jest.Mock).mockResolvedValue({});

      await CreateRole(mockRoleFormData, mockTenantId);

      expect(db.userTenantRole.create).toHaveBeenCalledWith({
        data: {
          tenantId: mockTenantId,
          isActive: mockRoleFormData.userRoles[0].isActive,
          userTenantId: mockRoleFormData.userRoles[0].userId.value,
          roleId: mockCreatedRole.id,
          createdBy: mockSession.user.id,
        },
      });
    });
  });

  describe('UpdateRole', () => {
    it('should throw error when user is not found', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(UpdateRole(mockRoleFormData, mockTenantId)).rejects.toThrow('User not found');
    });

    it('should update roles successfully', async () => {
      const mockUpdatedRole = {
        id: 'role-1',
        name: 'Updated Role',
        description: 'Updated Description',
        isActive: false,
        roleFeature: [
          {
            id: 'updated-feature-1',
            isActive: false,
            feature: {
              id: 'feature-1',
              moduleId: 'module-1',
              name: 'Updated Feature',
              module: {
                name: 'Updated Module',
              },
            },
          },
        ],
      };

      (db.role.findFirst as jest.Mock)
        .mockResolvedValueOnce({ id: 'role-1', name: 'Old Role' }) // First call for existence check
        .mockResolvedValueOnce(null); // Second call for duplicate name check
      (db.role.update as jest.Mock).mockResolvedValue(mockUpdatedRole);
      (db.userTenantRole.deleteMany as jest.Mock).mockResolvedValue({});
      (db.userTenantRole.create as jest.Mock).mockResolvedValue({});

      const result = await UpdateRole(mockRoleFormData, mockTenantId);

      expect(result).toEqual([mockUpdatedRole]);
      expect(db.role.update).toHaveBeenCalledWith({
        where: { id: 'role-1', tenantId: mockTenantId },
        data: {
          name: mockRoleFormData.roles[0].name,
          description: mockRoleFormData.roles[0].description,
          isActive: mockRoleFormData.roles[0].isActive,
          updatedBy: mockSession.user.id,
          roleFeature: {
            deleteMany: { tenantId: mockTenantId, roleId: 'role-1' },
            create: mockRoleFormData.roles[0].features.map((feature) => ({
              tenantId: mockTenantId,
              isActive: feature.isActive,
              featureId: feature.featureId,
              createdBy: mockSession.user.id,
            })),
          },
        },
        include: {
          roleFeature: {
            include: {
              feature: {
                include: {
                  module: true,
                },
              },
            },
          },
        },
      });
    });

    it('should throw error when no roles provided', async () => {
      const emptyData = { roles: [], userRoles: [] };

      await expect(UpdateRole(emptyData, mockTenantId)).rejects.toThrow('At least one role is required');
    });

    it('should throw error when role name is missing', async () => {
      const invalidData = {
        ...mockRoleFormData,
        roles: [{ ...mockRoleFormData.roles[0], name: '' }],
      };

      await expect(UpdateRole(invalidData, mockTenantId)).rejects.toThrow('Role name is required');
    });

    it('should throw error when role not found', async () => {
      (db.role.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(UpdateRole(mockRoleFormData, mockTenantId)).rejects.toThrow('Role with ID "role-1" not found');
    });

    it('should throw error when role name already exists for another role', async () => {
      (db.role.findFirst as jest.Mock)
        .mockResolvedValueOnce({ id: 'role-1', name: 'Old Role' }) // First call for existence check
        .mockResolvedValueOnce({ id: 'other-role', name: 'Test Role' }); // Second call for duplicate name check

      await expect(UpdateRole(mockRoleFormData, mockTenantId)).rejects.toThrow('A role with the name "Test Role" already exists');
    });

    it('should handle user role assignments update', async () => {
      const mockUpdatedRole = {
        id: 'role-1',
        name: 'Test Role',
        roleFeature: [],
      };

      (db.role.findFirst as jest.Mock).mockResolvedValueOnce({ id: 'role-1', name: 'Old Role' }).mockResolvedValueOnce(null);
      (db.role.update as jest.Mock).mockResolvedValue(mockUpdatedRole);
      (db.userTenantRole.deleteMany as jest.Mock).mockResolvedValue({});
      (db.userTenantRole.create as jest.Mock).mockResolvedValue({});

      await UpdateRole(mockRoleFormData, mockTenantId);

      expect(db.userTenantRole.deleteMany).toHaveBeenCalledWith({
        where: {
          tenantId: mockTenantId,
          roleId: { in: ['role-1'] },
        },
      });

      expect(db.userTenantRole.create).toHaveBeenCalledWith({
        data: {
          tenantId: mockTenantId,
          isActive: mockRoleFormData.userRoles[0].isActive,
          userTenantId: mockRoleFormData.userRoles[0].userId.value,
          roleId: mockUpdatedRole.id,
          createdBy: mockSession.user.id,
        },
      });
    });
  });
});
