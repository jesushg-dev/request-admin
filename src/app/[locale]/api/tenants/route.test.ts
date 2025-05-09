/**
 * @jest-environment node
 */

import { db } from '@/server/db-server';

import { POST } from './route';

// Mock the database
jest.mock('@/server/db-server', () => ({
  db: {
    tenant: {
      findMany: jest.fn(),
    },
  },
}));

describe('Tenants API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns tenants for a valid user ID', async () => {
    // Mock data
    const mockTenants = [{ id: '1' }, { id: '2' }];
    const mockUserId = 'user123';

    // Setup mock response
    (db.tenant.findMany as jest.Mock).mockResolvedValue(mockTenants);

    // Create mock request
    const request = new Request('http://localhost:3000/api/tenants', {
      method: 'POST',
      body: JSON.stringify({ userId: mockUserId }),
    });

    // Call the handler
    const response = await POST(request);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(data).toEqual({ tenants: mockTenants });
    expect(db.tenant.findMany).toHaveBeenCalledWith({
      select: { id: true },
      where: { userTenants: { some: { userId: mockUserId } } },
    });
  });

  it('handles database errors gracefully', async () => {
    // Setup mock error
    (db.tenant.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

    // Create mock request
    const request = new Request('http://localhost:3000/api/tenants', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user123' }),
    });

    // Call the handler
    const response = await POST(request);
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
    const response = await POST(request);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });
});
