'use server';

import { normalizeNumber, normalizeRecord, resolveExpiresInSeconds } from '@/constants/api-key';
import { auth, requireUser } from '@/server/auth-server';
import type { TApiKeyFormSchema } from '@/services/schemas/settings/api-key.schema';

type CreateApiKeyInput = TApiKeyFormSchema & { tenantId?: string };

export async function createApiKeyAction(values: CreateApiKeyInput) {
  console.log('createApiKeyAction', values);
  const user = await requireUser();
  const { db } = await import('@/server/db-client');
  const { validateTenantAccess } = await import('@/lib/api-key-auth');

  // Security: Validate tenantId if provided
  if (values.tenantId) {
    // If user is not global admin, they can only create API keys for tenants they belong to
    if (!user.isGlobalAdmin) {
      // Verify user has active access to the tenant
      const hasAccess = await validateTenantAccess(user.id, values.tenantId);
      if (!hasAccess) {
        throw new Error('Unauthorized: You do not have access to this tenant');
      }

      // Additional validation: ensure the tenant exists and user relationship is active
      const userTenant = await db.userTenant.findUnique({
        where: {
          userId_tenantId: {
            userId: user.id,
            tenantId: values.tenantId,
          },
        },
        select: {
          isActive: true,
        },
      });

      if (!userTenant || !userTenant.isActive) {
        throw new Error('Unauthorized: You do not have active access to this tenant');
      }
    }
    // Global admins can create API keys for any tenant (no validation needed)
  }

  const expiresIn = values.expiresIn === 'never' ? undefined : resolveExpiresInSeconds(values.expiresIn);

  // tenantId MUST be in metadata, not as a direct field
  // This ensures it's immutable and secure
  // Security: Ensure tenantId cannot be overridden from metadata input
  const baseMetadata = values.metadata || {};
  // Remove tenantId from user-provided metadata if present (security)
  const cleanMetadata = { ...baseMetadata };
  if ('tenantId' in cleanMetadata) {
    delete cleanMetadata.tenantId;
  }

  const metadata = {
    ...cleanMetadata,
    // tenantId is always stored in metadata and cannot be changed after creation
    // Only use the validated tenantId from the input, not from metadata
    ...(values.tenantId ? { tenantId: values.tenantId } : {}),
  };

  const payload = {
    name: values.name,
    prefix: values.prefix,
    metadata: normalizeRecord(metadata),
    expiresIn,
    rateLimitEnabled: values.rateLimitEnabled,
    rateLimitMax: values.rateLimitEnabled ? normalizeNumber(values.rateLimitMax) : undefined,
    rateLimitTimeWindow: values.rateLimitEnabled ? normalizeNumber(values.rateLimitTimeWindow) : undefined,
    remaining: normalizeNumber(values.remaining),
    refillAmount: normalizeNumber(values.refillAmount),
    refillInterval: normalizeNumber(values.refillInterval),
    userId: user.id,
  };

  try {
    const apiKey = await auth.api.createApiKey({
      body: payload,
    });

    return apiKey;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Unable to create API key');
  }
}

type VerifyApiKeyInput = {
  key: string;
  permissions?: Record<string, string[]>;
};

export async function verifyApiKeyAction(values: VerifyApiKeyInput) {
  try {
    const verification = await auth.api.verifyApiKey({
      body: {
        key: values.key,
        permissions: values.permissions,
      },
    });

    return verification;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Unable to verify API key');
  }
}

type UpdateApiKeyInput = {
  keyId: string;
  name?: string;
  enabled?: boolean;
  rateLimitEnabled?: boolean;
  rateLimitMax?: number;
  rateLimitTimeWindow?: number;
  remaining?: number;
  refillAmount?: number;
  refillInterval?: number;
  metadata?: Record<string, unknown> | null;
};

