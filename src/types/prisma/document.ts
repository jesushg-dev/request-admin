import { Prisma } from '@prisma/client';

export const DocumentDefaultArgs = Prisma.validator<Prisma.DocumentDefaultArgs>()({
  select: {
    id: true,
    name: true,
    type: true,
    folderId: true,
    createdAt: true,
    versions: {
      select: { fileSize: true },
      where: { isPrimary: true },
      take: 1,
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
