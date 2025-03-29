'use client';

import { createContext, ReactNode, useContext, useState, useTransition } from 'react';
import { cloneDocumentsAndFolders } from '@/actions/document';
import { useUpdateManyDocument } from '@/services/api/hooks';
import { toast } from 'sonner';

export type ClipboardAction = 'cut' | 'copy';

export type ClipboardItem = {
  id: string;
  name: string;
  type: string;
  isFolder: boolean;
  action: ClipboardAction;
};

type ClipboardContextType = {
  isPending: boolean;
  clipboard: ClipboardItem[];
  isClipboardExpanded: boolean;
  addToClipboard: (item: ClipboardItem) => void;
  removeFromClipboard: (itemId: string, isFolder: boolean) => void;
  clearClipboard: () => void;
  toggleClipboardExpanded: () => void;
  handlePaste: (dataroomId: string, currentFolderId: string | null) => Promise<void>;
};

const ClipboardContext = createContext<ClipboardContextType | null>(null);

export function ClipboardProvider({ children }: { children: ReactNode }) {
  const [clipboard, setClipboard] = useState<ClipboardItem[]>([]);
  const [isClipboardExpanded, setIsClipboardExpanded] = useState(false);
  const { mutateAsync: cut } = useUpdateManyDocument();
  const [isPending, startTransition] = useTransition();

  const addToClipboard = (item: ClipboardItem) => {
    setClipboard((prev) => [...prev.filter((i) => !(i.id === item.id && i.isFolder === item.isFolder)), item]);
  };

  const removeFromClipboard = (itemId: string, isFolder: boolean) => {
    setClipboard((prev) => prev.filter((i) => !(i.id === itemId && i.isFolder === isFolder)));
  };

  const clearClipboard = () => setClipboard([]);
  const toggleClipboardExpanded = () => setIsClipboardExpanded((prev) => !prev);

  const handlePaste = async (dataroomId: string, currentFolderId: string | null) => {
    if (clipboard.length === 0) {
      toast.error('Nothing to paste');
      return;
    }

    startTransition(async () => {
      const toastId = toast.loading('Pasting...');
      // Extract IDs from clipboard items based on type and action
      const cutDocumentIds = clipboard.filter((item) => !item.isFolder && item.action === 'cut').map((item) => item.id);
      const cutFolderIds = clipboard.filter((item) => item.isFolder && item.action === 'cut').map((item) => item.id);

      await cut(
        {
          data: { dataroomId, folderId: currentFolderId },
          where: {
            id: { in: cutDocumentIds.length > 0 ? cutDocumentIds : undefined },
            folderId: { in: cutFolderIds.length > 0 ? cutFolderIds : undefined },
          },
        },
        {
          onSuccess: () => {
            toast.success('Pasted successfully', { id: toastId });
            clearClipboard();
          },
          onError(error) {
            toast.error('Failed to paste', { id: toastId });
            console.error('Error pasting documents:', error.message);
          },
        }
      );

      const copyDocumentIds = clipboard.filter((item) => !item.isFolder && item.action === 'copy').map((item) => item.id);
      const copyFolderIds = clipboard.filter((item) => item.isFolder && item.action === 'copy').map((item) => item.id);

      if (copyDocumentIds.length === 0 && copyFolderIds.length === 0) {
        toast.dismiss(toastId);
        return;
      }

      toast.promise(cloneDocumentsAndFolders(cutDocumentIds, cutFolderIds, dataroomId, currentFolderId), {
        loading: 'Pasting...',
        success: () => {
          return 'Pasted successfully';
        },
        error: ({ error }) => {
          console.error('Error pasting documents:', error.message);
          return 'Failed to paste' + error.message;
        },
      });
    });
  };

  return (
    <ClipboardContext.Provider
      value={{
        isPending,
        clipboard,
        isClipboardExpanded,
        addToClipboard,
        removeFromClipboard,
        clearClipboard,
        toggleClipboardExpanded,
        handlePaste,
      }}>
      {children}
    </ClipboardContext.Provider>
  );
}

export function useClipboard() {
  const context = useContext(ClipboardContext);
  if (!context) {
    throw new Error('useClipboard must be used within a ClipboardProvider');
  }
  return context;
}
