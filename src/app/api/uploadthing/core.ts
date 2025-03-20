import { STORAGE_SERVICE } from '@/constants/storage';
import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-server';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { z } from 'zod';

const input = z.object({
  tenantId: z.string(),
  folderId: z.string().nullish(),
  dataroomId: z.string().nullish(),
});

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: '4MB',
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
      const type = file.name.split('.').pop()?.toLowerCase(); // Extensión del archivo
      const contentType = file.type;

      await db.document.create({
        data: {
          tenantId: metadata.tenantId,
          name: file.name,
          file: file.ufsUrl,
          type: type,
          contentType: contentType,
          storageType: STORAGE_SERVICE.UPLOADTHING,
          versions: {
            create: [
              {
                tenantId: metadata.tenantId,
                versionNumber: 1,
                file: file.ufsUrl,
                type: type,
                contentType: contentType,
                fileSize: file.size,
                storageType: STORAGE_SERVICE.UPLOADTHING,
                isPrimary: true,
              },
            ],
          },
          dataroomId: metadata.dataroomId ? metadata.dataroomId : undefined,
          folderId: metadata.folderId ? metadata.folderId : undefined,
        },
      });

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
