import { auth } from '@/server/auth';
import { db } from '@/server/db-client';
import { enhance } from '@zenstackhq/runtime';
import { User } from '@zenstackhq/runtime/models';
import { NextRequestHandler } from '@zenstackhq/server/next';

// create an enhanced Prisma client with user context
async function getPrisma() {
  const session = await auth();
  // todo: review this approach
  return enhance(db, { user: session?.user as unknown as User });
}

const handler = NextRequestHandler({ getPrisma, useAppDir: true });

export { handler as DELETE, handler as GET, handler as PATCH, handler as POST, handler as PUT };
