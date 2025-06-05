import { Message as AblyMessage, MessageReactions } from '@ably/chat';

import { MessageType } from '@/types/prisma/message';

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

// Converts an Ably message (with metadata) to your app's MessageType
export const ablyToAppMessage = (ablyMessage: AblyMessageWithMetadata): MessageType => {
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

// Converts a raw Ably message to your app's metadata structure
export const ablyToAppMetadata = (data: AblyMessage): OurMessageMetadata => {
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

// Parses a JSON string (from Ably) into your app's metadata structure
export const parseAppMetadataFromString = (metadata: string): OurMessageMetadata => {
  try {
    const parsed = JSON.parse(metadata);
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Parsed metadata is not an object');
    }
    return {
      serial: parsed.serial || '',
      headers: parsed.headers || {},
      action: parsed.action || '',
      version: parsed.version || '',
      createdAt: new Date(parsed.createdAt || Date.now()),
      timestamp: new Date(parsed.timestamp || Date.now()),
      reactions: parsed.reactions || {},
    };
  } catch (error) {
    throw new Error(`Failed to parse metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
