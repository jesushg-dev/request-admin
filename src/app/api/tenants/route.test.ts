/**
 * @jest-environment node
 */

import { getDb } from '@/server/db-client';

// Mock authentication helper before importing the route so the module picks
// up the mocked implementation during evaluation.
jest.mock('@/lib/api-key-auth', () => ({
  authenticateWithApiKeyOrJWT: jest.fn().mockResolvedValue({ user: { id: 'user123' } }),
}));

const { GET } = require('./route');

// Mock the database
const mockDb = {
  tenant: {
    findMany: jest.fn(),
  },
};

jest.mock('@/server/db-client', () => ({
  getDb: jest.fn(),
  db: {
    tenant: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe('Tenants API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue(mockDb);
    // Ensure the module `db` points to our mockDb tenant implementation
    const dbModule: any = jest.requireMock('@/server/db-client');
    dbModule.db = mockDb;
  });

  it('returns tenants for a valid user ID', async () => {
    // Mock data
    const mockTenants = [{ id: '1' }, { id: '2' }];
    const mockUserId = 'user123';

    // Setup mock response
    (mockDb.tenant.findMany as jest.Mock).mockResolvedValue(mockTenants);

    // Create mock request
    const request = new Request('http://localhost:3000/api/tenants', {
      method: 'POST',
      body: JSON.stringify({ userId: mockUserId }),
    });

    // Call the handler
    const response = await GET(request as any);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(data).toEqual({ data: mockTenants });
    expect(mockDb.tenant.findMany).toHaveBeenCalledWith({
      where: { userTenants: { some: { userId: mockUserId, isActive: true } } },
      select: { id: true, name: true, description: true, logo: true },
      orderBy: { name: 'asc' },
    });
  });

  it('handles database errors gracefully', async () => {
    // Setup mock error
    (mockDb.tenant.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

    // Create mock request
    const request = new Request('http://localhost:3000/api/tenants', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user123' }),
    });

    // Call the handler
    const response = await GET(request as any);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });

  it('handles invalid request body', async () => {
    // Create mock request with invalid body
    const request = new Request('http://localhost:3000/api/tenants', {
      method: 'POST',
      body: JSON.stringify({ invalidField: 'value' }),
    });

    // Call the handler
    const response = await GET(request as any);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });
});
