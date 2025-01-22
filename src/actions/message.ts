'use server';

import { auth } from '@/server/auth';
import { db } from '@/server/db-client';

class UserNotFoundErr extends Error {}

export const toggleReaction = async ({ messageId, value, tenantId, userTenantId }: { messageId: string; value: string; tenantId: string; userTenantId: string }) => {
  const session = await auth();
  if (!session) throw new UserNotFoundErr();

  const existingReaction = await db.reaction.findFirst({
    where: { messageId, value },
  });

  if (existingReaction) {
    await db.reaction.delete({ where: { id: existingReaction.id } });
  } else {
    await db.reaction.create({ data: { messageId, value, tenantId, userTenantId } });
  }
};

export async function findOrCreateConversation({ tenantId, userId }: { tenantId: string; userId: string }) {
  const session = await auth();
  if (!session) throw new UserNotFoundErr();

  // Search for an existing conversation
  const existingConversation = await db.conversation.findFirst({
    where: {
      tenantId,
      OR: [
        {
          AND: [{ userTenantOne: { userId: session.user.id } }, { userTenantTwoId: userId }],
        },
        {
          AND: [{ userTenantOne: { userId } }, { userTenantTwoId: session.user.id }],
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
