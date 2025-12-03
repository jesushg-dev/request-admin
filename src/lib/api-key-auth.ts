import { NextResponse } from 'next/server';
import { auth } from '@/server/auth-server';
import { db } from '@/server/db-client';
import type { User } from '@prisma/client';

// Re-export for convenience
export { authenticateWithJWT, authenticateWithApiKeyOrJWT } from './jwt-auth';

/**
 * Authenticates a request using an API key from the Authorization header.
 * Returns the user and tenantId associated with the API key if valid.
 */
export async function authenticateWithApiKey(request: Request): Promise<{ user: User; tenantId: string; error?: never } | { user?: never; tenantId?: never; error: NextResponse }> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return {
      error: NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 }),
    };
  }

  // Support both "Bearer <key>" and just "<key>" formats
  const apiKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    // verifyApiKey doesn't need headers, just the key
    const verification = await auth.api.verifyApiKey({
      body: {
        key: apiKey,
      },
    });

    if (!verification || !verification.valid || !verification.key) {
      return {
        error: NextResponse.json({ error: 'Invalid API key' }, { status: 401 }),
      };
    }

    const apiKeyRecord = verification.key;
    const userId = apiKeyRecord.userId;

    if (!userId) {
      return {
        error: NextResponse.json({ error: 'API key has no associated user' }, { status: 401 }),
      };
    }

    // Additional checks
    if (apiKeyRecord.enabled === false) {
      return {
        error: NextResponse.json({ error: 'API key is disabled' }, { status: 401 }),
      };
    }

    if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
      return {
        error: NextResponse.json({ error: 'API key has expired' }, { status: 401 }),
      };
    }

    // Get full API key record from database to access tenantId
    const fullApiKey = await db.apikey.findUnique({
      where: {
        id: apiKeyRecord.id,
      },
      select: {
        tenantId: true,
      },
    });

    if (!fullApiKey || !fullApiKey.tenantId) {
      return {
        error: NextResponse.json({ error: 'API key is not associated with a tenant' }, { status: 401 }),
      };
    }

    // Get full user object from database
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return {
        error: NextResponse.json({ error: 'User not found' }, { status: 401 }),
      };
    }

    return {
      user,
      tenantId: fullApiKey.tenantId,
    };
  } catch (error) {
    return {
      error: NextResponse.json({ error: 'Invalid API key' }, { status: 401 }),
    };
  }
}

/**
 * Validates that a user has access to a specific tenant.
 */
export async function validateTenantAccess(userId: string, tenantId: string): Promise<boolean> {
  const userTenant = await db.userTenant.findFirst({
    where: {
      userId,
      tenantId,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  return !!userTenant;
}

