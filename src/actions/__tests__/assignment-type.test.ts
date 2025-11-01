import { getDb } from '@/server/db-client';

import { AssignmentCategory } from '@/components/common/category/assignment-category-form';

import { getAssignmentCategoriesByIds, upsertCategoriesFlat } from '../assignment-type';

// Mock the db client
const mockDb: any = {
  assignmentCategory: {
    findMany: jest.fn(),
    upsert: jest.fn(),
  },
  $transaction: jest.fn(),
};
mockDb.$transaction.mockImplementation((callback: any) => callback(mockDb));

jest.mock('@/server/db-client', () => ({
  getDb: jest.fn(),
}));

describe('Assignment Type Actions', () => {
  const mockTenantId = 'tenant-123';
  const mockHierarchyId = 'hierarchy-123';
  const mockAreaId = 'area-123';

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue(mockDb);
  });

  describe('getAssignmentCategoriesByIds', () => {
    it('should fetch and build category tree correctly', async () => {
      // Mock data
      const rootIds = ['root-1', 'root-2'];
      const mockDbCategories = [
        {
          id: 'root-1',
          name: 'Root 1',
          description: 'Description 1',
          isActive: true,
          hierarchyLevelId: 'level-1',
          parentCategoryId: null,
        },
        {
          id: 'child-1',
          name: 'Child 1',
          description: 'Child Description 1',
          isActive: true,
          hierarchyLevelId: 'level-2',
          parentCategoryId: 'root-1',
        },
        {
          id: 'root-2',
          name: 'Root 2',
          description: 'Description 2',
          isActive: true,
          hierarchyLevelId: 'level-1',
          parentCategoryId: null,
        },
      ];

      // Mock the database response
      (mockDb.assignmentCategory.findMany as jest.Mock).mockResolvedValue(mockDbCategories);

      // Execute the function
      const result = await getAssignmentCategoriesByIds(rootIds, mockTenantId);

      // Verify the result
      expect(result.categories).toHaveLength(2);
      expect(result.categories[0].id).toBe('root-1');
      expect(result.categories[0].subcategories).toHaveLength(1);
      expect(result.categories[0].subcategories[0].id).toBe('child-1');
      expect(result.categories[1].id).toBe('root-2');
      expect(result.categories[1].subcategories).toHaveLength(0);

      // Verify database calls
      expect(mockDb.assignmentCategory.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          hierarchyLevelId: true,
          parentCategoryId: true,
        },
        where: {
          tenantId: mockTenantId,
          OR: [{ id: { in: rootIds } }, { parentCategoryId: { in: rootIds } }],
        },
      });
    });

    it('should handle empty rootIds', async () => {
      const result = await getAssignmentCategoriesByIds([], mockTenantId);
      expect(result.categories).toHaveLength(0);
    });
  });

  describe('upsertCategoriesFlat', () => {
    it('should upsert categories in correct order', async () => {
      const mockCategories: AssignmentCategory[] = [
        {
          id: 'root-1',
          name: 'Root 1',
          description: 'Description 1',
          isActive: true,
          hierarchyLevelId: 'level-1',
          subcategories: [
            {
              id: 'child-1',
              name: 'Child 1',
              description: 'Child Description 1',
              isActive: true,
              hierarchyLevelId: 'level-2',
              subcategories: [],
              isSubCategoryVisible: true,
            },
          ],
          isSubCategoryVisible: true,
        },
      ];

      // Mock the transaction
      (mockDb.$transaction as jest.Mock).mockImplementation((callback) => callback(mockDb));

      await upsertCategoriesFlat(mockCategories, mockTenantId, mockHierarchyId, mockAreaId);

      // Verify that upsert was called for both categories
      expect(mockDb.assignmentCategory.upsert).toHaveBeenCalledTimes(2);

      // Verify the first call (root category)
      expect(mockDb.assignmentCategory.upsert).toHaveBeenNthCalledWith(1, {
        where: { id: 'root-1' },
        create: {
          areaId: mockAreaId,
          tenantId: mockTenantId,
          hierarchyId: mockHierarchyId,
          id: 'root-1',
          name: 'Root 1',
          description: 'Description 1',
          isActive: true,
          parentCategoryId: null,
          hierarchyLevelId: 'level-1',
        },
        update: {
          areaId: mockAreaId,
          tenantId: mockTenantId,
          hierarchyId: mockHierarchyId,
          name: 'Root 1',
          description: 'Description 1',
          isActive: true,
          parentCategoryId: null,
          hierarchyLevelId: 'level-1',
        },
      });

      // Verify the second call (child category)
      expect(mockDb.assignmentCategory.upsert).toHaveBeenNthCalledWith(2, {
        where: { id: 'child-1' },
        create: {
          areaId: mockAreaId,
          tenantId: mockTenantId,
          hierarchyId: mockHierarchyId,
          id: 'child-1',
          name: 'Child 1',
          description: 'Child Description 1',
          isActive: true,
          parentCategoryId: 'root-1',
          hierarchyLevelId: 'level-2',
        },
        update: {
          areaId: mockAreaId,
          tenantId: mockTenantId,
          hierarchyId: mockHierarchyId,
          name: 'Child 1',
          description: 'Child Description 1',
          isActive: true,
          parentCategoryId: 'root-1',
          hierarchyLevelId: 'level-2',
        },
      });
    });

    it('should handle empty categories array', async () => {
      await upsertCategoriesFlat([], mockTenantId, mockHierarchyId, mockAreaId);
      expect(mockDb.assignmentCategory.upsert).not.toHaveBeenCalled();
    });
  });
});
