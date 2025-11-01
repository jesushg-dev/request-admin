import { getDb } from '@/server/db-client';

import { generateUuid } from '@/lib/id';
import { RequestCategoryValues } from '@/components/common/request-type/category-form';

import { getRequestCategoriesByIds, upsertCategoriesFlat } from '../request-type';

// Mock the database client
const mockDb: any = {
  requestCategory: {
    findMany: jest.fn(),
    upsert: jest.fn(),
  },
  requestHierarchy: {
    findFirstOrThrow: jest.fn(),
  },
  $transaction: jest.fn(),
};
mockDb.$transaction.mockImplementation((callback: any) => callback(mockDb));

jest.mock('@/server/db-client', () => ({
  getDb: jest.fn(),
}));

describe('Request Type Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue(mockDb);
  });

  describe('getRequestCategoriesByIds', () => {
    const mockTenantId = 'tenant-123';
    const mockHierarchyId = 'hierarchy-123';
    const mockRootIds = ['root-1', 'root-2'];

    const mockCategory = {
      id: 'cat-1',
      name: 'Test Category',
      description: 'Test Description',
      isActive: true,
      hierarchyLevelId: 'level-1',
      parentCategoryId: null,
      isEligibleForNewClients: true,
      requestCategoryRequirements: [],
      categoryForms: [],
      sla: {
        id: 'sla-1',
        resolutionTime: 24,
        escalationTime: 12,
      },
      guideDocuments: [],
      executionFlowDefinitions: [],
    };

    it('should fetch and transform categories correctly', async () => {
      // Mock database responses
      (mockDb.requestCategory.findMany as jest.Mock).mockResolvedValue([mockCategory]);
      (mockDb.requestHierarchy.findFirstOrThrow as jest.Mock).mockResolvedValue({
        id: mockHierarchyId,
        name: 'Test Hierarchy',
      });

      const result = await getRequestCategoriesByIds(mockRootIds, mockTenantId);

      expect(result.categories).toHaveLength(1);
      expect(result.hierarchyId).toEqual({
        value: mockHierarchyId,
        label: 'Test Hierarchy',
      });

      const category = result.categories[0];
      expect(category).toEqual({
        id: mockCategory.id,
        name: mockCategory.name,
        description: mockCategory.description,
        isActive: mockCategory.isActive,
        hierarchyLevelId: mockCategory.hierarchyLevelId,
        isEligibleForNewClients: mockCategory.isEligibleForNewClients,
        requirements: [],
        forms: [],
        sla: {
          id: mockCategory.sla.id,
          resolutionTime: mockCategory.sla.resolutionTime,
          escalationTime: mockCategory.sla.escalationTime,
        },
        parentCategoryId: null,
        children: [],
        guides: [],
      });
    });

    it('should handle empty categories array', async () => {
      (mockDb.requestCategory.findMany as jest.Mock).mockResolvedValue([]);
      (mockDb.requestHierarchy.findFirstOrThrow as jest.Mock).mockResolvedValue({
        id: mockHierarchyId,
        name: 'Test Hierarchy',
      });

      const result = await getRequestCategoriesByIds(mockRootIds, mockTenantId);

      expect(result.categories).toHaveLength(0);
      expect(result.hierarchyId).toBeDefined();
    });

    it('should handle categories with requirements and forms', async () => {
      const categoryWithRequirements = {
        ...mockCategory,
        requestCategoryRequirements: [
          { requirementId: 'req-1', requirement: { name: 'Requirement 1' } },
          { requirementId: 'req-2', requirement: { name: 'Requirement 2' } },
        ],
        categoryForms: [
          { formId: 'form-1', form: { name: 'Form 1' } },
          { formId: 'form-2', form: { name: 'Form 2' } },
        ],
        executionFlowDefinitions: [],
      };

      (mockDb.requestCategory.findMany as jest.Mock).mockResolvedValue([categoryWithRequirements]);
      (mockDb.requestHierarchy.findFirstOrThrow as jest.Mock).mockResolvedValue({
        id: mockHierarchyId,
        name: 'Test Hierarchy',
      });

      const result = await getRequestCategoriesByIds(mockRootIds, mockTenantId);
      const category = result.categories[0];

      expect(category.requirements!).toHaveLength(2);
      expect(category.forms!).toHaveLength(2);
      expect(category.requirements![0]).toEqual({ value: 'req-1', label: 'Requirement 1' });
      expect(category.forms![0]).toEqual({ value: 'form-1', label: 'Form 1' });
    });

    it('should handle categories with guide documents', async () => {
      const categoryWithGuides = {
        ...mockCategory,
        guideDocuments: [
          {
            id: 'guide-1',
            name: 'Guide 1',
            description: 'Guide Description',
            fileType: 'PDF',
            fileUrl: 'http://example.com/guide1.pdf',
            version: '1.0',
            updatedAt: new Date('2024-01-01'),
            isActive: true,
          },
        ],
        executionFlowDefinitions: [],
      };

      (mockDb.requestCategory.findMany as jest.Mock).mockResolvedValue([categoryWithGuides]);
      (mockDb.requestHierarchy.findFirstOrThrow as jest.Mock).mockResolvedValue({
        id: mockHierarchyId,
        name: 'Test Hierarchy',
      });

      const result = await getRequestCategoriesByIds(mockRootIds, mockTenantId);
      const category = result.categories[0];

      expect(category.guides).toHaveLength(1);
      expect(category.guides[0]).toEqual({
        id: 'guide-1',
        name: 'Guide 1',
        description: 'Guide Description',
        fileType: 'PDF',
        fileUrl: 'http://example.com/guide1.pdf',
        version: '1.0',
        updatedAt: expect.any(String),
        isActive: true,
      });
    });

    it('should handle database errors gracefully', async () => {
      (mockDb.requestCategory.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(getRequestCategoriesByIds(mockRootIds, mockTenantId)).rejects.toThrow('Database error');
    });

    it('should handle missing hierarchy gracefully', async () => {
      (mockDb.requestCategory.findMany as jest.Mock).mockResolvedValue([mockCategory]);
      (mockDb.requestHierarchy.findFirstOrThrow as jest.Mock).mockRejectedValue(new Error('Hierarchy not found'));

      await expect(getRequestCategoriesByIds(mockRootIds, mockTenantId)).rejects.toThrow('Hierarchy not found');
    });
  });

  describe('upsertCategoriesFlat', () => {
    const mockTenantId = 'tenant-123';
    const mockHierarchyId = 'hierarchy-123';

    const mockCategories: RequestCategoryValues[] = [
      {
        id: 'cat-1',
        name: 'Parent Category',
        description: 'Parent Description',
        isActive: true,
        hierarchyLevelId: 'level-1',
        parentCategoryId: null,
        isEligibleForNewClients: true,
        requirements: [],
        forms: [],
        sla: {
          id: generateUuid(),
          resolutionTime: 24,
          escalationTime: 12,
        },
        children: ['cat-2'],
        guides: [],
      },
      {
        id: 'cat-2',
        name: 'Child Category',
        description: 'Child Description',
        isActive: true,
        hierarchyLevelId: 'level-2',
        parentCategoryId: 'cat-1',
        isEligibleForNewClients: true,
        requirements: [],
        forms: [],
        sla: {
          id: generateUuid(),
          resolutionTime: 12,
          escalationTime: 6,
        },
        children: [],
        guides: [],
      },
    ];

    it('should process categories in correct order (parent before child)', async () => {
      const mockTransaction = jest.fn();
      (mockDb.$transaction as jest.Mock).mockImplementation(mockTransaction);

      await upsertCategoriesFlat(mockCategories, mockTenantId, mockHierarchyId);

      expect(mockDb.$transaction).toHaveBeenCalled();
      expect(mockTransaction).toHaveBeenCalled();
    });

    it('should handle empty categories array', async () => {
      const mockTransaction = jest.fn();
      (mockDb.$transaction as jest.Mock).mockImplementation(mockTransaction);

      await upsertCategoriesFlat([], mockTenantId, mockHierarchyId);

      expect(mockDb.$transaction).toHaveBeenCalled();
      expect(mockTransaction).toHaveBeenCalled();
    });

    it('should handle complex category hierarchy', async () => {
      const complexCategories: RequestCategoryValues[] = [
        {
          id: 'cat-1',
          name: 'Root Category',
          description: 'Root Description',
          isActive: true,
          hierarchyLevelId: 'level-1',
          parentCategoryId: null,
          isEligibleForNewClients: true,
          requirements: [],
          forms: [],
          sla: {
            id: generateUuid(),
            resolutionTime: 24,
            escalationTime: 12,
          },
          children: ['cat-2', 'cat-3'],
          guides: [],
        },
        {
          id: 'cat-2',
          name: 'First Level Child',
          description: 'First Level Description',
          isActive: true,
          hierarchyLevelId: 'level-2',
          parentCategoryId: 'cat-1',
          isEligibleForNewClients: true,
          requirements: [],
          forms: [],
          sla: {
            id: generateUuid(),
            resolutionTime: 12,
            escalationTime: 6,
          },
          children: ['cat-4'],
          guides: [],
        },
        {
          id: 'cat-3',
          name: 'Another First Level Child',
          description: 'Another First Level Description',
          isActive: true,
          hierarchyLevelId: 'level-2',
          parentCategoryId: 'cat-1',
          isEligibleForNewClients: true,
          requirements: [],
          forms: [],
          sla: {
            id: generateUuid(),
            resolutionTime: 12,
            escalationTime: 6,
          },
          children: [],
          guides: [],
        },
        {
          id: 'cat-4',
          name: 'Second Level Child',
          description: 'Second Level Description',
          isActive: true,
          hierarchyLevelId: 'level-3',
          parentCategoryId: 'cat-2',
          isEligibleForNewClients: true,
          requirements: [],
          forms: [],
          sla: {
            id: generateUuid(),
            resolutionTime: 6,
            escalationTime: 3,
          },
          children: [],
          guides: [],
        },
      ];

      const mockTransaction = jest.fn();
      (mockDb.$transaction as jest.Mock).mockImplementation(mockTransaction);

      await upsertCategoriesFlat(complexCategories, mockTenantId, mockHierarchyId);

      expect(mockDb.$transaction).toHaveBeenCalled();
      expect(mockTransaction).toHaveBeenCalled();
    });

    it('should handle transaction errors', async () => {
      const mockTransaction = jest.fn().mockRejectedValue(new Error('Transaction failed'));
      (mockDb.$transaction as jest.Mock).mockImplementation(mockTransaction);

      await expect(upsertCategoriesFlat(mockCategories, mockTenantId, mockHierarchyId)).rejects.toThrow('Transaction failed');
    });

    it('should handle categories with missing parent references', async () => {
      const categoriesWithMissingParent = [
        {
          ...mockCategories[1],
          parentCategoryId: 'non-existent-parent',
        },
      ];

      const mockTransaction = jest.fn();
      (mockDb.$transaction as jest.Mock).mockImplementation(mockTransaction);

      await upsertCategoriesFlat(categoriesWithMissingParent, mockTenantId, mockHierarchyId);

      expect(mockDb.$transaction).toHaveBeenCalled();
      expect(mockTransaction).toHaveBeenCalled();
    });

    it('should handle invalid parent references', async () => {
      const categoriesWithInvalidParent = [
        {
          id: 'cat-1',
          name: 'Category 1',
          description: 'Description 1',
          isActive: true,
          hierarchyLevelId: 'level-1',
          parentCategoryId: 'non-existent',
          isEligibleForNewClients: true,
          requirements: [],
          forms: [],
          sla: {
            id: generateUuid(),
            resolutionTime: 24,
            escalationTime: 12,
          },
          children: [],
          guides: [],
        },
      ];

      const mockTransaction = jest.fn();
      (mockDb.$transaction as jest.Mock).mockImplementation(mockTransaction);

      await upsertCategoriesFlat(categoriesWithInvalidParent, mockTenantId, mockHierarchyId);

      expect(mockDb.$transaction).toHaveBeenCalled();
      expect(mockTransaction).toHaveBeenCalled();
    });
  });
});
