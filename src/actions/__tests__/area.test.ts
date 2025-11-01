import { getDb } from '@/server/db-client';

import { getAreaByTenantIdAndAreaId, getAreasWithRolesAsOptionsByTenantId } from '../area';
import { getAssignmentCategoriesByIds } from '../assignment-type';

// Mock the database client
const mockDb = {
  area: {
    findFirstOrThrow: jest.fn(),
    findMany: jest.fn(),
  },
};

jest.mock('@/server/db-client', () => ({
  getDb: jest.fn(),
}));

// Mock the assignment type actions
jest.mock('../assignment-type', () => ({
  getAssignmentCategoriesByIds: jest.fn(),
}));

describe('Area Actions', () => {
  const mockTenantId = 'tenant-123';
  const mockAreaId = 'area-123';

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue(mockDb);
  });

  describe('getAreaByTenantIdAndAreaId', () => {
    const mockArea = {
      id: mockAreaId,
      name: 'Test Area',
      description: 'Test Description',
      isActive: true,
      areaRole: [
        {
          id: 'role-1',
          name: 'Admin Role',
          description: 'Admin Description',
          isActive: true,
          areaRoleFeatures: [
            {
              id: 'feature-1',
              isActive: true,
              featureId: 'feature-1',
              feature: {
                id: 'feature-1',
                name: 'Test Feature',
                description: 'Feature Description',
                isActive: true,
                module: {
                  id: 'module-1',
                  name: 'Test Module',
                  description: 'Module Description',
                  isActive: true,
                },
              },
            },
          ],
        },
      ],
      userAreas: [
        {
          id: 'user-area-1',
          isActive: true,
          role: {
            id: 'role-1',
            name: 'Admin',
          },
          userTenant: {
            id: 'user-tenant-1',
            person: {
              firstName: 'John',
              lastName: 'Doe',
            },
            user: {
              username: 'johndoe',
              email: 'john@example.com',
            },
          },
        },
      ],
      assignmentCategories: [
        {
          id: 'category-1',
          hierarchy: {
            id: 'hierarchy-1',
            name: 'Test Hierarchy',
          },
        },
      ],
    };

    const mockCategories = [
      {
        id: 'category-1',
        name: 'Test Category',
        description: 'Category Description',
        isActive: true,
      },
    ];

    it('should return area data with all related information', async () => {
      (mockDb.area.findFirstOrThrow as jest.Mock).mockResolvedValue(mockArea);
      (getAssignmentCategoriesByIds as jest.Mock).mockResolvedValue({ categories: mockCategories });

      const result = await getAreaByTenantIdAndAreaId(mockTenantId, mockAreaId);

      expect(result).toEqual({
        id: mockArea.id,
        name: mockArea.name,
        description: mockArea.description,
        isActive: mockArea.isActive,
        hierarchyId: {
          value: mockArea.assignmentCategories[0].hierarchy.id,
          label: mockArea.assignmentCategories[0].hierarchy.name,
        },
        roles: [
          {
            id: mockArea.areaRole[0].id,
            name: mockArea.areaRole[0].name,
            description: mockArea.areaRole[0].description,
            isActive: mockArea.areaRole[0].isActive,
            features: [
              {
                id: mockArea.areaRole[0].areaRoleFeatures[0].id,
                isActive: mockArea.areaRole[0].areaRoleFeatures[0].isActive,
                featureId: mockArea.areaRole[0].areaRoleFeatures[0].featureId,
                moduleId: mockArea.areaRole[0].areaRoleFeatures[0].feature.module.id,
                moduleName: mockArea.areaRole[0].areaRoleFeatures[0].feature.module.name,
                moduleDescription: mockArea.areaRole[0].areaRoleFeatures[0].feature.module.description,
                featureName: mockArea.areaRole[0].areaRoleFeatures[0].feature.name,
                featureDescription: mockArea.areaRole[0].areaRoleFeatures[0].feature.description,
              },
            ],
          },
        ],
        userRoles: [
          {
            id: mockArea.userAreas[0].id,
            isActive: mockArea.userAreas[0].isActive,
            userId: {
              value: mockArea.userAreas[0].userTenant.id,
              label: `${mockArea.userAreas[0].userTenant.person.firstName} ${mockArea.userAreas[0].userTenant.person.lastName} @${mockArea.userAreas[0].userTenant.user.username}`,
            },
            roleId: {
              value: mockArea.userAreas[0].role.id,
              label: mockArea.userAreas[0].role.name,
            },
          },
        ],
        categories: mockCategories,
      });
    });

    it('should throw an error when area is not found', async () => {
      (mockDb.area.findFirstOrThrow as jest.Mock).mockRejectedValue(new Error('Area not found'));

      await expect(getAreaByTenantIdAndAreaId(mockTenantId, mockAreaId)).rejects.toThrow('Area not found');
    });
  });

  describe('getAreasWithRolesAsOptionsByTenantId', () => {
    const mockAreas = [
      {
        id: 'area-1',
        name: 'Area 1',
        isActive: true,
        areaRole: [
          { id: 'role-1', name: 'Role 1', isActive: true },
          { id: 'role-2', name: 'Role 2', isActive: true },
        ],
      },
      {
        id: 'area-2',
        name: 'Area 2',
        isActive: false,
        areaRole: [{ id: 'role-3', name: 'Role 3', isActive: true }],
      },
    ];

    it('should return active areas with their roles as options', async () => {
      (mockDb.area.findMany as jest.Mock).mockResolvedValue(mockAreas);

      const result = await getAreasWithRolesAsOptionsByTenantId(mockTenantId);

      expect(result).toEqual([
        {
          label: 'Area 1 (2 roles)',
          value: 'area-1',
          roleOptions: [
            { label: 'Role 1', value: 'role-1' },
            { label: 'Role 2', value: 'role-2' },
          ],
        },
      ]);
    });

    it('should return empty array when no areas are found', async () => {
      (mockDb.area.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getAreasWithRolesAsOptionsByTenantId(mockTenantId);

      expect(result).toEqual([]);
    });
  });
});
