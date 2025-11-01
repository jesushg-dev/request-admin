import { getDb } from '@/server/db-client';

import { getDashboardAssignmentTrends, getDashboardRequestCounts, getDashboardRequestTrends } from '../dashboard';

// Mock the database client
const mockDb = {
  requestAssignment: {
    groupBy: jest.fn(),
    findMany: jest.fn(),
  },
  request: {
    count: jest.fn(),
  },
};

jest.mock('@/server/db-client', () => ({
  getDb: jest.fn(),
}));

describe('Dashboard Actions', () => {
  const mockTenantId = 'test-tenant-id';

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue(mockDb);
  });

  describe('getDashboardRequestTrends', () => {
    it('should return request trends for the last 30 days', async () => {
      const mockTrends = [
        { createdAt: new Date('2024-01-01'), _count: { id: 5 } },
        { createdAt: new Date('2024-01-02'), _count: { id: 3 } },
      ];

      (mockDb.requestAssignment.groupBy as jest.Mock).mockResolvedValue(mockTrends);

      const result = await getDashboardRequestTrends(mockTenantId);

      expect(result).toEqual([
        { date: '2024-01-01', count: 5 },
        { date: '2024-01-02', count: 3 },
      ]);

      expect(mockDb.requestAssignment.groupBy).toHaveBeenCalledWith({
        by: ['createdAt'],
        where: {
          tenantId: mockTenantId,
          createdAt: expect.any(Object),
        },
        _count: {
          id: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
    });
  });

  describe('getDashboardRequestCounts', () => {
    it('should return correct request counts and average resolution time', async () => {
      const mockTotalRequests = 100;
      const mockOpenRequests = 30;
      const mockOverdueRequests = 10;
      const mockResolvedRequests = [
        { slaStart: new Date('2024-01-01T10:00:00'), slaEnd: new Date('2024-01-01T12:00:00') },
        { slaStart: new Date('2024-01-02T10:00:00'), slaEnd: new Date('2024-01-02T14:00:00') },
      ];

      (mockDb.request.count as jest.Mock).mockResolvedValueOnce(mockTotalRequests).mockResolvedValueOnce(mockOpenRequests).mockResolvedValueOnce(mockOverdueRequests);
      (mockDb.requestAssignment.findMany as jest.Mock).mockResolvedValue(mockResolvedRequests);

      const result = await getDashboardRequestCounts(mockTenantId);

      expect(result).toEqual({
        totalRequests: mockTotalRequests,
        openRequests: mockOpenRequests,
        overdueRequests: mockOverdueRequests,
        avgResolutionTime: 3, // Average of 2 and 4 hours
      });
    });

    it('should return N/A for average resolution time when no resolved requests', async () => {
      (mockDb.request.count as jest.Mock).mockResolvedValueOnce(0).mockResolvedValueOnce(0).mockResolvedValueOnce(0);
      (mockDb.requestAssignment.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getDashboardRequestCounts(mockTenantId);

      expect(result.avgResolutionTime).toBe('N/A');
    });
  });

  describe('getDashboardAssignmentTrends', () => {
    it('should return assignment trends for the specified time range', async () => {
      const mockAssignments = [
        {
          assignmentDate: new Date('2024-01-01'),
          assignedUsers: [{ id: 1 }, { id: 2 }],
        },
        {
          assignmentDate: new Date('2024-01-01'),
          assignedUsers: [{ id: 3 }],
        },
      ];

      (mockDb.requestAssignment.findMany as jest.Mock).mockResolvedValue(mockAssignments);

      const result = await getDashboardAssignmentTrends(mockTenantId, '7d');

      expect(result).toEqual([{ date: '2024-01-01', user: 3, area: 2 }]);
    });

    it('should use default 90 days when no time range is specified', async () => {
      await getDashboardAssignmentTrends(mockTenantId);

      expect(mockDb.requestAssignment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            assignmentDate: expect.any(Object),
          }),
        })
      );
    });
  });
});
