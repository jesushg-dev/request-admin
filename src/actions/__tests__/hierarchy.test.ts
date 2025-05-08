import { revalidatePath } from 'next/cache';
import { redirect } from '@/i18n/routing';
import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-server';

import {
  getAssignmentHierarchiesAndLevelsByTenantId,
  getAssignmentHierarchyAndLevelsByCategoryId,
  getAssignmentHierarchyAndLevelsById,
  getRequestHierarchiesAndLevelsByTenantId,
  getRequestHierarchyAndLevelsByCategoryId,
  getRequestHierarchyAndLevelsById,
  upsertAssignmentHierarchy,
  upsertRequestHierarchy,
} from '../hierarchy';

// Mock dependencies
jest.mock('@/server/db-server', () => ({
  db: {
    requestHierarchy: {
      upsert: jest.fn(),
      findFirstOrThrow: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    assignmentHierarchy: {
      upsert: jest.fn(),
      findFirstOrThrow: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('@/i18n/routing', () => ({
  redirect: jest.fn(),
}));

describe('Hierarchy Actions', () => {
  const mockSession = { user: { id: 'test-user-id' } };
  const mockTenantId = 'test-tenant-id';
  const mockLocale = 'en';
  const mockHierarchyData = {
    id: 'test-id',
    name: 'Test Hierarchy',
    description: 'Test Description',
    isActive: true,
    levels: [
      {
        id: 'level-1',
        name: 'Level 1',
        description: 'Level 1 Description',
        isActive: true,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('upsertRequestHierarchy', () => {
    it('should create a new request hierarchy', async () => {
      (db.requestHierarchy.upsert as jest.Mock).mockResolvedValueOnce(mockHierarchyData);

      await upsertRequestHierarchy(mockHierarchyData, mockTenantId, mockLocale);

      expect(db.requestHierarchy.upsert).toHaveBeenCalledWith({
        where: { id: mockHierarchyData.id, tenantId: mockTenantId },
        create: expect.any(Object),
        update: expect.any(Object),
      });
      expect(revalidatePath).toHaveBeenCalledWith(`/admin/${mockTenantId}/configurations/request-hierarchies`);
      expect(redirect).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      (currentSession as jest.Mock).mockResolvedValueOnce(null);

      await expect(upsertRequestHierarchy(mockHierarchyData, mockTenantId, mockLocale)).rejects.toThrow('User not found');
    });
  });

  describe('getRequestHierarchyAndLevelsById', () => {
    it('should return hierarchy with levels', async () => {
      const mockHierarchy = {
        id: mockHierarchyData.id,
        name: mockHierarchyData.name,
        description: mockHierarchyData.description,
        isActive: mockHierarchyData.isActive,
        levels: mockHierarchyData.levels,
        _count: { categories: 5 },
      };

      (db.requestHierarchy.findFirstOrThrow as jest.Mock).mockResolvedValueOnce(mockHierarchy);

      const result = await getRequestHierarchyAndLevelsById(mockTenantId, mockHierarchyData.id);

      expect(result).toEqual({
        ...mockHierarchyData,
        categoriesCount: 5,
      });
    });

    it('should throw error if user not found', async () => {
      (currentSession as jest.Mock).mockResolvedValueOnce(null);

      await expect(getRequestHierarchyAndLevelsById(mockTenantId, mockHierarchyData.id)).rejects.toThrow('User not found');
    });
  });

  describe('getRequestHierarchiesAndLevelsByTenantId', () => {
    it('should return array of hierarchies', async () => {
      const mockHierarchies = [mockHierarchyData];
      (db.requestHierarchy.findMany as jest.Mock).mockResolvedValueOnce(mockHierarchies);

      const result = await getRequestHierarchiesAndLevelsByTenantId(mockLocale, mockTenantId);

      expect(result).toEqual(mockHierarchies);
    });

    it('should redirect if no hierarchies found', async () => {
      (db.requestHierarchy.findMany as jest.Mock).mockResolvedValueOnce(null);

      await getRequestHierarchiesAndLevelsByTenantId(mockLocale, mockTenantId);

      expect(redirect).toHaveBeenCalled();
    });
  });

  describe('getAssignmentHierarchyAndLevelsById', () => {
    it('should return hierarchy with levels', async () => {
      const mockHierarchy = {
        id: mockHierarchyData.id,
        name: mockHierarchyData.name,
        description: mockHierarchyData.description,
        isActive: mockHierarchyData.isActive,
        levels: mockHierarchyData.levels,
        _count: { categories: 5 },
      };

      (db.assignmentHierarchy.findFirstOrThrow as jest.Mock).mockResolvedValueOnce(mockHierarchy);

      const result = await getAssignmentHierarchyAndLevelsById(mockTenantId, mockHierarchyData.id);

      expect(result).toEqual({
        ...mockHierarchyData,
        categoriesCount: 5,
      });
    });

    it('should throw error if user not found', async () => {
      (currentSession as jest.Mock).mockResolvedValueOnce(null);

      await expect(getAssignmentHierarchyAndLevelsById(mockTenantId, mockHierarchyData.id)).rejects.toThrow('User not found');
    });
  });

  describe('getAssignmentHierarchiesAndLevelsByTenantId', () => {
    it('should return array of hierarchies', async () => {
      const mockHierarchies = [mockHierarchyData];
      (db.assignmentHierarchy.findMany as jest.Mock).mockResolvedValueOnce(mockHierarchies);

      const result = await getAssignmentHierarchiesAndLevelsByTenantId(mockLocale, mockTenantId);

      expect(result).toEqual(mockHierarchies);
    });

    it('should redirect if no hierarchies found', async () => {
      (db.assignmentHierarchy.findMany as jest.Mock).mockResolvedValueOnce(null);

      await getAssignmentHierarchiesAndLevelsByTenantId(mockLocale, mockTenantId);

      expect(redirect).toHaveBeenCalled();
    });
  });

  describe('getRequestHierarchyAndLevelsByCategoryId', () => {
    it('should return hierarchy for category', async () => {
      const mockHierarchy = {
        ...mockHierarchyData,
        categories: [{ id: 'test-category' }],
      };

      (db.requestHierarchy.findFirst as jest.Mock).mockResolvedValueOnce(mockHierarchy);

      const result = await getRequestHierarchyAndLevelsByCategoryId(mockLocale, mockTenantId, 'test-category');

      expect(result).toEqual(mockHierarchy);
    });

    it('should redirect if no hierarchy found', async () => {
      (db.requestHierarchy.findFirst as jest.Mock).mockResolvedValueOnce(null);

      await getRequestHierarchyAndLevelsByCategoryId(mockLocale, mockTenantId, 'test-category');

      expect(redirect).toHaveBeenCalled();
    });
  });

  describe('getAssignmentHierarchyAndLevelsByCategoryId', () => {
    it('should return hierarchy for category', async () => {
      const mockHierarchy = {
        ...mockHierarchyData,
        categories: [{ id: 'test-category' }],
      };

      (db.assignmentHierarchy.findFirst as jest.Mock).mockResolvedValueOnce(mockHierarchy);

      const result = await getAssignmentHierarchyAndLevelsByCategoryId(mockLocale, mockTenantId, 'test-category');

      expect(result).toEqual(mockHierarchy);
    });

    it('should redirect if no hierarchy found', async () => {
      (db.assignmentHierarchy.findFirst as jest.Mock).mockResolvedValueOnce(null);

      await getAssignmentHierarchyAndLevelsByCategoryId(mockLocale, mockTenantId, 'test-category');

      expect(redirect).toHaveBeenCalled();
    });
  });

  describe('upsertAssignmentHierarchy', () => {
    it('should create a new assignment hierarchy', async () => {
      (db.assignmentHierarchy.upsert as jest.Mock).mockResolvedValueOnce(mockHierarchyData);

      await upsertAssignmentHierarchy(mockHierarchyData, mockTenantId, mockLocale);

      expect(db.assignmentHierarchy.upsert).toHaveBeenCalledWith({
        where: { id: mockHierarchyData.id, tenantId: mockTenantId },
        create: expect.any(Object),
        update: expect.any(Object),
      });
      expect(revalidatePath).toHaveBeenCalledWith(`/admin/${mockTenantId}/configurations/assignment-hierarchies`);
      expect(redirect).toHaveBeenCalled();
    });
  });
});
