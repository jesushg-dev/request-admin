import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-client';

import { CreateRequestPriorityType, getRequestPriorityTypeAsFormById, getRequestPriorityTypesAsOptions, UpdateRequestPriorityType } from '../priority';

// Mock the dependencies
jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn(),
}));

jest.mock('@/server/db-client', () => ({
  db: {
    requestPriorityType: {
      findMany: jest.fn(),
      findFirstOrThrow: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('Priority Actions', () => {
  const mockSession = { user: { id: 'user-1' } };
  const mockTenantId = 'tenant-1';
  const mockPriorityId = 'priority-1';

  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('getRequestPriorityTypesAsOptions', () => {
    it('should throw error when user is not found', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(getRequestPriorityTypesAsOptions(mockTenantId)).rejects.toThrow('User not found');
    });

    it('should return priority types for tenant', async () => {
      const mockPriorityTypes = [
        { id: '1', name: 'High', level: 1 },
        { id: '2', name: 'Medium', level: 2 },
      ];

      (db.requestPriorityType.findMany as jest.Mock).mockResolvedValue(mockPriorityTypes);

      const result = await getRequestPriorityTypesAsOptions(mockTenantId);

      expect(result).toEqual(mockPriorityTypes);
      expect(db.requestPriorityType.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
        },
        where: { tenantId: mockTenantId, isActive: true },
      });
    });
  });

  describe('getRequestPriorityTypeAsFormById', () => {
    it('should throw error when user is not found', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(getRequestPriorityTypeAsFormById(mockPriorityId, mockTenantId)).rejects.toThrow('User not found');
    });

    it('should return priority type form data', async () => {
      const mockPriority = {
        id: mockPriorityId,
        name: 'High Priority',
        description: 'Urgent matters',
        primaryColor: '#FF0000',
        level: 1,
        isActive: true,
      };

      (db.requestPriorityType.findFirstOrThrow as jest.Mock).mockResolvedValue(mockPriority);

      const result = await getRequestPriorityTypeAsFormById(mockPriorityId, mockTenantId);

      expect(result).toEqual({
        ...mockPriority,
        isDefault: false,
        description: mockPriority.description,
      });

      expect(db.requestPriorityType.findFirstOrThrow).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
          primaryColor: true,
          level: true,
          isActive: true,
        },
        where: { id: mockPriorityId, tenantId: mockTenantId },
      });
    });

    it('should handle null description', async () => {
      const mockPriority = {
        id: mockPriorityId,
        name: 'High Priority',
        description: null,
        primaryColor: '#FF0000',
        level: 1,
        isActive: true,
      };

      (db.requestPriorityType.findFirstOrThrow as jest.Mock).mockResolvedValue(mockPriority);

      const result = await getRequestPriorityTypeAsFormById(mockPriorityId, mockTenantId);

      expect(result.description).toBe('');
    });
  });

  describe('CreateRequestPriorityType', () => {
    const validData = {
      name: 'High Priority',
      primaryColor: '#FF0000',
      description: 'Urgent matters',
      level: 1,
      isActive: true,
    };

    it('should throw error when user is not found', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(CreateRequestPriorityType(validData, mockTenantId)).rejects.toThrow('User not found');
    });

    it('should create priority type successfully', async () => {
      const mockCreatedPriority = {
        id: 'new-priority-1',
        ...validData,
        tenantId: mockTenantId,
        createdBy: mockSession.user.id,
      };

      (db.requestPriorityType.findFirst as jest.Mock).mockResolvedValue(null);
      (db.requestPriorityType.create as jest.Mock).mockResolvedValue(mockCreatedPriority);

      const result = await CreateRequestPriorityType(validData, mockTenantId);

      expect(result).toEqual(mockCreatedPriority);
      expect(db.requestPriorityType.findFirst).toHaveBeenCalledWith({
        where: { name: validData.name, tenantId: mockTenantId },
      });
      expect(db.requestPriorityType.create).toHaveBeenCalledWith({
        data: {
          ...validData,
          description: validData.description,
          level: validData.level,
          isActive: validData.isActive,
          tenantId: mockTenantId,
          createdBy: mockSession.user.id,
        },
      });
    });

    it('should throw error when name already exists', async () => {
      (db.requestPriorityType.findFirst as jest.Mock).mockResolvedValue({ id: 'existing-priority' });

      await expect(CreateRequestPriorityType(validData, mockTenantId)).rejects.toThrow('A priority type with this name already exists');
    });

    it('should throw error when name is missing', async () => {
      const invalidData = { ...validData, name: '' };

      await expect(CreateRequestPriorityType(invalidData, mockTenantId)).rejects.toThrow('Name and color are required');
    });

    it('should throw error when color is missing', async () => {
      const invalidData = { ...validData, primaryColor: '' };

      await expect(CreateRequestPriorityType(invalidData, mockTenantId)).rejects.toThrow('Name and color are required');
    });

    it('should handle empty description', async () => {
      const dataWithEmptyDescription = { ...validData, description: '' };
      const mockCreatedPriority = {
        id: 'new-priority-1',
        ...dataWithEmptyDescription,
        tenantId: mockTenantId,
        createdBy: mockSession.user.id,
      };

      (db.requestPriorityType.findFirst as jest.Mock).mockResolvedValue(null);
      (db.requestPriorityType.create as jest.Mock).mockResolvedValue(mockCreatedPriority);

      await CreateRequestPriorityType(dataWithEmptyDescription, mockTenantId);

      expect(db.requestPriorityType.create).toHaveBeenCalledWith({
        data: {
          ...dataWithEmptyDescription,
          description: '',
          level: dataWithEmptyDescription.level,
          isActive: dataWithEmptyDescription.isActive,
          tenantId: mockTenantId,
          createdBy: mockSession.user.id,
        },
      });
    });
  });

  describe('UpdateRequestPriorityType', () => {
    const validData = {
      name: 'Updated Priority',
      primaryColor: '#00FF00',
      description: 'Updated description',
      level: 2,
      isActive: false,
    };

    it('should throw error when user is not found', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(UpdateRequestPriorityType(mockPriorityId, validData, mockTenantId)).rejects.toThrow('User not found');
    });

    it('should update priority type successfully', async () => {
      const mockExistingPriority = { id: mockPriorityId, name: 'Old Priority' };
      const mockUpdatedPriority = {
        id: mockPriorityId,
        ...validData,
        tenantId: mockTenantId,
        updatedBy: mockSession.user.id,
      };

      (db.requestPriorityType.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockExistingPriority) // First call for existence check
        .mockResolvedValueOnce(null); // Second call for duplicate name check
      (db.requestPriorityType.update as jest.Mock).mockResolvedValue(mockUpdatedPriority);

      const result = await UpdateRequestPriorityType(mockPriorityId, validData, mockTenantId);

      expect(result).toEqual(mockUpdatedPriority);
      expect(db.requestPriorityType.update).toHaveBeenCalledWith({
        where: { id: mockPriorityId, tenantId: mockTenantId },
        data: {
          ...validData,
          description: validData.description,
          level: validData.level,
          isActive: validData.isActive,
          updatedBy: mockSession.user.id,
        },
      });
    });

    it('should throw error when priority type not found', async () => {
      (db.requestPriorityType.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(UpdateRequestPriorityType(mockPriorityId, validData, mockTenantId)).rejects.toThrow('Priority type not found');
    });

    it('should throw error when name already exists for another priority', async () => {
      const mockExistingPriority = { id: mockPriorityId, name: 'Old Priority' };
      const mockDuplicatePriority = { id: 'other-priority', name: validData.name };

      (db.requestPriorityType.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockExistingPriority) // First call for existence check
        .mockResolvedValueOnce(mockDuplicatePriority); // Second call for duplicate name check

      await expect(UpdateRequestPriorityType(mockPriorityId, validData, mockTenantId)).rejects.toThrow('A priority type with this name already exists');
    });

    it('should throw error when name is missing', async () => {
      const invalidData = { ...validData, name: '' };

      await expect(UpdateRequestPriorityType(mockPriorityId, invalidData, mockTenantId)).rejects.toThrow('Name and color are required');
    });

    it('should throw error when color is missing', async () => {
      const invalidData = { ...validData, primaryColor: '' };

      await expect(UpdateRequestPriorityType(mockPriorityId, invalidData, mockTenantId)).rejects.toThrow('Name and color are required');
    });
  });
});
