// Import after mocks
import { currentSession } from '@/server/auth-server';
import { getDb } from '@/server/db-client';

import { CreateRequirementType, getRequirementTypeAsFormById, getRequirementTypesAsOptions, UpdateRequirementType } from '../requirementType';

// Mock external dependencies
jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn(),
}));

const mockDb = {
  requirementType: {
    findMany: jest.fn(),
    findFirstOrThrow: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('@/server/db-client', () => ({
  getDb: jest.fn(),
}));

describe('RequirementType Actions', () => {
  const mockSession = { user: { id: 'user-123' }, tenantId: 'tenant-123' };

  const mockTenantId = 'tenant-1';
  const mockRequirementType = {
    id: 'req-type-1',
    name: 'Test Requirement Type',
    description: 'Test Description',
    isActive: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
    (getDb as jest.Mock).mockResolvedValue(mockDb);
  });

  describe('getRequirementTypesAsOptions', () => {
    it('should throw UserNotFoundErr when no session exists', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(getRequirementTypesAsOptions(mockTenantId)).rejects.toThrow('User not found');
    });

    it('should return requirement types for the given tenant', async () => {
      const mockRequirementTypes = [mockRequirementType];
      (mockDb.requirementType.findMany as jest.Mock).mockResolvedValue(mockRequirementTypes);

      const result = await getRequirementTypesAsOptions(mockTenantId);

      expect(result).toEqual(mockRequirementTypes);
      expect(mockDb.requirementType.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
        },
        where: { tenantId: mockTenantId, isActive: true },
      });
    });
  });

  describe('getRequirementTypeAsFormById', () => {
    it('should throw UserNotFoundErr when no session exists', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(getRequirementTypeAsFormById('req-type-1', mockTenantId)).rejects.toThrow('User not found');
    });

    it('should return requirement type form values for the given id', async () => {
      (mockDb.requirementType.findFirstOrThrow as jest.Mock).mockResolvedValue(mockRequirementType);

      const result = await getRequirementTypeAsFormById('req-type-1', mockTenantId);

      expect(result).toEqual({
        ...mockRequirementType,
        isDefault: false,
        description: mockRequirementType.description,
      });
      expect(mockDb.requirementType.findFirstOrThrow).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
        },
        where: { id: 'req-type-1', tenantId: mockTenantId },
      });
    });

    it('should handle null description', async () => {
      const requirementTypeWithNullDescription = {
        ...mockRequirementType,
        description: null,
      };
      (mockDb.requirementType.findFirstOrThrow as jest.Mock).mockResolvedValue(requirementTypeWithNullDescription);

      const result = await getRequirementTypeAsFormById('req-type-1', mockTenantId);

      expect(result.description).toBe('');
    });
  });

  describe('CreateRequirementType', () => {
    const validData = {
      name: 'New Requirement Type',
      description: 'New Description',
      isActive: true,
    };

    it('should throw error when user is not found', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(CreateRequirementType(validData, mockTenantId)).rejects.toThrow('User not found');
    });

    it('should create requirement type successfully', async () => {
      const mockCreatedRequirementType = {
        id: 'new-req-type-1',
        ...validData,
        tenantId: mockTenantId,
        createdBy: mockSession.user.id,
      };

      (mockDb.requirementType.findFirst as jest.Mock).mockResolvedValue(null);
      (mockDb.requirementType.create as jest.Mock).mockResolvedValue(mockCreatedRequirementType);

      const result = await CreateRequirementType(validData, mockTenantId);

      expect(result).toEqual(mockCreatedRequirementType);
      expect(mockDb.requirementType.findFirst).toHaveBeenCalledWith({
        where: { name: validData.name, tenantId: mockTenantId },
      });
      expect(mockDb.requirementType.create).toHaveBeenCalledWith({
        data: {
          ...validData,
          description: validData.description,
          isActive: validData.isActive,
          tenantId: mockTenantId,
          createdBy: mockSession.user.id,
        },
      });
    });

    it('should throw error when name already exists', async () => {
      (mockDb.requirementType.findFirst as jest.Mock).mockResolvedValue({ id: 'existing-req-type' });

      await expect(CreateRequirementType(validData, mockTenantId)).rejects.toThrow('A requirement type with this name already exists');
    });

    it('should throw error when name is missing', async () => {
      const invalidData = { ...validData, name: '' };

      await expect(CreateRequirementType(invalidData, mockTenantId)).rejects.toThrow('Name is required');
    });

    it('should handle empty description', async () => {
      const dataWithEmptyDescription = { ...validData, description: '' };
      const mockCreatedRequirementType = {
        id: 'new-req-type-1',
        ...dataWithEmptyDescription,
        tenantId: mockTenantId,
        createdBy: mockSession.user.id,
      };

      (mockDb.requirementType.findFirst as jest.Mock).mockResolvedValue(null);
      (mockDb.requirementType.create as jest.Mock).mockResolvedValue(mockCreatedRequirementType);

      await CreateRequirementType(dataWithEmptyDescription, mockTenantId);

      expect(mockDb.requirementType.create).toHaveBeenCalledWith({
        data: {
          ...dataWithEmptyDescription,
          description: '',
          isActive: dataWithEmptyDescription.isActive,
          tenantId: mockTenantId,
          createdBy: mockSession.user.id,
        },
      });
    });
  });

  describe('UpdateRequirementType', () => {
    const validData = {
      name: 'Updated Requirement Type',
      description: 'Updated Description',
      isActive: false,
    };

    it('should throw error when user is not found', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(UpdateRequirementType('req-type-1', validData, mockTenantId)).rejects.toThrow('User not found');
    });

    it('should update requirement type successfully', async () => {
      const mockExistingRequirementType = { id: 'req-type-1', name: 'Old Requirement Type' };
      const mockUpdatedRequirementType = {
        id: 'req-type-1',
        ...validData,
        tenantId: mockTenantId,
        updatedBy: mockSession.user.id,
      };

      (mockDb.requirementType.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockExistingRequirementType) // First call for existence check
        .mockResolvedValueOnce(null); // Second call for duplicate name check
      (mockDb.requirementType.update as jest.Mock).mockResolvedValue(mockUpdatedRequirementType);

      const result = await UpdateRequirementType('req-type-1', validData, mockTenantId);

      expect(result).toEqual(mockUpdatedRequirementType);
      expect(mockDb.requirementType.update).toHaveBeenCalledWith({
        where: { id: 'req-type-1', tenantId: mockTenantId },
        data: {
          ...validData,
          description: validData.description,
          isActive: validData.isActive,
          updatedBy: mockSession.user.id,
        },
      });
    });

    it('should throw error when requirement type not found', async () => {
      (mockDb.requirementType.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(UpdateRequirementType('req-type-1', validData, mockTenantId)).rejects.toThrow('Requirement type not found');
    });

    it('should throw error when name already exists for another requirement type', async () => {
      const mockExistingRequirementType = { id: 'req-type-1', name: 'Old Requirement Type' };
      const mockDuplicateRequirementType = { id: 'other-req-type', name: validData.name };

      (mockDb.requirementType.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockExistingRequirementType) // First call for existence check
        .mockResolvedValueOnce(mockDuplicateRequirementType); // Second call for duplicate name check

      await expect(UpdateRequirementType('req-type-1', validData, mockTenantId)).rejects.toThrow('A requirement type with this name already exists');
    });

    it('should throw error when name is missing', async () => {
      const invalidData = { ...validData, name: '' };

      await expect(UpdateRequirementType('req-type-1', invalidData, mockTenantId)).rejects.toThrow('Name is required');
    });
  });
});
