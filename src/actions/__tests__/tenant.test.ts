// Import after mocks
import { redirect } from '@/i18n/routing';
import { currentSession } from '@/server/auth-server';
import { getDb } from '@/server/db-client';

import { getTenantIdFromUrl, getTenantInformation } from '../tenant';

// Mock external dependencies
jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn(),
}));

const mockDb = {
  tenant: {
    findFirst: jest.fn(),
  },
};

jest.mock('@/server/db-client', () => ({
  getDb: jest.fn(),
}));

jest.mock('@/i18n/routing', () => ({
  redirect: jest.fn(),
  locales: ['en', 'es'],
}));

describe('Tenant Actions', () => {
  const mockSession = { user: { id: 'user-123' }, tenantId: 'tenant-123' };
  const mockTenantId = 'tenant-1';

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue(mockDb);
  });

  const mockTenant = {
    name: 'Test Tenant',
    slug: 'test-tenant',
    logo: 'logo-url',
    websiteUrl: 'https://test.com',
    title: 'Test Title',
    description: 'Test Description',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    contactEmail: 'test@test.com',
    contactPhone: '123456789',
    address: 'Test Address',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('getTenantIdFromUrl', () => {
    it('should extract tenant ID from URL', async () => {
      const url = '/en/admin/123e4567-e89b-12d3-a456-426614174000';
      const result = await getTenantIdFromUrl(url, false);
      expect(result).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should return empty string when no tenant ID in URL', async () => {
      const url = 'https://example.com';
      const result = await getTenantIdFromUrl(url, false);
      expect(result).toBe('');
    });

    it('should redirect when no tenant ID and redirectOnMissing is true', async () => {
      const url = 'https://example.com';
      await getTenantIdFromUrl(url, true);
      expect(redirect).toHaveBeenCalledWith({
        href: '/admin',
        locale: 'en',
      });
    });
  });

  describe('getTenantInformation', () => {
    it('should throw UserNotFoundErr when no session exists', async () => {
      (currentSession as jest.Mock).mockResolvedValue(null);

      await expect(getTenantInformation(mockTenantId)).rejects.toThrow('User not found');
    });

    it('should return tenant information', async () => {
      (mockDb.tenant.findFirst as jest.Mock).mockResolvedValue(mockTenant);

      const result = await getTenantInformation(mockTenantId);

      expect(result).toEqual({
        ...mockTenant,
        slug: mockTenant.slug,
        logo: mockTenant.logo,
        websiteUrl: mockTenant.websiteUrl,
        title: mockTenant.title,
        description: mockTenant.description,
        primaryColor: mockTenant.primaryColor,
        secondaryColor: mockTenant.secondaryColor,
        contactEmail: mockTenant.contactEmail,
        contactPhone: mockTenant.contactPhone,
        address: mockTenant.address,
      });

      expect(mockDb.tenant.findFirst).toHaveBeenCalledWith({
        where: { id: mockTenantId },
        select: {
          name: true,
          slug: true,
          logo: true,
          websiteUrl: true,
          title: true,
          description: true,
          primaryColor: true,
          secondaryColor: true,
          contactEmail: true,
          contactPhone: true,
          address: true,
        },
      });
    });

    it('should handle null fields', async () => {
      const tenantWithNullFields = {
        name: 'Test Tenant',
        slug: null,
        logo: null,
        websiteUrl: null,
        title: null,
        description: null,
        primaryColor: null,
        secondaryColor: null,
        contactEmail: null,
        contactPhone: null,
        address: null,
      };

      (mockDb.tenant.findFirst as jest.Mock).mockResolvedValue(tenantWithNullFields);

      const result = await getTenantInformation(mockTenantId);

      expect(result).toEqual({
        ...tenantWithNullFields,
        slug: '',
        logo: undefined,
        websiteUrl: undefined,
        title: undefined,
        description: undefined,
        primaryColor: undefined,
        secondaryColor: undefined,
        contactEmail: undefined,
        contactPhone: undefined,
        address: undefined,
      });
    });

    it('should throw error when tenant not found', async () => {
      (mockDb.tenant.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(getTenantInformation(mockTenantId)).rejects.toThrow('Tenant not found');
    });
  });
});
