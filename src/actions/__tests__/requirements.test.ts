import { db } from '@/server/db-client';

import { updateRequirementCompliance } from '../requirements';

// Mock the database client
jest.mock('@/server/db-client', () => ({
  db: {
    $transaction: jest.fn(),
  },
}));

describe('updateRequirementCompliance', () => {
  const mockRequestId = 'request-123';
  const mockTenantId = 'tenant-123';
  const mockCompliances = {
    'req-1': true,
    'req-2': false,
  };

  const mockExistingRequirements = [{ id: 'req-1' }, { id: 'req-2' }];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully update requirement compliances', async () => {
    // Mock the transaction implementation
    const mockTransaction = jest.fn().mockImplementation(async (callback) => {
      const mockTx = {
        requirement: {
          findMany: jest.fn().mockResolvedValue(mockExistingRequirements),
        },
        requirementComplianceTracking: {
          upsert: jest.fn().mockResolvedValue({}),
        },
      };
      return callback(mockTx);
    });

    (db.$transaction as jest.Mock).mockImplementation(mockTransaction);

    const result = await updateRequirementCompliance(mockRequestId, mockTenantId, mockCompliances);

    expect(result).toEqual({ success: true });
    expect(db.$transaction).toHaveBeenCalledTimes(1);
  });

  it('should handle errors and return error response', async () => {
    // Mock the transaction to throw an error
    (db.$transaction as jest.Mock).mockRejectedValue(new Error('Database error'));

    const result = await updateRequirementCompliance(mockRequestId, mockTenantId, mockCompliances);

    expect(result).toEqual({ error: 'Failed to update requirements' });
    expect(db.$transaction).toHaveBeenCalledTimes(1);
  });

  it('should call upsert for each existing requirement', async () => {
    const mockUpsert = jest.fn().mockResolvedValue({});
    const mockTransaction = jest.fn().mockImplementation(async (callback) => {
      const mockTx = {
        requirement: {
          findMany: jest.fn().mockResolvedValue(mockExistingRequirements),
        },
        requirementComplianceTracking: {
          upsert: mockUpsert,
        },
      };
      return callback(mockTx);
    });

    (db.$transaction as jest.Mock).mockImplementation(mockTransaction);

    await updateRequirementCompliance(mockRequestId, mockTenantId, mockCompliances);

    expect(mockUpsert).toHaveBeenCalledTimes(2);
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { unique_compliance_tracking: { tenantId: mockTenantId, requestId: mockRequestId, requirementId: 'req-1' } },
      update: { isFulfilled: true },
      create: {
        tenantId: mockTenantId,
        requestId: mockRequestId,
        requirementId: 'req-1',
        isFulfilled: true,
      },
    });
  });
});
