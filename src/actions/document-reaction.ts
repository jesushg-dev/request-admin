'use server';

import { db } from '@/server/db-client';

import { generateUuid } from '@/lib/id';

const VALID_REACTION_TYPES = ['like', 'dislike', 'love', 'smile', 'frown', 'idea', 'comment'] as const;
type ReactionType = (typeof VALID_REACTION_TYPES)[number];

function sanitizeContent(content: string): string {
  // Basic XSS prevention - strip HTML tags
  return content.replace(/<[^>]*>/g, '').trim();
}

/**
 * Get all reactions for a document
 */
export async function getDocumentReactions(
  documentId: string,
  pageNumber: number = 1,
  tenantId: string
): Promise<{
  success: boolean;
  reactions?: Array<{
    id: string;
    viewId: string;
    pageNumber: number;
    type: string;
    comment: string | null;
    createdAt: Date;
    viewerEmail: string | null;
  }>;
  error?: string;
}> {
  try {
    const reactions = await db.documentReaction.findMany({
      where: {
        view: {
          documentId,
          tenantId,
          isArchived: false,
        },
        pageNumber,
      },
      include: {
        view: {
          select: {
            viewerEmail: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedReactions = reactions.map((reaction) => ({
      id: reaction.id,
      viewId: reaction.viewId,
      pageNumber: reaction.pageNumber,
      type: reaction.type,
      comment: null, // TODO: Add comment field to schema
      createdAt: reaction.createdAt,
      viewerEmail: reaction.view.viewerEmail,
    }));

    return {
      success: true,
      reactions: formattedReactions,
    };
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return {
      success: false,
      error: 'Failed to fetch reactions',
    };
  }
}

/**
 * Add a reaction to a document
 */
export async function addReaction(
  documentId: string,
  viewId: string,
  pageNumber: number,
  type: string,
  tenantId: string,
  comment?: string
): Promise<{
  success: boolean;
  reactionId?: string;
  error?: string;
}> {
  try {
    // Validate reaction type
    if (!VALID_REACTION_TYPES.includes(type as ReactionType)) {
      return {
        success: false,
        error: 'Invalid reaction type',
      };
    }

    // Validate comment if provided
    let sanitizedComment: string | undefined = undefined;
    if (comment) {
      sanitizedComment = sanitizeContent(comment);
      if (sanitizedComment.length < 1) {
        return {
          success: false,
          error: 'Comment cannot be empty',
        };
      }
      if (sanitizedComment.length > 1000) {
        return {
          success: false,
          error: 'Comment must be less than 1000 characters',
        };
      }
    }

    // Verify that the viewId belongs to this document
    const view = await db.documentView.findUnique({
      where: {
        id: viewId,
        tenantId,
      },
      select: {
        documentId: true,
      },
    });

    if (!view || view.documentId !== documentId) {
      return {
        success: false,
        error: 'Invalid view or document',
      };
    }

    // Create the reaction
    const reactionId = generateUuid();
    await db.documentReaction.create({
      data: {
        id: reactionId,
        viewId,
        pageNumber,
        type,
        tenantId,
      },
    });

    return {
      success: true,
      reactionId,
    };
  } catch (error) {
    console.error('Error adding reaction:', error);
    return {
      success: false,
      error: 'Failed to add reaction',
    };
  }
}

/**
 * Delete a reaction
 */
export async function deleteReaction(
  reactionId: string,
  tenantId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Verify the reaction exists and belongs to this tenant
    const reaction = await db.documentReaction.findUnique({
      where: {
        id: reactionId,
        tenantId,
      },
    });

    if (!reaction) {
      return {
        success: false,
        error: 'Reaction not found',
      };
    }

    // Delete the reaction
    await db.documentReaction.delete({
      where: {
        id: reactionId,
        tenantId,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting reaction:', error);
    return {
      success: false,
      error: 'Failed to delete reaction',
    };
  }
}

/**
 * Get reaction counts for a document (summary)
 */
export async function getReactionCounts(
  documentId: string,
  tenantId: string
): Promise<{
  success: boolean;
  counts?: Record<string, number>;
  error?: string;
}> {
  try {
    const reactions = await db.documentReaction.groupBy({
      by: ['type'],
      where: {
        view: {
          documentId,
          tenantId,
          isArchived: false,
        },
      },
      _count: true,
    });

    const counts: Record<string, number> = {};
    reactions.forEach((r) => {
      counts[r.type] = r._count;
    });

    return {
      success: true,
      counts,
    };
  } catch (error) {
    console.error('Error fetching reaction counts:', error);
    return {
      success: false,
      error: 'Failed to fetch reaction counts',
    };
  }
}
