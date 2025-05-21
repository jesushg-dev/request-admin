import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-server';

import { UserNotFoundErr } from '@/lib/error';
import { generateUuid } from '@/lib/id';

import { cloneDocumentsAndFolders } from '../document';

// Mock the dependencies
jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn(),
}));

jest.mock('@/server/db-server', () => ({
  db: {
    document: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    dataroomFolder: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
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

    (db.document.findMany as jest.Mock).mockImplementation((args) => {
      if (args.where.id) {
        return mockDocuments;
      }
      return mockDocumentsInFolders;
    });

    (db.dataroomFolder.findMany as jest.Mock).mockImplementation((args) => {
      if (args.where.id) {
        return mockFolders;
      }
      return mockSubFolders;
    });

    await cloneDocumentsAndFolders(mockDocumentIds, mockFolderIds, mockDataroomId, mockCurrentFolderId);

    // Verify document creation calls
    expect(db.document.create).toHaveBeenCalledTimes(3); // 2 direct documents + 1 document in folder
    expect(db.document.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: 'new-uuid',
        dataroomId: mockDataroomId,
        folderId: mockCurrentFolderId,
      }),
    });

    // Verify folder creation calls
    expect(db.dataroomFolder.create).toHaveBeenCalledTimes(3); // 2 folders + 1 subfolder
    expect(db.dataroomFolder.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: 'new-uuid',
        dataroomId: mockDataroomId,
        parentId: mockCurrentFolderId,
      }),
    });
  });

  it('should handle empty arrays of documents and folders', async () => {
    (db.document.findMany as jest.Mock).mockResolvedValue([]);
    (db.dataroomFolder.findMany as jest.Mock).mockResolvedValue([]);

    await cloneDocumentsAndFolders([], [], mockDataroomId, mockCurrentFolderId);

    expect(db.document.create).not.toHaveBeenCalled();
    expect(db.dataroomFolder.create).not.toHaveBeenCalled();
  });
});
