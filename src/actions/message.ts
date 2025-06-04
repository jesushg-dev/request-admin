/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-client';

import { OurMessageMetadata } from '@/lib/ablyChat';
import { UserNotFoundErr } from '@/lib/error';

type NewMessageType = {
  id: string;
  body: string;
  tenantId: string;
  userTenantId: string;
  relatedId: string;
  variant: 'conversation' | 'channel' | 'thread';
  imageFile?: File;
  emailEnabled?: boolean;
  whatsAppEnabled?: boolean;
  metadata?: OurMessageMetadata;
};

async function handleImageUpload(imageFile?: File): Promise<string | undefined> {
  if (!imageFile) return undefined;
  // TODO: Implement your image upload logic here
  // return await uploadImageToStorage(imageFile);
  return 'uploaded-image-url-or-id';
}

async function handleEmail(message: unknown, imageUrl?: string) {
  // TODO: Implement email sending logic here
  // await sendEmailWithMessage({ message, imageUrl });
}

async function handleWhatsApp(message: unknown, imageUrl?: string) {
  // TODO: Implement WhatsApp sending logic here
  // await sendWhatsAppWithMessage({ message, imageUrl });
}

export async function createMessage({ id, body, tenantId, userTenantId, relatedId, variant, imageFile, emailEnabled, whatsAppEnabled }: NewMessageType) {
  let relatedField;
  switch (variant) {
    case 'conversation':
      relatedField = { conversationId: relatedId };
      break;
    case 'channel':
      relatedField = { channelId: relatedId };
      break;
    case 'thread':
      relatedField = { parentMessageId: relatedId };
      break;
    default:
      throw new Error('Invalid related type');
  }

  // Placeholder: Upload image if present
  let imageUrl: string | undefined = undefined;
  if (imageFile) {
    // TODO: Implement your image upload logic here
    // imageUrl = await uploadImageToStorage(imageFile);
    imageUrl = 'uploaded-image-url-or-id';
  }

  const message = await db.message.create({
    select: { id: true },
    data: { id, body, tenantId, userTenantId, ...(imageUrl && { imageId: imageUrl }), ...relatedField },
  });

  if (emailEnabled) await handleEmail(message, imageUrl);
  if (whatsAppEnabled) await handleWhatsApp(message, imageUrl);

  return message;
}

export async function updateMessage({ id, body, imageFile, emailEnabled, whatsAppEnabled }: { id: string; body: string; imageFile?: File; emailEnabled?: boolean; whatsAppEnabled?: boolean }) {
  const imageUrl = await handleImageUpload(imageFile);

  const message = await db.message.update({
    select: { id: true },
    where: { id },
    data: {
      body,
      ...(imageUrl && { imageId: imageUrl }),
    },
  });

  if (emailEnabled) await handleEmail(message, imageUrl);
  if (whatsAppEnabled) await handleWhatsApp(message, imageUrl);

  return message;
}

export async function removeMessage({ id }: { id: string }) {
  return db.message.delete({
    where: { id },
  });
}

export async function upsertReaction({ messageId, userTenantId, tenantId, value }: { messageId: string; userTenantId: string; tenantId: string; value: string }) {
  return db.reaction.upsert({
    where: {
      messageId_userTenantId: {
        messageId,
        userTenantId,
      },
    },
    create: {
      value,
      messageId,
      tenantId,
      userTenantId,
    },
    update: { value },
  });
}

export async function deleteReaction({ id }: { id: string }) {
  return db.reaction.delete({
    where: { id },
  });
}

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
