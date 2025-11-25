'use server';

import { resolveExpiresInSeconds, normalizeNumber, normalizeRecord } from '@/constants/api-key';
import { auth, requireUser } from '@/server/auth-server';
import type { TApiKeyFormSchema } from '@/services/schemas/settings/api-key.schema';

type CreateApiKeyInput = TApiKeyFormSchema;

export async function createApiKeyAction(values: CreateApiKeyInput) {
  console.log('createApiKeyAction', values);
  const user = await requireUser();

  const expiresIn = values.expiresIn === 'never' ? undefined : resolveExpiresInSeconds(values.expiresIn);

  const payload = {
    name: values.name,
    prefix: values.prefix,
    metadata: normalizeRecord(values.metadata),
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
    ...(values.metadata !== undefined && { metadata: normalizeRecord(values.metadata) }),
  };

  try {
    const apiKey = await auth.api.updateApiKey({
      body: payload as Parameters<typeof auth.api.updateApiKey>[0]['body'],
    });

    return apiKey;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Unable to update API key');
  }
}

