'use client';

import { createContext, ReactNode, useContext, useState } from 'react';
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
  clipboard: ClipboardItem[];
  isClipboardExpanded: boolean;
  addToClipboard: (item: ClipboardItem) => void;
  removeFromClipboard: (itemId: string, isFolder: boolean) => void;
  clearClipboard: () => void;
  toggleClipboardExpanded: () => void;
  handlePaste: (currentFolderId: string | null) => Promise<void>;
};

const ClipboardContext = createContext<ClipboardContextType | null>(null);

export function ClipboardProvider({ children }: { children: ReactNode }) {
  const [clipboard, setClipboard] = useState<ClipboardItem[]>([]);
  const [isClipboardExpanded, setIsClipboardExpanded] = useState(false);

  const addToClipboard = (item: ClipboardItem) => {
    setClipboard((prev) => [...prev.filter((i) => !(i.id === item.id && i.isFolder === item.isFolder)), item]);
  };

  const removeFromClipboard = (itemId: string, isFolder: boolean) => {
    setClipboard((prev) => prev.filter((i) => !(i.id === itemId && i.isFolder === isFolder)));
  };

  const clearClipboard = () => setClipboard([]);
  const toggleClipboardExpanded = () => setIsClipboardExpanded((prev) => !prev);

  const handlePaste = async (currentFolderId: string | null) => {
    if (clipboard.length === 0) {
      toast.error('Nothing to paste');
      return;
    }

    try {
      // Aquí iría la lógica de tu API para manejar el pegado
      // Deberías implementar las llamadas a tu backend aquí
      toast.success('Items pasted successfully');
      setClipboard((prev) => prev.filter((item) => item.action === 'copy'));
    } catch (error) {
      toast.error('Error pasting items');
    }
  };

  return (
    <ClipboardContext.Provider
      value={{
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
