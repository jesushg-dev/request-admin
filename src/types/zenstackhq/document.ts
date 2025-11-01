import { Prisma } from '@zenstackhq/runtime/models';

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
        childFolders: true,
      },
    },
  },
});

export type DataroomFolderWithRelations = Prisma.DataroomFolderGetPayload<typeof DataroomFolderDefaultArgs>;

export const DataroomViewerDetailDefaultArgs = Prisma.validator<Prisma.DataroomDefaultArgs>()({
  select: {
    requestId: true,
    folders: {
      select: { id: true, name: true },
    },
    documents: {
      select: { id: true, name: true },
    },
    viewerGroups: {
      select: {
        id: true,
        name: true,
        domains: true,
        allowAll: true,
        accessControls: {
          select: {
            id: true,
            itemId: true,
            itemType: true,
            canView: true,
            canDownload: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    },
  },
});

export type DataroomViewerDetail = Prisma.DataroomGetPayload<typeof DataroomViewerDetailDefaultArgs>;
