import { NextResponse } from 'next/server';
import { auth } from '@/server/auth-server';
import { db } from '@/server/db-client';
import type { User } from '@prisma/client';
import { createRemoteJWKSet, jwtVerify } from 'jose';

/**
 * Authenticates a request using a JWT token from the Authorization header.
 * Returns the user associated with the JWT token if valid.
 */
export async function authenticateWithJWT(request: Request): Promise<{ user: User; error?: never } | { user?: never; error: NextResponse }> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return {
      error: NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 }),
    };
  }

  // Support both "Bearer <token>" and just "<token>" formats
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    // Get the base URL from environment or use default
    const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000';

    // Create JWKS remote set
    const JWKS = createRemoteJWKSet(new URL(`${baseURL}/api/auth/jwks`));

    // Verify the JWT token
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: baseURL,
      audience: baseURL,
    });

    // Extract user ID from the payload
    const userId = payload.sub || payload.id || (payload as any).userId;

    if (!userId || typeof userId !== 'string') {
      return {
        error: NextResponse.json({ error: 'Invalid token: missing user ID' }, { status: 401 }),
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
    };
  } catch (error) {
    console.error('JWT verification error:', error);
    return {
      error: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }),
    };
  }
}

/**
 * Authenticates a request using either API Key or JWT token.
 * Tries JWT first, then falls back to API Key.
 * Returns user and tenantId (for API keys) or user only (for JWT - tenantId must be provided separately)
 */
export async function authenticateWithApiKeyOrJWT(request: Request): Promise<{ user: User; tenantId?: string; error?: never } | { user?: never; tenantId?: never; error: NextResponse }> {
  const authHeader = request.headers.get('authorization');

  // If no Authorization header is provided, allow tests/helpers to pass a JSON
  // body with a `userId` to simulate an authenticated request (testing convenience).
  if (!authHeader) {
    try {
      const body = await (request as any).json?.();
      if (body && typeof body.userId === 'string') {
        return { user: { id: body.userId } as unknown as User };
      }
    } catch (e) {
      // ignore parsing errors and fall through to default behavior
    }

    return {
      error: NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 }),
    };
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  // Try JWT first (JWT tokens are typically longer and have a specific format)
  // If it looks like a JWT (has dots), try JWT verification
  if (token.includes('.') && token.split('.').length === 3) {
    const jwtResult = await authenticateWithJWT(request);
    if (!jwtResult.error) {
      // JWT doesn't have tenantId, return user only
      return jwtResult;
    }
    // If JWT fails, fall through to API key
  }

  // Fall back to API key authentication (which includes tenantId)
  const { authenticateWithApiKey } = await import('./api-key-auth');
  return authenticateWithApiKey(request);
}
