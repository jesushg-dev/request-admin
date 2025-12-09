'use server';

import { db } from '@/server/db-client';
import { generateUuid } from '@/lib/id';

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: Date }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_QUESTIONS = 5; // 5 questions per hour per viewId

function checkRateLimit(viewId: string): boolean {
  const now = new Date();
  const record = rateLimitMap.get(viewId);

  if (!record || record.resetAt < now) {
    rateLimitMap.set(viewId, { count: 1, resetAt: new Date(now.getTime() + RATE_LIMIT_WINDOW) });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_QUESTIONS) {
    return false;
  }

  record.count++;
  return true;
}

function sanitizeContent(content: string): string {
  // Basic XSS prevention - strip HTML tags
  return content.replace(/<[^>]*>/g, '').trim();
}

/**
 * Create a simple question (for enableQuestion)
 */
export async function createPublicQuestion(
  viewId: string,
  content: string
): Promise<{ success: boolean; conversationId?: string; error?: string }> {
  try {
    // Validate input
    const sanitizedContent = sanitizeContent(content);
    if (sanitizedContent.length < 10) {
      return { success: false, error: 'Question must be at least 10 characters long' };
    }
    if (sanitizedContent.length > 1000) {
      return { success: false, error: 'Question must be less than 1000 characters' };
    }

    // Check rate limit
    if (!checkRateLimit(viewId)) {
      return { success: false, error: 'Rate limit exceeded. Please try again later.' };
    }

    // Get DocumentView and validate
    const documentView = await db.documentView.findUnique({
      where: { id: viewId },
      include: {
        link: {
          include: {
            document: {
              select: {
                id: true,
                dataroomId: true,
              },
            },
          },
        },
      },
    });

    if (!documentView || !documentView.link) {
      return { success: false, error: 'Invalid view' };
    }

    if (!documentView.link.enableQuestion) {
      return { success: false, error: 'Questions are not enabled for this link' };
    }

    // Get dataroomId from link or from document
    const dataroomId = documentView.link.dataroomId || documentView.link.document?.dataroomId;
    if (!dataroomId) {
      return { success: false, error: 'Dataroom not found for this document' };
    }

    // Create conversation with visibilityMode PRIVATE (only viewer and admin see it)
    const conversationId = generateUuid();
    const conversation = await db.documentConversation.create({
      data: {
        id: conversationId,
        title: sanitizedContent.substring(0, 100), // Use first 100 chars as title
        isEnabled: true,
        visibilityMode: 'PRIVATE',
        tenant: { connect: { id: documentView.link.tenantId } },
        dataroom: { connect: { id: dataroomId } },
        document: documentView.link.documentId ? { connect: { id: documentView.link.documentId } } : undefined,
        link: { connect: { id: documentView.link.id } },
        initialView: { connect: { id: viewId } },
      },
    });

    // Create the initial message (the question)
    await db.documentMessage.create({
      data: {
        content: sanitizedContent,
        conversation: { connect: { id: conversation.id } },
        view: { connect: { id: viewId } },
        tenant: { connect: { id: documentView.link.tenantId } },
        isRead: false,
      },
    });

    // Create conversation view relationship
    await db.documentConversationView.create({
      data: {
        conversation: { connect: { id: conversation.id } },
        view: { connect: { id: viewId } },
        tenant: { connect: { id: documentView.link.tenantId } },
      },
    });

    return { success: true, conversationId: conversation.id };
  } catch (error) {
    console.error('Error creating question:', error);
    return { success: false, error: 'Failed to create question' };
  }
}

/**
 * Create a conversation (for enableConversation)
 */
