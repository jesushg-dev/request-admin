import { env } from '@/env';
import { PrismaClient } from '@prisma/client';
import type { User } from '@prisma/client';
import { enhance } from '@zenstackhq/runtime';

const createPrismaClient = () =>
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

// Base Prisma client (not enhanced, used internally)
const prismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;

/**
 * Creates an enhanced ZenStack client with user context.
 * This is the default way to access the database in server actions and API routes.
 * It automatically applies ZenStack access control policies based on the current user session.
 *
 * @param user - Optional user object. If not provided, will fetch from current session.
 * @returns Enhanced Prisma client with ZenStack access control
 *
 * @example
 * ```ts
 * // In server actions - automatically uses current session
 * const db = await getDb();
 * await db.requestCategory.findMany({ ... });
 *
 * // With explicit user
 * const db = await getDb(user);
 * await db.requestCategory.findMany({ ... });
 * ```
 */
export async function getDb(user?: User | null) {
  // If user is provided, use it; otherwise get from session
  let sessionUser = user;
  if (!sessionUser) {
    // Lazy import to avoid circular dependency with auth-server
    const { currentSession } = await import('./auth-server');
    const session = await currentSession();
    if (session?.user) {
      // Map Better Auth user to Prisma User type, ensuring undefined values are converted to null
      sessionUser = {
        ...session.user,
        role: session.user.role ?? null,
        image: session.user.image ?? null,
        twoFactorEnabled: session.user.twoFactorEnabled ?? null,
        phoneNumber: session.user.phoneNumber ?? null,
        phoneNumberVerified: session.user.phoneNumberVerified ?? null,
        isAnonymous: session.user.isAnonymous ?? null,
        banned: session.user.banned ?? null,
        banReason: session.user.banReason ?? null,
        banExpires: session.user.banExpires ?? null,
        username: session.user.username ?? null,
        displayUsername: session.user.displayUsername ?? null,
        isGlobalAdmin: session.user.isGlobalAdmin ?? false,
      } as User;
    }
  }
  return enhance(prismaClient, sessionUser ? { user: sessionUser } : {});
}

/**
 * Synchronous version of getDb for cases where you already have the user.
 * Use this when you've already fetched the session.
 *
 * @param user - The user object to enhance the client with
 * @returns Enhanced Prisma client with ZenStack access control
 */
export function getDbSync(user?: User | null) {
  return enhance(prismaClient, user ? { user: user as unknown as User } : {});
}

/**
 * Only use this for auth-server or other cases where you need direct Prisma access.
 */
export const db = prismaClient;
