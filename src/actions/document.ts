'use server';

import { requireUser } from '@/server/auth-server';
import { getDb } from '@/server/db-client';

import { UserNotFoundErr } from '@/lib/error';
import { generateUuid } from '@/lib/id';

export type DocumentMetadataFormData = {
  id: string;
  name: string | null;
  description: string | null;
  status: string | null;
  expirationDate: Date | null;
  assistantEnabled: boolean;
  advancedExcelEnabled: boolean;
  downloadOnly: boolean;
};

export async function getDocumentMetadataFormData(documentId: string, tenantId: string): Promise<DocumentMetadataFormData | null> {
  const db = await getDb();
  const document = await db.document.findFirst({
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      expirationDate: true,
      assistantEnabled: true,
      advancedExcelEnabled: true,
      downloadOnly: true,
    },
    where: { id: documentId, tenantId },
  });

  return document;
}

export async function getDocumentType(documentId: string, tenantId: string): Promise<string | null> {
  const db = await getDb();
  const document = await db.document.findFirst({
    select: {
      type: true,
    },
    where: { id: documentId, tenantId },
  });

  return document?.type ?? null;
}

export async function cloneDocumentsAndFolders(documentIds: string[], folderIds: string[], dataroomId: string, currentFolderId: string | null) {
  const user = await requireUser();
  if (!user) throw new UserNotFoundErr();

  const db = await getDb();
  const documents = await db.document.findMany({
    where: { id: { in: documentIds } },
  });

  const folders = await db.dataroomFolder.findMany({
    where: { id: { in: folderIds } },
  });

  const documentsToClone = await db.document.findMany({
    where: {
      folderId: { in: folders.map((folder) => folder.id) },
    },
  });

  const foldersToClone = await db.dataroomFolder.findMany({
    where: { parentId: { in: folders.map((folder) => folder.id) } },
  });

  const allDocuments = [...documents, ...documentsToClone];
  const allFolders = [...folders, ...foldersToClone];

  await Promise.all(
    allDocuments.map(async (document) => {
      return await db.document.create({
        data: {
          ...document,
          id: generateUuid(),
          dataroomId,
          folderId: currentFolderId && currentFolderId.trim() !== '' ? currentFolderId : null,
        },
      });
    })
  );

  await Promise.all(
    allFolders.map(async (folder) => {
      return await db.dataroomFolder.create({
        data: {
          ...folder,
          id: generateUuid(),
          dataroomId,
          parentId: currentFolderId && currentFolderId.trim() !== '' ? currentFolderId : null,
        },
      });
    })
  );
}
