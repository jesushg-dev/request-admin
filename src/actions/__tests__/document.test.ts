import { currentSession, requireUser } from '@/server/auth-server';
import { getDb } from '@/server/db-client';

import { UserNotFoundErr } from '@/lib/error';
import { generateUuid } from '@/lib/id';

import { cloneDocumentsAndFolders } from '../document';

// Mock the dependencies
jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn(),
  requireUser: jest.fn(),
}));

const mockDb = {
  document: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  dataroomFolder: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
};

jest.mock('@/server/db-client', () => ({
  getDb: jest.fn(),
}));

jest.mock('@/lib/id', () => ({
  generateUuid: jest.fn(),
}));

describe('cloneDocumentsAndFolders', () => {
  const mockSession = { user: { id: 'user-1' } };
  const mockDocumentIds = ['doc-1', 'doc-2'];
  const mockFolderIds = ['folder-1', 'folder-2'];
  const mockDataroomId = 'dataroom-1';
  const mockCurrentFolderId = 'current-folder-1';

  beforeEach(() => {
    jest.clearAllMocks();
    (currentSession as jest.Mock).mockResolvedValue(mockSession);
    (requireUser as jest.Mock).mockImplementation(async () => {
      const s = await (currentSession as any)();
      return s?.user ?? s;
    });
    (getDb as jest.Mock).mockResolvedValue(mockDb);
    (generateUuid as jest.Mock).mockImplementation(() => 'new-uuid');
  });

  it('should throw UserNotFoundErr when no session exists', async () => {
    (currentSession as jest.Mock).mockResolvedValue(null);

    await expect(cloneDocumentsAndFolders(mockDocumentIds, mockFolderIds, mockDataroomId, mockCurrentFolderId)).rejects.toThrow(UserNotFoundErr);
  });

  it('should clone documents and folders successfully', async () => {
    // Mock the database responses
    const mockDocuments = [
      { id: 'doc-1', name: 'Document 1', folderId: null },
      { id: 'doc-2', name: 'Document 2', folderId: null },
    ];

    const mockFolders = [
      { id: 'folder-1', name: 'Folder 1', parentId: null },
      { id: 'folder-2', name: 'Folder 2', parentId: null },
    ];

    const mockDocumentsInFolders = [{ id: 'doc-3', name: 'Document 3', folderId: 'folder-1' }];

    const mockSubFolders = [{ id: 'subfolder-1', name: 'Subfolder 1', parentId: 'folder-1' }];

    (mockDb.document.findMany as jest.Mock).mockImplementation((args) => {
      if (args.where.id) {
        return mockDocuments;
      }
      return mockDocumentsInFolders;
    });

    (mockDb.dataroomFolder.findMany as jest.Mock).mockImplementation((args) => {
      if (args.where.id) {
        return mockFolders;
      }
      return mockSubFolders;
    });

    await cloneDocumentsAndFolders(mockDocumentIds, mockFolderIds, mockDataroomId, mockCurrentFolderId);

    // Verify document creation calls
    expect(mockDb.document.create).toHaveBeenCalledTimes(3); // 2 direct documents + 1 document in folder
    expect(mockDb.document.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: 'new-uuid',
        dataroomId: mockDataroomId,
        folderId: mockCurrentFolderId,
      }),
    });

    // Verify folder creation calls
    expect(mockDb.dataroomFolder.create).toHaveBeenCalledTimes(3); // 2 folders + 1 subfolder
    expect(mockDb.dataroomFolder.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: 'new-uuid',
        dataroomId: mockDataroomId,
        parentId: mockCurrentFolderId,
      }),
    });
  });

  it('should handle empty arrays of documents and folders', async () => {
    (mockDb.document.findMany as jest.Mock).mockResolvedValue([]);
    (mockDb.dataroomFolder.findMany as jest.Mock).mockResolvedValue([]);

    await cloneDocumentsAndFolders([], [], mockDataroomId, mockCurrentFolderId);

    expect(mockDb.document.create).not.toHaveBeenCalled();
    expect(mockDb.dataroomFolder.create).not.toHaveBeenCalled();
  });
});