export async function updateApiKeyAction(values: UpdateApiKeyInput) {
  const user = await requireUser();
  const { db } = await import('@/server/db-client');

  // Get existing API key to protect tenantId in metadata
  const existingApiKey = await db.apikey.findUnique({
    where: { id: values.keyId },
    select: { metadata: true, userId: true },
  });

  if (!existingApiKey) {
    throw new Error('API key not found');
  }

  // Verify ownership (unless global admin)
  if (!user.isGlobalAdmin && existingApiKey.userId !== user.id) {
    throw new Error('Unauthorized: You can only update your own API keys');
  }

  // Parse existing metadata to preserve tenantId
  let existingMetadata: Record<string, unknown> = {};
  try {
    if (existingApiKey.metadata) {
      existingMetadata = typeof existingApiKey.metadata === 'string' ? JSON.parse(existingApiKey.metadata) : existingApiKey.metadata;
    }
  } catch {
    // If metadata is invalid JSON, start fresh but preserve tenantId if it exists
    existingMetadata = {};
  }

  // Extract and preserve tenantId from existing metadata
  const existingTenantId = existingMetadata.tenantId;

  // Prepare new metadata
  let newMetadata: Record<string, unknown> = {};
  if (values.metadata !== undefined) {
    newMetadata = typeof values.metadata === 'string' ? JSON.parse(values.metadata) : values.metadata;
  } else {
    // If metadata is not being updated, use existing
    newMetadata = existingMetadata;
  }

  // Security: tenantId in metadata is IMMUTABLE unless user is global admin
  if (existingTenantId) {
    if (user.isGlobalAdmin) {
      // Global admin can modify tenantId, but we should validate the new tenant exists
      if (newMetadata.tenantId && newMetadata.tenantId !== existingTenantId) {
        // Validate that the new tenant exists
        const { validateTenantAccess } = await import('@/lib/api-key-auth');
        const tenantExists = await db.tenant.findUnique({
          where: { id: newMetadata.tenantId as string },
          select: { id: true },
        });
        if (!tenantExists) {
          throw new Error('Invalid tenant: The specified tenant does not exist');
        }
        // Allow change for global admin
      }
    } else {
      // Non-admin users CANNOT modify tenantId - it's locked
      if (newMetadata.tenantId && newMetadata.tenantId !== existingTenantId) {
        throw new Error('Security: tenantId in metadata cannot be modified after creation');
      }
      // Ensure tenantId is preserved
      newMetadata.tenantId = existingTenantId;
    }
  } else if (newMetadata.tenantId && !user.isGlobalAdmin) {
    // If there was no existing tenantId but user is trying to add one, validate access
    const { validateTenantAccess } = await import('@/lib/api-key-auth');
    const hasAccess = await validateTenantAccess(user.id, newMetadata.tenantId as string);
    if (!hasAccess) {
      throw new Error('Unauthorized: You do not have access to this tenant');
    }
  }

  const payload = {
    keyId: values.keyId,
    userId: user.id,
    ...(values.name !== undefined && { name: values.name }),
    ...(values.enabled !== undefined && { enabled: values.enabled }),
    ...(values.rateLimitEnabled !== undefined && { rateLimitEnabled: values.rateLimitEnabled }),
    ...(values.rateLimitMax !== undefined && { rateLimitMax: normalizeNumber(values.rateLimitMax) }),
    ...(values.rateLimitTimeWindow !== undefined && { rateLimitTimeWindow: normalizeNumber(values.rateLimitTimeWindow) }),
    ...(values.remaining !== undefined && { remaining: normalizeNumber(values.remaining) }),
    ...(values.refillAmount !== undefined && { refillAmount: normalizeNumber(values.refillAmount) }),
    ...(values.refillInterval !== undefined && { refillInterval: normalizeNumber(values.refillInterval) }),
    ...(values.metadata !== undefined && { metadata: normalizeRecord(newMetadata) }),
  };

  try {
    const apiKey = await auth.api.updateApiKey({
      body: payload,
    } as any);

    return apiKey;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Unable to update API key');
  }
}
