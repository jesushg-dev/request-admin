import { STORAGE_SERVICE } from '@/constants/storage';
import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-client';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { z } from 'zod';

import { normalizeValue } from '@/lib/utils';

const input = z.object({
  tenantId: z.string(),
  folderId: z.string().nullish(),
  dataroomId: z.string().nullish(),
  documentId: z.string().nullish(),
});

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    blob: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: '8MB',
      maxFileCount: 4,
    },
  })
    .input(input)
    // Set permissions and file types for this FileRoute
    .middleware(async ({ input }) => {
      // This code runs on your server before upload
      const session = await currentSession();
      if (!session) throw new UploadThingError('You must be logged in to upload a profile picture');

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session.user.id, ...input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const type = file.name.split('.').pop()?.toLowerCase();
      const contentType = file.type;

      try {
        // Check if we're creating a new version of an existing document
        const documentId = metadata.documentId ? String(metadata.documentId) : undefined;
        if (documentId) {
          // Create new version of existing document
          await db.$transaction(async (tx) => {
            // Get the existing document with its versions
            const existingDocument = await tx.document.findUnique({
              where: { id: documentId },
              include: {
                versions: {
                  orderBy: { versionNumber: 'desc' },
                  take: 1,
                },
              },
            });

            if (!existingDocument) {
              throw new Error('Document not found');
            }

            // Calculate next version number
            const nextVersionNumber = existingDocument.versions && existingDocument.versions.length > 0 ? existingDocument.versions[0].versionNumber + 1 : 1;

            // Mark all previous versions as not primary
            await tx.documentVersion.updateMany({
              where: { documentId: documentId },
              data: { isPrimary: false },
            });

            // Create new version
            await tx.documentVersion.create({
              data: {
                tenantId: metadata.tenantId,
                documentId: documentId,
                versionNumber: nextVersionNumber,
                file: file.ufsUrl,
                type: type ?? '',
                contentType: contentType,
                storageType: STORAGE_SERVICE.UPLOADTHING,
                fileSize: file.size,
                isPrimary: true,
                createdBy: metadata.userId,
                updatedBy: metadata.userId,
              },
            });

            // Update document file to point to the new version
            await tx.document.update({
              where: { id: documentId },
              data: {
                file: file.ufsUrl,
                updatedBy: metadata.userId,
              },
            });
          });
        } else {
          // Create new document with first version using nested create
          await db.document.create({
            data: {
              tenantId: metadata.tenantId,
              name: file.name,
              file: file.ufsUrl,
              type: type ?? '',
              contentType: contentType,
              storageType: STORAGE_SERVICE.UPLOADTHING,
              dataroomId: normalizeValue(metadata.dataroomId),
              folderId: normalizeValue(metadata.folderId),
              createdBy: metadata.userId,
              updatedBy: metadata.userId,
              versions: {
                create: {
                  tenantId: metadata.tenantId,
                  versionNumber: 1,
                  file: file.ufsUrl,
                  type: type ?? '',
                  contentType: contentType,
                  storageType: STORAGE_SERVICE.UPLOADTHING,
                  fileSize: file.size,
                  isPrimary: true,
                  createdBy: metadata.userId,
                  updatedBy: metadata.userId,
                },
              },
            },
          });
        }
      } catch (error) {
        console.error('Error creating document/version in database:', JSON.stringify(error));
        // Throw a proper UploadThingError so it propagates to the client
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new UploadThingError(`Failed to create document/version in database: ${errorMessage}`);
      }

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
