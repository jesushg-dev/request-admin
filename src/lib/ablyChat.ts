import { Message as AblyMessage, ChatMessageActions, MessageReactions } from '@ably/chat';

import { MessageType } from '@/types/prisma/message';

import { DefaultMessage } from './DefaultMessage';
import { convertUserTenantTypeToUserTenant } from './user';

/**
 * Metadata structure for Ably messages.
 * Allows extra fields but provides strong typing for known fields.
 */
export interface AblyMessageMetadata {
  [key: string]: unknown;
  id?: string;
  personImage?: string | null;
  personFirstName?: string;
  personLastName?: string;
  userId?: string;
  userEmail?: string;
  userUsername?: string;
}

/**
 * Metadata structure for our own messages.
 */
export interface OurMessageMetadata {
  serial: string;
  headers: Record<string, string | number | boolean | null | undefined>;
  action: string;
  version: string;
  createdAt: Date;
  timestamp: Date;
  reactions: MessageReactions;
}

/**
 * Extends AblyMessage to include our typed metadata.
 */
export interface AblyMessageWithMetadata extends AblyMessage {
  metadata: AblyMessageMetadata;
}

/**
 * Type guard to ensure a value is a valid ChatMessageActions enum value.
 */
function isChatMessageAction(value: unknown): value is ChatMessageActions {
  return Object.values(ChatMessageActions).includes(value as ChatMessageActions);
}

/**
 * Converts an Ably message to our internal MessageType.
 */
export const convertAblyMessageToOurType = (ablyMessage: AblyMessageWithMetadata): MessageType => {
  if (!ablyMessage.metadata.id) {
    throw new Error('Ably message metadata must contain an id');
  }

  return {
    id: ablyMessage.metadata.id,
    userTenant: {
      id: ablyMessage.clientId,
      person: {
        image: ablyMessage.metadata?.personImage || null,
        firstName: ablyMessage.metadata?.personFirstName || 'N/A',
        lastName: ablyMessage.metadata?.personLastName || 'N/A',
      },
      user: {
        id: ablyMessage.metadata?.userId || '',
        email: ablyMessage.metadata?.userEmail || '',
        username: ablyMessage.metadata?.userUsername || '',
      },
    },
    reactions: [],
    body: ablyMessage.text || '',
    imageId: null,
    createdAt: ablyMessage.createdAt ?? null,
    updatedAt: ablyMessage.updatedAt ?? null,
    metadata: '', // You can fill this if you want to keep the original metadata as string
    _count: {
      reactions: ablyMessage.reactions?.unique ? Object.keys(ablyMessage.reactions.unique).length : 0,
      replies: 0, // Assuming no replies in this context, adjust as needed
    },
  };
};

/**
 * Converts our internal MessageType to an Ably message with metadata.
 */
export const convertOurMessageToAbly = (roomId: string, message: MessageType): DefaultMessage => {
  // Start with default metadata
  let ourMetadata: OurMessageMetadata = {
    serial: message.id,
    headers: {},
    action: ChatMessageActions.MessageCreate,
    version: '',
    createdAt: message.createdAt,
    timestamp: message.createdAt,
    reactions: {
      unique: {},
      distinct: {},
      multiple: {},
    },
  };

  // If message.metadata is a stringified object, merge it in
  try {
    if (message.metadata) {
      const parsed = JSON.parse(message.metadata);
      ourMetadata = { ...ourMetadata, ...parsed };
    }
  } catch {
    // If parsing fails, use defaults
  }

  // Ensure action is a valid enum value
  const action: ChatMessageActions = isChatMessageAction(ourMetadata.action) ? ourMetadata.action : ChatMessageActions.MessageCreate;

  // Build the DefaultMessageParams
  const params = {
    serial: ourMetadata.serial ?? message.id,
    roomId,
    clientId: message.userTenant.id,
    text: message.body,
    metadata: {
      id: message.id,
      ...convertUserTenantTypeToUserTenant(message.userTenant),
    },
    headers: (ourMetadata.headers ?? {}) as Record<string, string | number | boolean | null | undefined>,
    action,
    version: ourMetadata.version,
    createdAt: message.createdAt,
    timestamp: ourMetadata.timestamp,
    reactions: ourMetadata.reactions,
  };

  // Return an instance of your DefaultMessage class
  return new DefaultMessage(params);
};

/**
 * Converts an Ably message to our metadata format.
 */
export const ConvertAblyDataToOurMetadata = (data: AblyMessage): OurMessageMetadata => {
  return {
    serial: data.serial,
    headers: data.headers,
    action: data.action,
    version: data.version,
    createdAt: data.createdAt,
    timestamp: data.timestamp,
    reactions: data.reactions,
  };
};
