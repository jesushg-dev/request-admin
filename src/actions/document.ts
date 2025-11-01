'use server';

import { currentSession } from '@/server/auth-server';
import { getDb } from '@/server/db-client';

import { UserNotFoundErr } from '@/lib/error';
import { generateUuid } from '@/lib/id';

export async function cloneDocumentsAndFolders(documentIds: string[], folderIds: string[], dataroomId: string, currentFolderId: string | null) {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();

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
          folderId: currentFolderId,
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
          parentId: currentFolderId,
        },
      });
    })
  );
}
