'use server';

import { db } from '@/server/db-client';
import { generateUuid } from '@/lib/id';
import { notifyViewerOfResponse } from './link-conversation';

/**
 * Get all conversations for a document (admin view)
 */
export async function getDocumentConversations(
  documentId: string,
  tenantId: string,
  linkId?: string
): Promise<{
  success: boolean;
  conversations?: Array<{
    id: string;
    title: string | null;
    visibilityMode: string;
    lastMessageAt: Date | null;
    messageCount: number;
    hasAdminResponse: boolean;
    linkSlug: string | null;
    messages: Array<{
      id: string;
      content: string;
      createdAt: Date;
      isOwnerMessage: boolean;
      viewerEmail: string | null;
      viewerName: string | null;
      isRead: boolean;
    }>;
  }>;
  error?: string;
}> {
  try {
    // Build where clause
    const where: any = {
      documentId,
      tenantId,
      isEnabled: true,
    };

    if (linkId) {
      where.linkId = linkId;
    }

    // Get conversations
    const conversations = await db.documentConversation.findMany({
      where,
      include: {
        link: {
          select: { slug: true },
        },
        messages: {
          include: {
            view: {
              select: {
                viewerEmail: true,
                viewerName: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    const formattedConversations = conversations.map((conv) => {
      const hasAdminResponse = conv.messages.some((msg) => !!msg.userTenantId);

      return {
        id: conv.id,
        title: conv.title,
        visibilityMode: conv.visibilityMode,
        lastMessageAt: conv.lastMessageAt,
        messageCount: conv._count.messages,
        hasAdminResponse,
        linkSlug: conv.link?.slug || null,
        messages: conv.messages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          createdAt: msg.createdAt,
          isOwnerMessage: !!msg.userTenantId,
          viewerEmail: msg.view?.viewerEmail || null,
          viewerName: msg.view?.viewerName || null,
          isRead: msg.isRead,
        })),
      };
    });

    return { success: true, conversations: formattedConversations };
  } catch (error) {
    console.error('Error getting document conversations:', error);
    return { success: false, error: 'Failed to get conversations' };
  }
}

/**
 * Reply to a conversation as admin
 */
export async function replyToConversation(
  conversationId: string,
  userTenantId: string | null,
  content: string,
  tenantId: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Validate input
    const sanitizedContent = content.replace(/<[^>]*>/g, '').trim();
    if (sanitizedContent.length < 5) {
      return { success: false, error: 'Message must be at least 5 characters long' };
    }
    if (sanitizedContent.length > 1000) {
      return { success: false, error: 'Message must be less than 1000 characters' };
    }

    // Verify conversation exists
    const conversation = await db.documentConversation.findUnique({
      where: { id: conversationId, tenantId },
    });

    if (!conversation) {
      return { success: false, error: 'Conversation not found' };
    }

    // Validate userTenantId exists if provided
    if (userTenantId) {
      const userTenant = await db.userTenant.findUnique({
        where: { id: userTenantId },
      });
      if (!userTenant) {
        return { success: false, error: 'Invalid user' };
      }
    }

    // Create the message
    const messageId = generateUuid();
    await db.documentMessage.create({
      data: {
        id: messageId,
        content: sanitizedContent,
        conversation: { connect: { id: conversation.id } },
        userTenant: userTenantId ? { connect: { id: userTenantId } } : undefined,
        tenant: { connect: { id: tenantId } },
        isRead: true, // Admin messages are always read
      },
    });

    // Update conversation lastMessageAt
    await db.documentConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Send notification to viewer
    await notifyViewerOfResponse(conversationId, sanitizedContent);

    return { success: true, messageId };
  } catch (error) {
    console.error('Error replying to conversation:', error);
    return { success: false, error: 'Failed to reply' };
  }
}

/**
 * Get available links for filtering
 */
export async function getDocumentLinks(
  documentId: string,
  tenantId: string
): Promise<{
  success: boolean;
  links?: Array<{
    id: string;
    slug: string | null;
    name: string | null;
  }>;
  error?: string;
}> {
  try {
    const links = await db.link.findMany({
      where: {
        documentId,
        tenantId,
        isArchived: false,
      },
      select: {
        id: true,
        slug: true,
        name: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, links };
  } catch (error) {
    console.error('Error getting document links:', error);
    return { success: false, error: 'Failed to get links' };
  }
}

