// Import after mocks
import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-client';

import { getRequirementAsFormById, getRequirementsAsOptions, UserNotFoundErr } from '../requirement';

// Mock the dependencies
jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn(),
}));

jest.mock('@/server/db-client', () => ({
  db: {
    requirement: {
      findMany: jest.fn(),
      findFirstOrThrow: jest.fn(),
    },
  },
}));

describe('Requirement Actions', () => {
  const mockSession = {
    user: { id: 'user-1' },
  };

  const mockTenantId = 'tenant-1';

  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('getRequirementsAsOptions', () => {
    it('should throw UserNotFoundErr when no session exists', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(getRequirementsAsOptions(mockTenantId)).rejects.toThrow(UserNotFoundErr);
    });

    it('should return formatted requirements as options', async () => {
      const mockRequirements = [
        { id: 'req-1', name: 'Requirement 1' },
        { id: 'req-2', name: 'Requirement 2' },
      ];

      (db.requirement.findMany as jest.Mock).mockResolvedValue(mockRequirements);

      const result = await getRequirementsAsOptions(mockTenantId);

      expect(result).toEqual([
        { value: 'req-1', label: 'Requirement 1' },
        { value: 'req-2', label: 'Requirement 2' },
      ]);
      expect(db.requirement.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
        },
        where: { tenantId: mockTenantId },
      });
    });
  });

  describe('getRequirementAsFormById', () => {
    const mockRequirementId = 'req-1';
    const mockRequirement = {
      id: mockRequirementId,
      name: 'Test Requirement',
      description: 'Test Description',
      requirementTypeId: 'type-1',
      isRequiredOnlyOnce: true,
      isActive: true,
      requirementType: {
        id: 'type-1',
        name: 'Test Type',
      },
    };

    it('should throw UserNotFoundErr when no session exists', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(getRequirementAsFormById(mockRequirementId, mockTenantId)).rejects.toThrow(UserNotFoundErr);
    });

    it('should return formatted requirement as form values', async () => {
      (db.requirement.findFirstOrThrow as jest.Mock).mockResolvedValue(mockRequirement);

      const result = await getRequirementAsFormById(mockRequirementId, mockTenantId);

      expect(result).toEqual({
        id: mockRequirementId,
        name: 'Test Requirement',
        description: 'Test Description',
        requirementTypeId: 'type-1',
        isRequiredOnlyOnce: true,
        isActive: true,
        requirementType: {
          label: 'Test Type',
          value: 'type-1',
        },
      });

      expect(db.requirement.findFirstOrThrow).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
          requirementTypeId: true,
          isRequiredOnlyOnce: true,
          isActive: true,
          requirementType: { select: { id: true, name: true } },
        },
        where: { id: mockRequirementId, tenantId: mockTenantId },
      });
    });

    it('should handle null description', async () => {
      const requirementWithNullDescription = {
        ...mockRequirement,
        description: null,
      };

      (db.requirement.findFirstOrThrow as jest.Mock).mockResolvedValue(requirementWithNullDescription);

      const result = await getRequirementAsFormById(mockRequirementId, mockTenantId);

      expect(result.description).toBe('');
    });
  });
});
