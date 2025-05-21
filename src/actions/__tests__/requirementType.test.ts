// Import after mocks
import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-client';

import { getRequirementTypeAsFormById, getRequirementTypesAsOptions } from '../requirementType';

// Mock external dependencies
jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn(),
}));

jest.mock('@/server/db-client', () => ({
  db: {
    requirementType: {
      findMany: jest.fn(),
      findFirstOrThrow: jest.fn(),
    },
  },
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
  });

  describe('getRequirementTypesAsOptions', () => {
    it('should throw UserNotFoundErr when no session exists', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(getRequirementTypesAsOptions(mockTenantId)).rejects.toThrow('User not found');
    });

    it('should return requirement types for the given tenant', async () => {
      const mockRequirementTypes = [mockRequirementType];
      (db.requirementType.findMany as jest.Mock).mockResolvedValue(mockRequirementTypes);

      const result = await getRequirementTypesAsOptions(mockTenantId);

      expect(result).toEqual(mockRequirementTypes);
      expect(db.requirementType.findMany).toHaveBeenCalledWith({
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
      (db.requirementType.findFirstOrThrow as jest.Mock).mockResolvedValue(mockRequirementType);

      const result = await getRequirementTypeAsFormById('req-type-1', mockTenantId);

      expect(result).toEqual({
        ...mockRequirementType,
        isDefault: false,
        description: mockRequirementType.description,
      });
      expect(db.requirementType.findFirstOrThrow).toHaveBeenCalledWith({
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
      (db.requirementType.findFirstOrThrow as jest.Mock).mockResolvedValue(requirementTypeWithNullDescription);

      const result = await getRequirementTypeAsFormById('req-type-1', mockTenantId);

      expect(result.description).toBe('');
    });
  });
});
