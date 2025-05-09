/**
 * @jest-environment node
 */

import { db } from '@/server/db-client';

import { POST } from './route';

// Mock the database
jest.mock('@/server/db-client', () => ({
  db: {
    tenant: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Tenant Validation API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns true for valid tenant ID', async () => {
    // Mock data
    const mockTenant = { id: 'tenant123', name: 'Test Tenant' };
    const mockTenantId = 'tenant123';

    // Setup mock response
    (db.tenant.findUnique as jest.Mock).mockResolvedValue(mockTenant);

    // Create mock request
    const request = new Request('http://localhost:3000/api/tenants/validate', {
      method: 'POST',
      body: JSON.stringify({ tenantId: mockTenantId }),
    });

    // Call the handler
    const response = await POST(request);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(data).toEqual({ isValid: true });
    expect(db.tenant.findUnique).toHaveBeenCalledWith({
      where: { id: mockTenantId },
    });
  });

  it('returns false for invalid tenant ID', async () => {
    // Setup mock response
    (db.tenant.findUnique as jest.Mock).mockResolvedValue(null);

    // Create mock request
    const request = new Request('http://localhost:3000/api/tenants/validate', {
      method: 'POST',
      body: JSON.stringify({ tenantId: 'invalid-id' }),
    });

    // Call the handler
    const response = await POST(request);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(data).toEqual({ isValid: false });
  });

  it('returns 400 when tenant ID is missing', async () => {
    // Create mock request without tenantId
    const request = new Request('http://localhost:3000/api/tenants/validate', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    // Call the handler
    const response = await POST(request);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Tenant ID is required' });
    expect(db.tenant.findUnique).not.toHaveBeenCalled();
  });

  it('handles database errors gracefully', async () => {
    // Setup mock error
    (db.tenant.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

    // Create mock request
    const request = new Request('http://localhost:3000/api/tenants/validate', {
      method: 'POST',
      body: JSON.stringify({ tenantId: 'tenant123' }),
    });

    // Call the handler
    const response = await POST(request);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });
});
