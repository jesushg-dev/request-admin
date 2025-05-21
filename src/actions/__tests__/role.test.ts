// Import after mocks
import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-client';

import { getRoleAsFormById } from '../role';

// Mock external dependencies
jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn(),
}));

jest.mock('@/server/db-client', () => ({
  db: {
    role: {
      findMany: jest.fn(),
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
});
