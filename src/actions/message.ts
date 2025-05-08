'use server';

import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-client';

export class UserNotFoundErr extends Error {}

export async function findOrCreateConversation({ tenantId, userId }: { tenantId: string; userId: string }) {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

  // Search for an existing conversation
  const existingConversation = await db.conversation.findFirst({
    where: {
      tenantId,
      OR: [
        {
          AND: [{ userTenantOne: { userId: session.user.id } }, { userTenantTwo: { userId } }],
        },
        {
          AND: [{ userTenantOne: { userId } }, { userTenantTwo: { userId: session.user.id } }],
        },
      ],
    },
  });

  if (existingConversation) return existingConversation;

  // Create a new conversation if none exists
  const newConversation = await db.conversation.create({
    data: {
      tenant: { connect: { id: tenantId } },
      userTenantOne: { connect: { userId_tenantId: { userId: session.user.id, tenantId } } },
      userTenantTwo: { connect: { userId_tenantId: { userId, tenantId } } },
    },
  });

  return newConversation;
}
