import { NextResponse } from 'next/server';
import { STORAGE_SERVICE } from '@/constants/storage';
import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-client';
import { saveBufferToLocalFile } from '@/server/local-file-storage';

import { normalizeValue } from '@/lib/utils';

export async function POST(req: Request) {
  const session = await currentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();

  const tenantId = formData.get('tenantId')?.toString();
  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
  }

  const folderId = formData.get('folderId')?.toString() ?? null;
  const dataroomId = formData.get('dataroomId')?.toString() ?? null;
  const documentId = formData.get('documentId')?.toString() ?? null;

  const fileEntries = formData.getAll('files');
  if (!fileEntries.length) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 });
  }

  try {
    const results: unknown[] = [];

    for (const entry of fileEntries) {
      if (!(entry instanceof File)) {
        continue;
      }

      const arrayBuffer = await entry.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const stored = await saveBufferToLocalFile({
        buffer,
        tenantId,
        originalName: entry.name,
        contentType: entry.type,
      });

      const type = entry.name.split('.').pop()?.toLowerCase() ?? '';
      const contentType = entry.type;

      if (documentId) {
        // Create a new version for an existing document
        const result = await db.$transaction(async (tx) => {
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

          const nextVersionNumber = existingDocument.versions && existingDocument.versions.length > 0 ? existingDocument.versions[0].versionNumber + 1 : 1;

          await tx.documentVersion.updateMany({
            where: { documentId },
            data: { isPrimary: false },
          });

          const version = await tx.documentVersion.create({
            data: {
              tenantId,
              documentId,
              versionNumber: nextVersionNumber,
              file: stored.url,
              type,
              contentType,
              storageType: STORAGE_SERVICE.LOCAL_DISK,
              fileSize: stored.size,
              isPrimary: true,
              createdBy: session.user.id,
              updatedBy: session.user.id,
            },
          });

          const updatedDocument = await tx.document.update({
            where: { id: documentId },
            data: {
              file: stored.url,
              updatedBy: session.user.id,
            },
          });

          return { document: updatedDocument, version };
        });

        results.push(result);
      } else {
        // Create a new document with first version
        const document = await db.document.create({
          data: {
            tenantId,
            name: entry.name,
            file: stored.url,
            type,
            contentType,
            storageType: STORAGE_SERVICE.LOCAL_DISK,
            dataroomId: normalizeValue(dataroomId),
            folderId: normalizeValue(folderId),
            createdBy: session.user.id,
            updatedBy: session.user.id,
            versions: {
              create: {
                tenantId,
                versionNumber: 1,
                file: stored.url,
                type,
                contentType,
                storageType: STORAGE_SERVICE.LOCAL_DISK,
                fileSize: stored.size,
                isPrimary: true,
                createdBy: session.user.id,
                updatedBy: session.user.id,
              },
            },
          },
        });

        results.push({ document });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Internal upload failed:', error);
    return NextResponse.json({ error: 'Internal upload failed' }, { status: 500 });
  }
}
