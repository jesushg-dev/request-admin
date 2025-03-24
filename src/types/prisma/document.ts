import { Prisma } from '@prisma/client';

export const DocumentDefaultArgs = Prisma.validator<Prisma.DocumentDefaultArgs>()({
  select: {
    id: true,
    name: true,
    file: true,
    status: true,
    contentType: true,
    description: true,
    expirationDate: true,
    type: true,
    folderId: true,
    createdAt: true,
    createdBy: true,
    numPages: true,
    assistantEnabled: true,
    advancedExcelEnabled: true,
    downloadOnly: true,
    updatedAt: true,
    storageType: true,
    versions: {
      select: { file: true, fileSize: true },
      where: { isPrimary: true },
      take: 1,
    },
    folder: {
      select: {
        path: true,
      },
    },
    _count: {
      select: {
        views: true,
      },
    },
  },
});

export type DocumentWithRelations = Prisma.DocumentGetPayload<typeof DocumentDefaultArgs>;

export const DataroomFolderDefaultArgs = Prisma.validator<Prisma.DataroomFolderDefaultArgs>()({
  select: {
    id: true,
    name: true,
    parentId: true,
    dataroomId: true,
    createdAt: true,
    _count: {
      select: {
        documents: true,
      },
    },
  },
});

export type DataroomFolderWithRelations = Prisma.DataroomFolderGetPayload<typeof DataroomFolderDefaultArgs>;
