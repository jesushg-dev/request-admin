'use server';

import crypto from 'crypto';
import { cookies } from 'next/headers';
import { db } from '@/server/db-client';

const SESSION_COOKIE_NAME = 'link-access-session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Clean up expired sessions periodically (runs every hour)
if (typeof setInterval !== 'undefined') {
  setInterval(
    async () => {
      try {
        const now = new Date();
        await db.linkAccessSession.deleteMany({
          where: {
            expiresAt: {
              lt: now,
            },
          },
        });
      } catch (error) {
        // Silently fail cleanup - not critical
        console.error('Error cleaning up expired sessions:', error);
      }
    },
    60 * 60 * 1000
  );
}

/**
 * Creates a session token for document access
 */
export async function createLinkSession(viewId: string, linkId: string, ipAddress?: string, userAgent?: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION);

  // Get tenantId from DocumentView
  const documentView = await db.documentView.findUnique({
    where: { id: viewId },
    select: { tenantId: true },
  });

  if (!documentView) {
    throw new Error('DocumentView not found');
  }

  // Create session in database
  await db.linkAccessSession.create({
    data: {
      token,
      viewId,
      linkId,
      expiresAt,
      ipAddress,
      userAgent,
      tenantId: documentView.tenantId,
    },
  });

  // Set HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return token;
}

/**
 * Validates a session token and returns the session data
 */
export async function validateLinkSession(token?: string): Promise<{ viewId: string; linkId: string } | null> {
  // If no token provided, try to get from cookie
  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  }

  if (!token) {
    return null;
  }

  // Get session from database
  const session = await db.linkAccessSession.findUnique({
    where: { token },
    select: {
      viewId: true,
      linkId: true,
      expiresAt: true,
    },
  });

  if (!session) {
    return null;
  }

  // Check if session expired
  if (session.expiresAt < new Date()) {
    // Delete expired session
    await db.linkAccessSession
      .delete({
        where: { token },
      })
      .catch(() => {
        // Ignore errors if already deleted
      });
    return null;
  }

  return {
    viewId: session.viewId,
    linkId: session.linkId,
  };
}

/**
 * Clears the session cookie and deletes the session from database
 */
export async function clearLinkSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    // Delete session from database
    await db.linkAccessSession
      .delete({
        where: { token },
      })
      .catch(() => {
        // Ignore errors if already deleted
      });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Gets session from cookie (for API routes)
 */
export async function getLinkSessionFromCookie(): Promise<{ viewId: string; linkId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return validateLinkSession(token);
}
