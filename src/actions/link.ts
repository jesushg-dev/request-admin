'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/server/db-client';
import type { TLinkSchema } from '@/services/schemas/documents/link.schema';
import type { Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';

import { generateUuid } from '@/lib/id';
import { hashPassword } from '@/lib/password';
import { toSlug } from '@/lib/utils';
import { upsertFeedbackQuestion } from './document-feedback';

export interface UpsertLinkParams {
  data: TLinkSchema;
  tenantId: string;
  documentId?: string;
  dataroomId?: string;
  linkType: string;
}

export async function upsertLinkAction({ data, tenantId, documentId, dataroomId, linkType }: UpsertLinkParams): Promise<{ id: string; url: string | null; slug: string | null }> {
  try {
    const db = await getDb();

    // Convert viewers arrays to comma-separated strings
    const denyList = data.denyViewers.map((viewer) => (viewer.type === 'EMAIL' ? viewer.value : `@${viewer.value}`)).join(',');
    const allowList = data.allowedViewers.map((viewer) => (viewer.type === 'EMAIL' ? viewer.value : `@${viewer.value}`)).join(',');

    // Remove form-only fields that don't exist in the model
    const { enablePassword, allowSpecificViewers, blockSpecificViewers, allowedViewers, denyViewers, customFields, feedbackQuestion, ...linkData } = data;

    // Check if link exists to determine if it's create or update
    const existingLink = await db.link.findUnique({
      where: { id: data.id, tenantId },
      select: { id: true, slug: true },
    });

    // Generate slug if it doesn't exist
    // We always generate the slug server-side (not from form input)
    let slug = existingLink?.slug || null;

    if (!slug) {
      // Generate base slug from name or use empty string
      let baseSlug = data.name ? toSlug(data.name) : '';

      // Generate a unique identifier using nanoid (short, URL-safe, unique)
      // nanoid generates IDs that are guaranteed to be unique (collision probability is negligible)
      // Using 8 characters gives us ~4.4 billion unique IDs
      const uniqueId = nanoid(8);

      // Combine base slug with unique ID
      // Format: "base-slug-abc12345" or just "abc12345" if no base slug
      slug = baseSlug ? `${baseSlug}-${uniqueId}` : uniqueId;

      // Note: nanoid guarantees uniqueness, so we don't need to check the database
      // The collision probability with 8 chars is ~0.0000000001% even with billions of IDs
    }

    // Generate URL from slug - this is the public URL that users will visit
    // Format: /l/[slug] (relative URL)
    const publicUrl = slug ? `/l/${slug}` : null;

    // Hash password if provided
    const hashedPassword = enablePassword && data.password ? await hashPassword(data.password) : null;

    // Prepare base link payload
    // Note: linkData doesn't include slug or url (they're generated server-side)
    // We explicitly add them here
    // For Prisma, we need to use relations (connect) instead of IDs directly
    // Exclude documentId/dataroomId from linkData if present (use relations instead)
    const { documentId: _docIdFromLinkData, dataroomId: _dataroomIdFromLinkData, agreementId, ...cleanLinkData } = linkData as typeof linkData & { documentId?: unknown; dataroomId?: unknown; agreementId?: unknown };

    const baseLinkPayload: Omit<Prisma.LinkCreateInput, 'customField'> = {
      ...cleanLinkData,
      tenant: { connect: { id: tenantId } },
      document: documentId ? { connect: { id: documentId } } : undefined,
      dataroom: dataroomId ? { connect: { id: dataroomId } } : undefined,
      agreement: agreementId ? { connect: { id: agreementId } } : undefined,
      linkType,
      allowList,
      denyList,
      watermarkConfig: '', // TODO: implement watermark config
      slug, // Include generated slug
      url: publicUrl, // Include generated URL based on slug - this is the public URL users will visit
      // Only include hashed password if it's provided (when enablePassword is true)
      password: hashedPassword,
    };

    // Prepare create payload (without deleteMany)
    const createPayload: Prisma.LinkCreateInput = {
      ...baseLinkPayload,
    };

    if (customFields && customFields.length > 0) {
      createPayload.customField = {
        create: customFields.map((field, index) => ({
          id: field.id,
          type: field.type,
          identifier: field.id,
          label: field.label,
          placeholder: field.placeholder || null,
          required: field.required,
          disabled: field.disabled,
          orderIndex: index,
          tenantId,
        })),
      };
    }

    // Prepare update payload (with deleteMany)
    // For update, we can use tenantId directly or keep the relation
    const updatePayload: Prisma.LinkUpdateInput = {
      ...baseLinkPayload,
      tenant: { connect: { id: tenantId } },
    };

    if (customFields && customFields.length > 0) {
      const existingCustomFieldIds = customFields.map((f) => f.id);
      updatePayload.customField = {
        // Delete custom fields that are no longer in the form
        deleteMany: existingCustomFieldIds.length > 0 ? { id: { notIn: existingCustomFieldIds }, linkId: data.id, tenantId } : { linkId: data.id, tenantId },
        // Upsert custom fields (create new or update existing)
        upsert: customFields.map((field, index) => ({
          where: { id: field.id, tenantId },
          create: {
            id: field.id,
            type: field.type,
            identifier: field.id,
            label: field.label,
            placeholder: field.placeholder || null,
            required: field.required,
            disabled: field.disabled,
            orderIndex: index,
            tenantId,
          },
          update: {
            type: field.type,
            identifier: field.id,
            label: field.label,
            placeholder: field.placeholder || null,
            required: field.required,
            disabled: field.disabled,
            orderIndex: index,
          },
        })),
      };
    } else {
      // If no custom fields, delete all existing ones (only in update)
      updatePayload.customField = {
        deleteMany: { linkId: data.id, tenantId },
      };
    }

    // Upsert the link
    const result = await db.link.upsert({
      where: { id: data.id, tenantId },
      create: createPayload,
      update: updatePayload,
      select: {
        id: true,
        url: true,
        slug: true,
      },
    });

    // Handle feedback question if enableFeedback is true
    if (data.enableFeedback && feedbackQuestion && feedbackQuestion.question && feedbackQuestion.question.trim().length >= 3) {
      await upsertFeedbackQuestion(result.id, tenantId, {
        type: feedbackQuestion.type,
        question: feedbackQuestion.question,
        enabled: true,
      });
    } else if (!data.enableFeedback) {
      // If feedback is disabled, mark as disabled
      try {
        await db.documentFeedback.update({
          where: { linkId: result.id, tenantId },
          data: {
            data: JSON.stringify({ enabled: false, type: 'YES_NO', question: '' }),
          },
        });
      } catch (e) {
        // Feedback doesn't exist yet, that's fine
      }
    }

    // Revalidate relevant paths
    revalidatePath(`/admin/${tenantId}/links-and-documents/links`);
    if (result.slug) {
      revalidatePath(`/l/${result.slug}`);
    }

    return {
      id: result.id,
      url: result.url,
      slug: result.slug,
    };
  } catch (error) {
    console.error('Error upserting link:', error);
    throw error;
  }
}
