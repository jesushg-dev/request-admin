import { createContext, HTMLAttributes, ReactNode, RefObject, useContext, useRef, useState } from 'react';
import { EditorContent, type Editor } from '@tiptap/react';

import { cn } from '@/lib/utils';
import CodeMirrorEditor from '@/components/tip-tap/SourceEditor/Editor';

import useTiptapEditor, { type UseTiptapEditorOptions } from '../hooks/useTiptapEditor';

type TiptapContextType = {
  editor: Editor;
  contentElement: RefObject<HTMLDivElement | null>;
  isFullScreen: boolean;
  isResizing: boolean;
  isSourceMode: boolean;
  toggleFullScreen: () => void;
  toggleSourceMode: () => void;
  setIsResizing: (value: boolean) => void;
};

const TiptapContext = createContext<TiptapContextType>({} as TiptapContextType);
export const useTiptapContext = () => useContext(TiptapContext);

type TiptapProviderProps = {
  slotBefore?: ReactNode;
  slotAfter?: ReactNode;
  editorOptions: UseTiptapEditorOptions;
  editorProps?: HTMLAttributes<HTMLDivElement>;
  children?: ReactNode;
  className?: string;
  isBordered?: boolean;
};

export const TiptapProvider = ({ isBordered = true, className, children, editorOptions, slotBefore, slotAfter }: TiptapProviderProps) => {
  const contentElement = useRef<HTMLDivElement>(null);
  const editor = useTiptapEditor(editorOptions);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  if (!editor) {
    return null;
  }

  const focusEditorViaContainer = (event: React.MouseEvent) => {
    const target = event.target as Element;
    const content = contentElement.current;
    if (content && target.contains(content)) {
      content.style.display = 'flex';
      setTimeout(() => {
        content.style.display = '';
      }, 0);
    }
  };

  const editorContent = (
    <div className={cn('rte-editor', isBordered && 'bordered', isFullScreen && 'rte-editor--fullscreen', className)}>
      {slotBefore}
      <div className="rte-editor__container" onMouseDown={focusEditorViaContainer}>
        {isSourceMode ? <CodeMirrorEditor initialContent={editor.getHTML() || ''} /> : <EditorContent ref={contentElement} editor={editor} className="rte-editor__content" />}
      </div>
      {children}
      {slotAfter}
    </div>
  );

  return (
    <TiptapContext.Provider
      value={{
        editor,
        contentElement,
        isFullScreen,
        isResizing,
        isSourceMode,
        setIsResizing,
        toggleFullScreen: () => setIsFullScreen((prev) => !prev),
        toggleSourceMode: () => setIsSourceMode((prev) => !prev),
      }}>
      {editorContent}
    </TiptapContext.Provider>
  );
};

export default TiptapProvider;
