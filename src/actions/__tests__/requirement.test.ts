// Import after mocks
import { currentSession, requireUser } from '@/server/auth-server';
import { getDb } from '@/server/db-client';

import { UserNotFoundErr } from '@/lib/error';

import { getRequirementAsFormById, getRequirementsAsOptions } from '../requirement';

// Mock the dependencies
jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn(),
  requireUser: jest.fn(),
}));

const mockDb = {
  requirement: {
    findMany: jest.fn(),
    findFirstOrThrow: jest.fn(),
  },
};

jest.mock('@/server/db-client', () => ({
  getDb: jest.fn(),
}));

describe('Requirement Actions', () => {
  const mockSession = {
    user: { id: 'user-1' },
  };

  const mockTenantId = 'tenant-1';

  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
    (requireUser as jest.Mock).mockImplementation(async () => {
      const s = await (currentSession as any)();
      return s?.user ?? s;
    });
    (getDb as jest.Mock).mockResolvedValue(mockDb);
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

      (mockDb.requirement.findMany as jest.Mock).mockResolvedValue(mockRequirements);

      const result = await getRequirementsAsOptions(mockTenantId);

      expect(result).toEqual([
        { value: 'req-1', label: 'Requirement 1' },
        { value: 'req-2', label: 'Requirement 2' },
      ]);
      expect(mockDb.requirement.findMany).toHaveBeenCalledWith({
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
      (mockDb.requirement.findFirstOrThrow as jest.Mock).mockResolvedValue(mockRequirement);

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

      expect(mockDb.requirement.findFirstOrThrow).toHaveBeenCalledWith({
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

      (mockDb.requirement.findFirstOrThrow as jest.Mock).mockResolvedValue(requirementWithNullDescription);

      const result = await getRequirementAsFormById(mockRequirementId, mockTenantId);

      expect(result.description).toBe('');
    });
  });
});