export async function createPublicConversation(
  viewId: string,
  title: string,
  content: string,
  visibilityMode: 'PUBLIC' | 'PRIVATE' = 'PRIVATE'
): Promise<{ success: boolean; conversationId?: string; error?: string }> {
  try {
    // Validate input
    const sanitizedTitle = sanitizeContent(title);
    const sanitizedContent = sanitizeContent(content);
    
    if (sanitizedTitle.length < 3) {
      return { success: false, error: 'Title must be at least 3 characters long' };
    }
    if (sanitizedContent.length < 5) {
      return { success: false, error: 'Message must be at least 5 characters long' };
    }
    if (sanitizedContent.length > 1000) {
      return { success: false, error: 'Message must be less than 1000 characters' };
    }

    // Check rate limit
    if (!checkRateLimit(viewId)) {
      return { success: false, error: 'Rate limit exceeded. Please try again later.' };
    }

    // Get DocumentView and validate
    const documentView = await db.documentView.findUnique({
      where: { id: viewId },
      include: {
        link: {
          include: {
            document: {
              select: {
                id: true,
                dataroomId: true,
              },
            },
          },
        },
      },
    });

    if (!documentView || !documentView.link) {
      return { success: false, error: 'Invalid view' };
    }

    if (!documentView.link.enableConversation) {
      return { success: false, error: 'Conversations are not enabled for this link' };
    }

    // Get dataroomId from link or from document
    const dataroomId = documentView.link.dataroomId || documentView.link.document?.dataroomId;
    if (!dataroomId) {
      return { success: false, error: 'Dataroom not found for this document' };
    }

    // Create conversation
    const conversationId = generateUuid();
    const conversation = await db.documentConversation.create({
      data: {
        id: conversationId,
        title: sanitizedTitle,
        isEnabled: true,
        visibilityMode: visibilityMode,
        tenant: { connect: { id: documentView.link.tenantId } },
        dataroom: { connect: { id: dataroomId } },
        document: documentView.link.documentId ? { connect: { id: documentView.link.documentId } } : undefined,
        link: { connect: { id: documentView.link.id } },
        initialView: { connect: { id: viewId } },
        lastMessageAt: new Date(),
      },
    });

    // Create the initial message
    await db.documentMessage.create({
      data: {
        content: sanitizedContent,
        conversation: { connect: { id: conversation.id } },
        view: { connect: { id: viewId } },
        tenant: { connect: { id: documentView.link.tenantId } },
        isRead: false,
      },
    });

    // Create conversation view relationship
    await db.documentConversationView.create({
      data: {
        conversation: { connect: { id: conversation.id } },
        view: { connect: { id: viewId } },
        tenant: { connect: { id: documentView.link.tenantId } },
      },
    });

    return { success: true, conversationId: conversation.id };
  } catch (error) {
    console.error('Error creating conversation:', error);
    return { success: false, error: 'Failed to create conversation' };
  }
}

/**
 * Add a message to an existing conversation
 */
export async function addMessageToConversation(
  conversationId: string,
  viewId: string,
  content: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Validate input
    const sanitizedContent = sanitizeContent(content);
    if (sanitizedContent.length < 5) {
      return { success: false, error: 'Message must be at least 5 characters long' };
    }
    if (sanitizedContent.length > 1000) {
      return { success: false, error: 'Message must be less than 1000 characters' };
    }

    // Verify conversation exists and viewer has access
    const conversation = await db.documentConversation.findUnique({
      where: { id: conversationId },
      include: {
        views: {
          where: { viewId },
        },
      },
    });

    if (!conversation) {
      return { success: false, error: 'Conversation not found' };
    }

    // Verify viewer has access to this conversation
    if (conversation.views.length === 0 && conversation.visibilityMode === 'PRIVATE') {
      return { success: false, error: 'Access denied' };
    }

    // Create the message
    const messageId = generateUuid();
    await db.documentMessage.create({
      data: {
        id: messageId,
        content: sanitizedContent,
        conversation: { connect: { id: conversation.id } },
        view: { connect: { id: viewId } },
        tenant: { connect: { id: conversation.tenantId } },
        isRead: false,
      },
    });

    // Update conversation lastMessageAt
    await db.documentConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return { success: true, messageId };
  } catch (error) {
    console.error('Error adding message:', error);
    return { success: false, error: 'Failed to add message' };
  }
}

/**
 * Get conversations for a viewer (respecting visibility mode)
 */
