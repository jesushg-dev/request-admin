'use server';

import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/server/db-client';
import { sendVerificationOTP } from '@/lib/mail';
import { generateUuid } from '@/lib/id';
import { comparePassword } from '@/lib/password';

// In-memory cache for verification codes (in production, use Redis or database)
const verificationCodes = new Map<
  string,
  { code: string; email: string; expiresAt: Date; linkSlug: string }
>();

// Clean up expired codes every 5 minutes
setInterval(() => {
  const now = new Date();
  for (const [key, value] of verificationCodes.entries()) {
    if (value.expiresAt < now) {
      verificationCodes.delete(key);
    }
  }
}, 5 * 60 * 1000);

function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

function parseEmailList(listString: string): string[] {
  if (!listString || listString.trim() === '') return [];
  try {
    // Try parsing as JSON first
    const parsed = JSON.parse(listString);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // If not JSON, treat as comma-separated
    return listString
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
}

function extractDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() || '';
}

function isEmailAllowed(email: string, allowList: string[], denyList: string[]): { allowed: boolean; reason?: string } {
  const emailLower = email.toLowerCase();
  const domain = extractDomain(email);

  // Check deny list first
  for (const denied of denyList) {
    const deniedLower = denied.toLowerCase();
    // Check if email or domain is denied
    if (deniedLower === emailLower || deniedLower === `@${domain}` || deniedLower === domain) {
      return { allowed: false, reason: 'Your email or domain is not allowed to access this link' };
    }
  }

  // If allow list is empty, allow all (unless denied)
  if (allowList.length === 0) {
    return { allowed: true };
  }

  // Check allow list
  for (const allowed of allowList) {
    const allowedLower = allowed.toLowerCase();
    // Check if email or domain is allowed
    if (allowedLower === emailLower || allowedLower === `@${domain}` || allowedLower === domain) {
      return { allowed: true };
    }
  }

  return { allowed: false, reason: 'Your email or domain is not in the allowed list' };
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
    file: string;
    contentType: string | null;
    name: string;
  };
  error?: string;
}

export async function validateLinkAccess(slug: string): Promise<LinkValidationResult> {
  try {
    const db = await getDb();
    console.log('Validating link access for slug:', slug);
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
            file: true,
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
      console.log('Link not found for slug:', slug);
      // Try to find if link exists but is archived or deleted
      const anyLink = await db.link.findFirst({
        where: { slug },
        select: { id: true, isArchived: true, deletedAt: true },
      });
      if (anyLink) {
        console.log('Link exists but is archived or deleted:', { isArchived: anyLink.isArchived, deletedAt: anyLink.deletedAt });
      } else {
        console.log('No link found with slug:', slug);
      }
      return { success: false, error: 'Link not found or has been archived' };
    }

    // Check expiration
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return { success: false, error: 'This link has expired' };
    }

    return {
      success: true,
      link: {
        id: link.id,
        name: link.name,
        documentId: link.documentId,
        dataroomId: link.dataroomId,
        linkType: link.linkType,
        tenantId: link.tenantId,
        enablePassword: !!link.password,
        emailProtected: link.emailProtected,
        emailAuthenticated: link.emailAuthenticated,
        enableAgreement: !!link.enableAgreement,
        agreementId: link.agreementId,
        agreementContent: link.agreement?.content,
        agreementRequireName: link.agreement?.requireName,
        allowDownload: link.allowDownload,
        enableScreenshotProtection: link.enableScreenshotProtection,
        enableWatermark: link.enableWatermark,
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
            file: link.document.file,
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
    const db = await getDb();
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
    const db = await getDb();
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

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store verification code
    const cacheKey = `${slug}:${email}`;
    verificationCodes.set(cacheKey, { code, email, expiresAt, linkSlug: slug });

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
    const cacheKey = `${slug}:${email}`;
    const stored = verificationCodes.get(cacheKey);

    if (!stored) {
      return { success: false, error: 'Verification code not found or expired' };
    }

    if (stored.expiresAt < new Date()) {
      verificationCodes.delete(cacheKey);
      return { success: false, error: 'Verification code has expired' };
    }

    if (stored.code !== code) {
      return { success: false, error: 'Invalid verification code' };
    }

    // Code is valid, remove it from cache
    verificationCodes.delete(cacheKey);

    return { success: true };
  } catch (error) {
    console.error('Error verifying email code:', error);
    return { success: false, error: 'Failed to verify code' };
  }
}

export async function submitLinkAccess(slug: string, data: LinkAccessData): Promise<{ success: boolean; viewId?: string; error?: string }> {
  try {
    const db = await getDb();

    // Validate link exists and is accessible
    const linkValidation = await validateLinkAccess(slug);
    if (!linkValidation.success || !linkValidation.link) {
      return { success: false, error: linkValidation.error || 'Link not found' };
    }

    const link = linkValidation.link;

    // Validate email if required
    if (link.emailProtected && data.email) {
      const emailValidation = await validateLinkEmail(slug, data.email);
      if (!emailValidation.success) {
        return emailValidation;
      }
    }

    // Create DocumentView
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

    // Create AgreementResponse if agreement was accepted
    if (link.enableAgreement && link.agreementId && data.agreementAccepted) {
      await db.agreementResponse.create({
        data: {
          agreementId: link.agreementId,
          viewId: documentView.id,
          tenantId: documentView.tenantId,
        },
      });
    }

    // Create CustomFieldResponse if there are custom field responses
    if (data.customFieldResponses && Object.keys(data.customFieldResponses).length > 0) {
      await db.customFieldResponse.create({
        data: {
          data: JSON.stringify(data.customFieldResponses),
          viewId: documentView.id,
          tenantId: documentView.tenantId,
        },
      });
    }

    revalidatePath(`/l/${slug}`);

    return { success: true, viewId: documentView.id };
  } catch (error) {
    console.error('Error submitting link access:', error);
    return { success: false, error: 'Failed to submit access request' };
  }
}

