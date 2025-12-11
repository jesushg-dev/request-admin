'use server';

import { db } from '@/server/db-client';
import { generateUuid } from '@/lib/id';

export interface FeedbackQuestionData {
  type: 'YES_NO' | 'TEXT' | 'RATING';
  question: string;
  enabled: boolean;
}

export interface FeedbackResponseData {
  answer: 'YES' | 'NO' | string;
  text?: string; // For additional comments
}

/**
 * Get feedback question for a link
 */
export async function getFeedbackQuestion(
  linkId: string,
  tenantId: string
): Promise<{ success: boolean; feedback?: FeedbackQuestionData; error?: string }> {
  try {
    const feedback = await db.documentFeedback.findUnique({
      where: { linkId, tenantId },
    });

    if (!feedback) {
      return { success: true, feedback: undefined };
    }

    const data = JSON.parse(feedback.data) as FeedbackQuestionData;
    return { success: true, feedback: data };
  } catch (error) {
    console.error('Error getting feedback question:', error);
    return { success: false, error: 'Failed to get feedback question' };
  }
}

/**
 * Create or update feedback question for a link
 */
export async function upsertFeedbackQuestion(
  linkId: string,
  tenantId: string,
  feedbackData: FeedbackQuestionData
): Promise<{ success: boolean; feedbackId?: string; error?: string }> {
  try {
    // Validate input
    if (!feedbackData.question || feedbackData.question.trim().length < 3) {
      return { success: false, error: 'Question must be at least 3 characters long' };
    }
    if (feedbackData.question.length > 500) {
      return { success: false, error: 'Question must be less than 500 characters' };
    }

    // Verify link exists
    const link = await db.link.findUnique({
      where: { id: linkId, tenantId },
    });

    if (!link) {
      return { success: false, error: 'Link not found' };
    }

    // Upsert feedback question
    const feedback = await db.documentFeedback.upsert({
      where: { linkId },
      create: {
        id: generateUuid(),
        linkId,
        tenantId,
        data: JSON.stringify(feedbackData),
      },
      update: {
        data: JSON.stringify(feedbackData),
      },
    });

    return { success: true, feedbackId: feedback.id };
  } catch (error) {
    console.error('Error upserting feedback question:', error);
    return { success: false, error: 'Failed to save feedback question' };
  }
}

/**
 * Submit feedback response (public)
 */
export async function submitFeedbackResponse(
  viewId: string,
  responseData: FeedbackResponseData
): Promise<{ success: boolean; responseId?: string; error?: string }> {
  try {
    // Get view and link
    const view = await db.documentView.findUnique({
      where: { id: viewId },
      include: {
        link: {
          include: {
            feedback: true,
          },
        },
      },
    });

    if (!view || !view.link || !view.link.feedback) {
      return { success: false, error: 'Feedback not enabled for this link' };
    }

    // Check if user already submitted feedback
    const existingResponse = await db.feedbackResponse.findUnique({
      where: { viewId },
    });

    if (existingResponse) {
      return { success: false, error: 'Feedback already submitted' };
    }

    // Validate answer
    const feedbackData = JSON.parse(view.link.feedback.data) as FeedbackQuestionData;
    if (!feedbackData.enabled) {
      return { success: false, error: 'Feedback is disabled' };
    }

    if (feedbackData.type === 'YES_NO' && !['YES', 'NO'].includes(responseData.answer)) {
      return { success: false, error: 'Invalid answer' };
    }

    // Create response
    const response = await db.feedbackResponse.create({
      data: {
        id: generateUuid(),
        feedbackId: view.link.feedback.id,
        viewId: viewId,
        tenantId: view.link.tenantId,
        data: JSON.stringify(responseData),
      },
    });

    return { success: true, responseId: response.id };
  } catch (error) {
    console.error('Error submitting feedback response:', error);
    return { success: false, error: 'Failed to submit feedback' };
  }
}

/**
 * Get feedback responses for analytics (admin)
 */
export async function getFeedbackResponses(
  linkId: string,
  tenantId: string
): Promise<{ 
  success: boolean; 
  responses?: Array<{
    id: string;
    answer: string;
    text?: string;
    viewerEmail: string | null;
    viewerName: string | null;
    submittedAt: Date;
  }>; 
  summary?: {
    totalResponses: number;
    yesCount: number;
    noCount: number;
    yesPercentage: number;
    noPercentage: number;
  };
  error?: string;
}> {
  try {
    const feedback = await db.documentFeedback.findUnique({
      where: { linkId, tenantId },
      include: {
        responses: {
          include: {
            view: {
              select: {
                viewerEmail: true,
                viewerName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!feedback) {
      return { success: true, responses: [], summary: {
        totalResponses: 0,
        yesCount: 0,
        noCount: 0,
        yesPercentage: 0,
        noPercentage: 0,
      }};
    }

    // Parse responses
    const responses = feedback.responses.map((r) => {
      const data = JSON.parse(r.data) as FeedbackResponseData;
      return {
        id: r.id,
        answer: data.answer,
        text: data.text,
        viewerEmail: r.view.viewerEmail,
        viewerName: r.view.viewerName,
        submittedAt: r.createdAt,
      };
    });

    // Calculate summary for YES/NO questions
    const totalResponses = responses.length;
    const yesCount = responses.filter((r) => r.answer === 'YES').length;
    const noCount = responses.filter((r) => r.answer === 'NO').length;

    return {
      success: true,
      responses,
      summary: {
        totalResponses,
        yesCount,
        noCount,
        yesPercentage: totalResponses > 0 ? (yesCount / totalResponses) * 100 : 0,
        noPercentage: totalResponses > 0 ? (noCount / totalResponses) * 100 : 0,
      },
    };
  } catch (error) {
    console.error('Error getting feedback responses:', error);
    return { success: false, error: 'Failed to get feedback responses' };
  }
}

/**
 * Check if user has already submitted feedback
 */
export async function checkFeedbackSubmitted(
  viewId: string
): Promise<{ success: boolean; submitted: boolean; error?: string }> {
  try {
    const response = await db.feedbackResponse.findUnique({
      where: { viewId },
    });

    return { success: true, submitted: !!response };
  } catch (error) {
    console.error('Error checking feedback submission:', error);
    return { success: false, submitted: false, error: 'Failed to check feedback status' };
  }
}

