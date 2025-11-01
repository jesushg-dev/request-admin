import { getDb } from '@/server/db-client';
import { NextRequestHandler } from '@zenstackhq/server/next';

// create an enhanced Prisma client with user context using ZenStack
async function getPrisma() {
  return await getDb();
}

const handler = NextRequestHandler({ getPrisma, useAppDir: true });

export { handler as DELETE, handler as GET, handler as PATCH, handler as POST, handler as PUT };
