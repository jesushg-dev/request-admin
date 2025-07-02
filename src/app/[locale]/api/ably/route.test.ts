/**
 * @jest-environment node
 */

import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-server';
import * as Ably from 'ably';

import { POST } from './route';

// Mock external dependencies
jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn(),
}));

jest.mock('@/server/db-server', () => ({
  db: {
    userTenant: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('ably', () => ({
  Rest: jest.fn(),
}));

describe('Ably API', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      isGlobalAdmin: false,
    },
  };

  const mockUserTenant = {
    id: 'user-tenant-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
    (db.userTenant.findUnique as jest.Mock).mockResolvedValue(mockUserTenant);

    // Mock environment variables
    process.env.ABLY_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.ABLY_API_KEY;
  });

  describe('POST /api/ably', () => {
    it('should return Ably token for valid user tenant', async () => {
      const mockTokenRequest = {
        keyName: 'test-key',
        timestamp: Date.now(),
        nonce: 'test-nonce',
        capability: JSON.stringify({
          'chat:general': ['publish', 'subscribe', 'presence'],
          'chat:announcements': ['subscribe'],
          notifications: ['subscribe'],
        }),
      };

      const mockRest = {
        auth: {
          createTokenRequest: jest.fn().mockResolvedValue(mockTokenRequest),
        },
      };

      (Ably.Rest as unknown as jest.Mock).mockImplementation(() => mockRest);

      const formData = new FormData();
      formData.append('clientId', 'user-tenant-123');

      const request = new Request('http://localhost:3000/api/ably', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockTokenRequest);

      expect(db.userTenant.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'user-tenant-123',
          userId: 'user-123',
        },
        select: { id: true },
      });
    });

    it('should return 500 when ABLY_API_KEY is missing', async () => {
      delete process.env.ABLY_API_KEY;

      const formData = new FormData();
      formData.append('clientId', 'user-tenant-123');

      const request = new Request('http://localhost:3000/api/ably', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'ABLY_API_KEY environment variable is missing. Check your configuration.',
      });
    });

    it('should return 401 when no session exists', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      const formData = new FormData();
      formData.append('clientId', 'user-tenant-123');

      const request = new Request('http://localhost:3000/api/ably', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: 'Authentication required. Please log in.',
      });
    });

    it('should return 400 when clientId is missing', async () => {
      const request = new Request('http://localhost:3000/api/ably', {
        method: 'POST',
        body: new FormData(),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'clientId is required in form data',
      });
    });

    it('should return 403 when user tenant association not found', async () => {
      (db.userTenant.findUnique as jest.Mock).mockResolvedValue(null);

      const formData = new FormData();
      formData.append('clientId', 'invalid-user-tenant');

      const request = new Request('http://localhost:3000/api/ably', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({
        error: 'Invalid clientId: UserTenant association not found',
      });
    });

    it('should provide full capabilities for global admin', async () => {
      const adminSession = {
        user: {
          id: 'user-123',
          isGlobalAdmin: true,
        },
      };

      (currentSession as jest.Mock).mockResolvedValue(adminSession);

      const mockTokenRequest = {
        keyName: 'test-key',
        timestamp: Date.now(),
        nonce: 'test-nonce',
        capability: JSON.stringify({ '*': ['*'] }),
      };

      const mockRest = {
        auth: {
          createTokenRequest: jest.fn().mockResolvedValue(mockTokenRequest),
        },
      };

      (Ably.Rest as unknown as jest.Mock).mockImplementation(() => mockRest);

      const formData = new FormData();
      formData.append('clientId', 'user-tenant-123');

      const request = new Request('http://localhost:3000/api/ably', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.capability).toEqual(JSON.stringify({ '*': ['*'] }));
    });

    it('should handle Ably token creation errors', async () => {
      const mockRest = {
        auth: {
          createTokenRequest: jest.fn().mockRejectedValue(new Error('Ably error')),
        },
      };

      (Ably.Rest as unknown as jest.Mock).mockImplementation(() => mockRest);

      const formData = new FormData();
      formData.append('clientId', 'user-tenant-123');

      const request = new Request('http://localhost:3000/api/ably', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to generate Ably token. Please try again later.',
      });
    });
  });
});