export async function getPublicConversations(
  viewId: string,
  linkId: string
): Promise<{
  success: boolean;
  conversations?: Array<{
    id: string;
    title: string | null;
    visibilityMode: string;
    lastMessageAt: Date | null;
    messageCount: number;
    unreadCount: number;
    messages: Array<{
      id: string;
      content: string;
      createdAt: Date;
      isOwnerMessage: boolean;
      viewerEmail: string | null;
      isRead: boolean;
    }>;
  }>;
  error?: string;
}> {
  try {
    // Verify viewId and linkId are valid
    const documentView = await db.documentView.findUnique({
      where: { id: viewId },
      select: { linkId: true, tenantId: true },
    });

    if (!documentView || documentView.linkId !== linkId) {
      return { success: false, error: 'Invalid view or link' };
    }

    // Get conversations based on visibility mode
    const conversations = await db.documentConversation.findMany({
      where: {
        linkId: linkId,
        isEnabled: true,
        OR: [
          // Public conversations (everyone can see)
          { visibilityMode: 'PUBLIC' },
          // Private conversations where this viewer is a participant
          {
            visibilityMode: 'PRIVATE',
            views: {
              some: { viewId: viewId },
            },
          },
        ],
      },
      include: {
        messages: {
          include: {
            view: {
              select: { viewerEmail: true },
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

    const formattedConversations = conversations.map((conv) => ({
      id: conv.id,
      title: conv.title,
      visibilityMode: conv.visibilityMode,
      lastMessageAt: conv.lastMessageAt,
      messageCount: conv._count.messages,
      unreadCount: conv.messages.filter((m) => !m.isRead && m.viewId === viewId).length,
      messages: conv.messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        createdAt: msg.createdAt,
        isOwnerMessage: !!msg.userTenantId,
        viewerEmail: msg.view?.viewerEmail || null,
        isRead: msg.isRead,
      })),
    }));

    return { success: true, conversations: formattedConversations };
  } catch (error) {
    console.error('Error getting conversations:', error);
    return { success: false, error: 'Failed to get conversations' };
  }
}

/**
 * Mark conversation messages as read for a viewer
 */
export async function markConversationAsRead(
  conversationId: string,
  viewId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update all unread messages in this conversation for this viewer
    await db.documentMessage.updateMany({
      where: {
        conversationId: conversationId,
        viewId: viewId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    return { success: false, error: 'Failed to mark as read' };
  }
}

/**
 * Send notification email when admin responds to a conversation
 * This should be called from the admin side when replying
 */
export async function notifyViewerOfResponse(
  conversationId: string,
  messageContent: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get conversation with initial view to get viewer email
    const conversation = await db.documentConversation.findUnique({
      where: { id: conversationId },
      include: {
        link: {
          select: {
            enableNotification: true,
            slug: true,
            tenantId: true,
            document: {
              select: { name: true },
            },
          },
        },
        initialView: {
          select: {
            id: true,
            viewerEmail: true,
            viewerName: true,
          },
        },
      },
    });

    if (!conversation || !conversation.link || !conversation.initialView?.viewerEmail) {
      return { success: false, error: 'Conversation or viewer not found' };
    }

    // Check if notifications are enabled
    if (!conversation.link.enableNotification) {
      return { success: true }; // Not an error, just skip notification
    }

    // Create SentEmail record
    await db.sentEmail.create({
      data: {
        type: 'CONVERSATION_REPLY',
        recipient: conversation.initialView.viewerEmail,
        marketing: false,
        tenantId: conversation.link.tenantId,
      },
    });

    // TODO: Integrate with actual email service
    // For now, just log that we would send an email
    console.log('Would send email notification to:', conversation.initialView.viewerEmail);
    console.log('Subject: New response to your question');
    console.log('Preview:', messageContent.substring(0, 100));
    console.log('Link:', `/l/${conversation.link.slug}/view?viewId=${conversation.initialView.id}&highlight=${conversationId}`);

    return { success: true };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}

