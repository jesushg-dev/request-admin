'use server';

import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { db } from '@/server/db-client';

import { generateUuid } from '@/lib/id';
import { isEmailAllowed, parseEmailList } from '@/lib/link-email-validation';
import { createLinkSession } from '@/lib/link-session';
import { getInitialStep, type ValidationConfig, type ValidationStep } from '@/lib/link-validation';
import { sendVerificationOTP } from '@/lib/mail';
import { comparePassword } from '@/lib/password';

// Re-export types for backward compatibility
export type { ValidationStep, ValidationConfig } from '@/lib/link-validation';

function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export interface LinkAccessData {
  email?: string;
  name?: string;
  password?: string;
  agreementAccepted?: boolean;
  agreementName?: string;
  customFieldResponses?: Record<string, unknown>;
}

export interface LinkValidationResult {
  success: boolean;
  initialStep?: ValidationStep;
  link?: {
    id: string;
    name: string | null;
    documentId: string | null;
    dataroomId: string | null;
    linkType: string;
    tenantId: string;
    enablePassword: boolean;
    emailProtected: boolean;
    emailAuthenticated: boolean;
    enableAgreement: boolean;
    agreementId: string | null;
    agreementContent?: string | null;
    agreementRequireName?: boolean;
    allowDownload: boolean | null;
    enableScreenshotProtection: boolean | null;
    enableWatermark: boolean | null;
    enableFeedback: boolean | null;
    customFields: Array<{
      id: string;
      type: string;
      label: string;
      placeholder: string | null;
      required: boolean;
      disabled: boolean;
      orderIndex: number;
    }>;
  };
  document?: {
    id: string;
    contentType: string | null;
    name: string;
  };
  error?: string;
}

export async function validateLinkAccess(slug: string): Promise<LinkValidationResult> {
  try {
    // Link has a compound unique constraint on [domainSlug, slug]
    // For public links without domain, domainSlug should be null
    const link = await db.link.findFirst({
      where: {
        slug,
        isArchived: false,
        deletedAt: null,
      },
      include: {
        document: {
          select: {
            id: true,
            contentType: true,
            name: true,
          },
        },
        customField: {
          where: {
            disabled: false,
            deletedAt: null,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
        agreement: {
          select: {
            id: true,
            content: true,
            requireName: true,
            name: true,
          },
        },
      },
    });

    if (!link) {
      return { success: false, error: 'Link not found or has been archived' };
    }

    // Check expiration
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return { success: false, error: 'This link has expired' };
    }

    // Determine initial step based on validation requirements
    const hasPassword = !!link.password;
    const hasEmailProtection = link.emailProtected;
    const hasAgreement = !!link.enableAgreement;
    const hasCustomFields = link.customField.length > 0;

    const validationConfig: ValidationConfig = {
      hasPassword,
      hasEmailProtection,
      hasEmailAuthentication: link.emailAuthenticated,
      hasAgreement,
      hasCustomFields,
    };

    const initialStep = getInitialStep(validationConfig);

    return {
      success: true,
      initialStep,
      link: {
        id: link.id,
        name: link.name,
        documentId: link.documentId,
        dataroomId: link.dataroomId,
        linkType: link.linkType,
        tenantId: link.tenantId,
        enablePassword: hasPassword,
        emailProtected: link.emailProtected,
        emailAuthenticated: link.emailAuthenticated,
        enableAgreement: hasAgreement,
        agreementId: link.agreementId,
        agreementContent: link.agreement?.content,
        agreementRequireName: link.agreement?.requireName,
        allowDownload: link.allowDownload,
        enableScreenshotProtection: link.enableScreenshotProtection,
        enableWatermark: link.enableWatermark,
        enableFeedback: link.enableFeedback,
        customFields: link.customField.map((field) => ({
          id: field.id,
          type: field.type,
          label: field.label,
          placeholder: field.placeholder,
          required: field.required,
          disabled: field.disabled,
          orderIndex: field.orderIndex,
        })),
      },
      document: link.document
        ? {
            id: link.document.id,
            contentType: link.document.contentType,
            name: link.document.name,
          }
        : undefined,
    };
  } catch (error) {
    console.error('Error validating link access:', error);
    return { success: false, error: 'Failed to validate link access' };
  }
}

export async function validateLinkPassword(slug: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const link = await db.link.findFirst({
      where: { slug },
      select: { password: true },
    });

    if (!link || !link.password) {
      return { success: false, error: 'Link not found or password not required' };
    }

    const isValid = await comparePassword({ hash: link.password, password });
    if (!isValid) {
      return { success: false, error: 'Invalid password' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error validating password:', error);
    return { success: false, error: 'Failed to validate password' };
  }
}

export async function validateLinkEmail(slug: string, email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const link = await db.link.findFirst({
      where: { slug },
      select: { allowList: true, denyList: true, emailProtected: true },
    });

    if (!link) {
      return { success: false, error: 'Link not found' };
    }

    if (!link.emailProtected) {
      return { success: true };
    }

    const allowList = parseEmailList(link.allowList);
    const denyList = parseEmailList(link.denyList);

    const result = isEmailAllowed(email, allowList, denyList);
    if (!result.allowed) {
      return { success: false, error: result.reason || 'Email not allowed' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error validating email:', error);
    return { success: false, error: 'Failed to validate email' };
  }
}

export async function sendEmailVerification(slug: string, email: string): Promise<{ success: boolean; error?: string }> {
  try {
    // First validate the email is allowed
    const emailValidation = await validateLinkEmail(slug, email);
    if (!emailValidation.success) {
      return emailValidation;
    }

    // Get link to retrieve linkId and tenantId
    const link = await db.link.findFirst({
      where: { slug },
      select: { id: true, tenantId: true },
    });

    if (!link) {
      return { success: false, error: 'Link not found' };
    }

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate any existing codes for this email/link combination
    await db.linkEmailVerificationCode.updateMany({
      where: {
        email,
        linkId: link.id,
        verified: false,
      },
      data: {
        verified: true, // Mark old codes as used
      },
    });

    // Store verification code in database
    await db.linkEmailVerificationCode.create({
      data: {
        email,
        code,
        linkId: link.id,
        expiresAt,
        verified: false,
        tenantId: link.tenantId,
      },
    });

    // Send email
    await sendVerificationOTP(email, code, 'email-verification');

    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: 'Failed to send verification email' };
  }
}

export async function verifyEmailCode(slug: string, email: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get link ID from slug
    const link = await db.link.findFirst({
      where: { slug },
      select: { id: true },
    });

    if (!link) {
      return { success: false, error: 'Link not found' };
    }

    // Find the most recent non-verified code for this email/link
    const storedCode = await db.linkEmailVerificationCode.findFirst({
      where: {
        email,
        linkId: link.id,
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!storedCode) {
      return { success: false, error: 'Verification code not found or expired' };
    }

    if (storedCode.expiresAt < new Date()) {
      // Mark as verified to prevent reuse
      await db.linkEmailVerificationCode.update({
        where: { id: storedCode.id },
        data: { verified: true },
      });
      return { success: false, error: 'Verification code has expired' };
    }

    if (storedCode.code !== code) {
      return { success: false, error: 'Invalid verification code' };
    }

    // Code is valid, mark as verified
    await db.linkEmailVerificationCode.update({
      where: { id: storedCode.id },
      data: { verified: true },
    });

    return { success: true };
  } catch (error) {
    console.error('Error verifying email code:', error);
    return { success: false, error: 'Failed to verify code' };
  }
}

export async function submitLinkAccess(slug: string, data: LinkAccessData): Promise<{ success: boolean; viewId?: string; sessionToken?: string; error?: string }> {
  console.log('submitLinkAccess', slug, data);
  try {
    // STEP 1: Validate link exists and is accessible
    const linkValidation = await validateLinkAccess(slug);
    if (!linkValidation.success || !linkValidation.link) {
      return { success: false, error: linkValidation.error || 'Link not found' };
    }

    const link = linkValidation.link;

    // STEP 2: Validate password if required
    if (link.enablePassword) {
      if (!data.password) {
        return { success: false, error: 'Password is required' };
      }
      const passwordValidation = await validateLinkPassword(slug, data.password);
      if (!passwordValidation.success) {
        return { success: false, error: passwordValidation.error || 'Invalid password' };
      }
    }

    // STEP 3: Validate email if required
    if (link.emailProtected) {
      if (!data.email) {
        return { success: false, error: 'Email is required' };
      }
      const emailValidation = await validateLinkEmail(slug, data.email);
      if (!emailValidation.success) {
        return { success: false, error: emailValidation.error || 'Email not allowed' };
      }
      // If email authentication is required, verify that email was verified via OTP
      // This is already handled in the frontend, but we trust the frontend here
      // The actual verification happens in validateLinkEmail which checks allowList/denyList
    }

    // STEP 4: Validate agreement if required
    if (link.enableAgreement) {
      if (!data.agreementAccepted) {
        return { success: false, error: 'Agreement must be accepted' };
      }
      if (!link.agreementId) {
        return { success: false, error: 'Agreement not found' };
      }
    }

    // STEP 5: Validate custom fields if required
    if (link.customFields.length > 0) {
      const requiredFields = link.customFields.filter((field) => field.required && !field.disabled);
      if (requiredFields.length > 0) {
        if (!data.customFieldResponses) {
          return { success: false, error: 'Custom fields are required' };
        }
        // Check that all required fields are present
        for (const field of requiredFields) {
          const value = data.customFieldResponses[field.id];
          if (!value || (typeof value === 'string' && !value.trim())) {
            return { success: false, error: `Field "${field.label}" is required` };
          }
        }
      }
    }

    // STEP 6: All validations passed - Create DocumentView
    const viewId = generateUuid();
    const documentView = await db.documentView.create({
      data: {
        id: viewId,
        linkId: link.id,
        documentId: link.documentId,
        dataroomId: link.dataroomId,
        viewerEmail: data.email,
        viewerName: data.name,
        verified: link.emailAuthenticated && !!data.email, // Set to true if email was authenticated
        viewType: link.linkType === 'DATAROOM_LINK' ? 'DATAROOM_VIEW' : 'DOCUMENT_VIEW',
        tenantId: link.tenantId,
      },
    });

    // STEP 7: Create AgreementResponse if agreement was accepted
    if (link.enableAgreement && link.agreementId && data.agreementAccepted) {
      await db.agreementResponse.create({
        data: {
          agreementId: link.agreementId,
          viewId: documentView.id,
          tenantId: documentView.tenantId,
        },
      });
    }

    // STEP 8: Create CustomFieldResponse if there are custom field responses
    if (data.customFieldResponses && Object.keys(data.customFieldResponses).length > 0) {
      await db.customFieldResponse.create({
        data: {
          data: JSON.stringify(data.customFieldResponses),
          viewId: documentView.id,
          tenantId: documentView.tenantId,
        },
      });
    }

    // STEP 9: Create session token for secure access
    const sessionToken = await createLinkSession(viewId, link.id);

    revalidatePath(`/l/${slug}`);

    return { success: true, viewId: documentView.id, sessionToken };
  } catch (error) {
    console.error('Error submitting link access:', error);
    return { success: false, error: 'Failed to submit access request' };
  }
}

export async function submitFeedback(viewId: string, feedbackData: Record<string, unknown>): Promise<{ success: boolean; error?: string }> {
  try {
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

    if (!view || !view.link) {
      return { success: false, error: 'View not found' };
    }

    // Get or create DocumentFeedback
    let documentFeedback = view.link.feedback;
    if (!documentFeedback) {
      documentFeedback = await db.documentFeedback.create({
        data: {
          linkId: view.linkId,
          data: JSON.stringify({}),
          tenantId: view.tenantId,
        },
      });
    }

    // Create or update FeedbackResponse
    await db.feedbackResponse.upsert({
      where: { viewId },
      create: {
        feedbackId: documentFeedback.id,
        viewId,
        data: JSON.stringify(feedbackData),
        tenantId: view.tenantId,
      },
      update: {
        data: JSON.stringify(feedbackData),
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return { success: false, error: 'Failed to submit feedback' };
  }
}

export async function toggleBookmark(viewId: string): Promise<{ success: boolean; isBookmarked: boolean; error?: string }> {
  try {
    // For now, we'll use localStorage for bookmark state
    // In a full implementation, you might want to store this in the database
    return { success: true, isBookmarked: false };
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return { success: false, isBookmarked: false, error: 'Failed to toggle bookmark' };
  }
}

/**
 * Creates link access session when no validations are required
 * This is a Server Action that can modify cookies
 * It handles the entire flow directly without calling submitLinkAccess
 * to ensure proper cookie context
 */
export async function createLinkAccessSession(slug: string): Promise<{ success: boolean; viewId?: string; error?: string }> {
  try {
    // STEP 1: Validate link exists and is accessible
    const linkValidation = await validateLinkAccess(slug);
    if (!linkValidation.success || !linkValidation.link) {
      return { success: false, error: linkValidation.error || 'Link not found' };
    }

    // STEP 2: Verify that no validations are required
    if (linkValidation.initialStep !== 'complete') {
      return { success: false, error: 'Validations are required for this link' };
    }

    const link = linkValidation.link;

    // STEP 3: Create DocumentView directly (no validations needed)
    const viewId = generateUuid();
    const documentView = await db.documentView.create({
      data: {
        id: viewId,
        linkId: link.id,
        documentId: link.documentId,
        dataroomId: link.dataroomId,
        viewerEmail: undefined,
        viewerName: undefined,
        verified: false,
        viewType: link.linkType === 'DATAROOM_LINK' ? 'DATAROOM_VIEW' : 'DOCUMENT_VIEW',
        tenantId: link.tenantId,
      },
    });

    // STEP 4: Create session token for secure access
    // This must be done in the same Server Action context to modify cookies
    const sessionToken = await createLinkSession(viewId, link.id);

    revalidatePath(`/l/${slug}`);

    return { success: true, viewId: documentView.id };
  } catch (error) {
    console.error('Error creating link access session:', error);
    return { success: false, error: 'Failed to create access session' };
  }
}

/**
 * Validates document access and returns file URL if access is granted
 * This is used by the document serve endpoint to validate access before serving files
 */
export async function validateDocumentServeAccess(viewId: string): Promise<{
  success: boolean;
  fileUrl?: string;
  contentType?: string;
  documentName?: string;
  allowDownload?: boolean;
  viewerEmail?: string | null;
  viewerName?: string | null;
  enableWatermark?: boolean;
  error?: string;
}> {
  try {
    // STEP 1: Validate session
    const { validateLinkSession } = await import('@/lib/link-session');
    const session = await validateLinkSession();
    if (!session || session.viewId !== viewId) {
      return { success: false, error: 'Unauthorized' };
    }

    // STEP 2: Get DocumentView with all related data
    const documentView = await db.documentView.findUnique({
      where: { id: viewId },
      include: {
        link: {
          include: {
            document: true,
            agreement: true,
            customField: {
              where: {
                disabled: false,
                deletedAt: null,
              },
            },
          },
        },
        agreementResponse: true,
        customFieldResponse: true,
      },
    });

    if (!documentView || !documentView.link) {
      return { success: false, error: 'View not found' };
    }

    const link = documentView.link;

    // STEP 3: Validate link is still valid
    if (link.isArchived || link.deletedAt) {
      return { success: false, error: 'Link is no longer available' };
    }

    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return { success: false, error: 'Link has expired' };
    }

    // STEP 4: Validate all security rules were met
    // 4a. Password validation - DocumentView existence confirms password was validated
    if (link.password) {
      // Password protection is enabled - DocumentView exists, so validation passed
    }

    // 4b. Email validation
    if (link.emailProtected) {
      if (!documentView.viewerEmail) {
        return { success: false, error: 'Email validation required' };
      }

      const { parseEmailList, isEmailAllowed } = await import('@/lib/link-email-validation');
      const allowList = parseEmailList(link.allowList);
      const denyList = parseEmailList(link.denyList);
      const emailCheck = isEmailAllowed(documentView.viewerEmail, allowList, denyList);
      if (!emailCheck.allowed) {
        return { success: false, error: emailCheck.reason || 'Email not allowed' };
      }
    }

    // 4c. Agreement validation
    if (link.enableAgreement && link.agreementId) {
      const agreementResponse = documentView.agreementResponse;
      if (!agreementResponse) {
        return { success: false, error: 'Agreement must be accepted' };
      }
    }

    // 4d. Custom fields validation
    if (link.customField.length > 0) {
      const requiredFields = link.customField.filter((field) => field.required);
      if (requiredFields.length > 0) {
        const customFieldResponse = documentView.customFieldResponse;
        if (!customFieldResponse) {
          return { success: false, error: 'Custom fields are required' };
        }

        try {
          const responses = JSON.parse(customFieldResponse.data);
          for (const field of requiredFields) {
            const value = responses[field.id];
            if (!value || (typeof value === 'string' && !value.trim())) {
              return { success: false, error: `Field "${field.label}" is required` };
            }
          }
        } catch {
          return { success: false, error: 'Invalid custom field responses' };
        }
      }
    }

    // STEP 5: Get document file
    if (!link.document) {
      return { success: false, error: 'Document not found' };
    }

    const document = link.document;
    const fileUrl = document.file;

    if (!fileUrl) {
      return { success: false, error: 'Document file not available' };
    }

    return {
      success: true,
      fileUrl,
      contentType: document.contentType,
      documentName: document.name,
      allowDownload: link.allowDownload ?? false,
      viewerEmail: documentView.viewerEmail,
      viewerName: documentView.viewerName,
      enableWatermark: link.enableWatermark ?? false,
    };
  } catch (error) {
    console.error('Error validating document serve access:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Validates a document view and returns the necessary data to display the document
 * This is called from the view page to ensure the viewId is valid and the session is correct
 */
export async function validateDocumentView(
  viewId: string,
  linkId: string
): Promise<{
  success: boolean;
  document?: {
    id: string;
    name: string;
    contentType: string | null;
  };
  link?: {
    allowDownload: boolean | null;
    enableScreenshotProtection: boolean | null;
    enableWatermark: boolean | null;
    enableFeedback: boolean | null;
    enableQuestion: boolean | null;
    enableConversation: boolean | null;
  };
  viewer?: {
    email: string | null;
    name: string | null;
  };
  tenantId?: string;
  error?: string;
}> {
  try {
    // Fetch DocumentView with link and document
    const documentView = await db.documentView.findUnique({
      where: { id: viewId },
      include: {
        link: {
          include: {
            document: {
              select: {
                id: true,
                name: true,
                contentType: true,
              },
            },
          },
        },
      },
    });

    if (!documentView || !documentView.link) {
      return { success: false, error: 'Document view not found' };
    }

    // Verify that the linkId matches
    if (documentView.linkId !== linkId) {
      return { success: false, error: 'Link ID mismatch' };
    }

    // Check if link is archived or deleted
    if (documentView.link.isArchived || documentView.link.deletedAt) {
      return { success: false, error: 'Link is no longer available' };
    }

    // Check if link has expired
    if (documentView.link.expiresAt && new Date(documentView.link.expiresAt) < new Date()) {
      return { success: false, error: 'Link has expired' };
    }

    if (!documentView.link.document) {
      return { success: false, error: 'Document not found' };
    }

    return {
      success: true,
      document: {
        id: documentView.link.document.id,
        name: documentView.link.document.name,
        contentType: documentView.link.document.contentType,
      },
      link: {
        allowDownload: documentView.link.allowDownload,
        enableScreenshotProtection: documentView.link.enableScreenshotProtection,
        enableWatermark: documentView.link.enableWatermark,
        enableFeedback: documentView.link.enableFeedback,
        enableQuestion: documentView.link.enableQuestion,
        enableConversation: documentView.link.enableConversation,
      },
      viewer: {
        email: documentView.viewerEmail,
        name: documentView.viewerName,
      },
      tenantId: documentView.tenantId,
    };
  } catch (error) {
    console.error('Error validating document view:', error);
    return { success: false, error: 'Failed to validate document view' };
  }
}
