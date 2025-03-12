'use client';

import { forwardRef, useMemo, useState } from 'react';
import RichTextEditor, { type Editor } from 'reactjs-tiptap-editor';
import {
  Attachment,
  BaseKit,
  Blockquote,
  Bold,
  BulletList,
  Clear,
  Code,
  CodeBlock,
  Color,
  ColumnActionButton,
  Emoji,
  Excalidraw,
  ExportPdf,
  ExportWord,
  FontFamily,
  FontSize,
  FormatPainter,
  Heading,
  Highlight,
  History,
  HorizontalRule,
  Iframe,
  Image,
  ImportWord,
  Indent,
  Italic,
  LineHeight,
  Link,
  Mention,
  MoreMark,
  OrderedList,
  SearchAndReplace,
  SlashCommand,
  Strike,
  Table,
  TableOfContents,
  TaskList,
  TextAlign,
  TextDirection,
  Underline,
  Video,
} from 'reactjs-tiptap-editor/extension-bundle';

import './richtext-editor.css';

import { useTheme } from 'next-themes';

export type TiptapEditorRef = {
  editor: Editor | null;
};

function convertBase64ToBlob(base64: string): Blob {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mime });
}

const extensions = [
  BaseKit.configure({
    placeholder: {
      showOnlyCurrent: true,
    },
    characterCount: {
      limit: 50000,
    },
  }),
  History,
  SearchAndReplace,
  TableOfContents,
  FormatPainter.configure({ spacer: true }),
  Clear,
  FontFamily,
  Heading.configure({ spacer: true }),
  FontSize,
  Bold,
  Italic,
  Underline,
  Strike,
  MoreMark,
  Emoji,
  Color.configure({ spacer: true }),
  Highlight,
  BulletList,
  OrderedList,
  TextAlign.configure({ types: ['heading', 'paragraph'], spacer: true }),
  Indent,
  LineHeight,
  TaskList.configure({
    spacer: true,
    taskItem: {
      nested: true,
    },
  }),
  Link,
  Image.configure({
    upload: (file: File) =>
      new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve(URL.createObjectURL(file));
        }, 500);
      }),
  }),
  Video.configure({
    upload: (file: File) =>
      new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve(URL.createObjectURL(file));
        }, 500);
      }),
  }),
  Blockquote,
  SlashCommand,
  HorizontalRule,
  Code.configure({
    toolbar: false,
  }),
  CodeBlock.configure({ defaultTheme: 'dracula' }),
  ColumnActionButton,
  Table,
  Iframe,
  ExportPdf.configure({ spacer: true }),
  ImportWord.configure({
    upload: (files: File[]) => {
      const fileObjs = files.map((file) => ({
        src: URL.createObjectURL(file),
        alt: file.name,
      }));
      return Promise.resolve(fileObjs);
    },
  }),
  ExportWord,
  Excalidraw,
  TextDirection,
  Mention,
  Attachment.configure({
    upload: (file: File) =>
      new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const result = reader.result as string;
          const blob = convertBase64ToBlob(result);
          resolve(URL.createObjectURL(blob));
        };
      }),
  }),
];

const DEFAULT = `<p dir="auto"></p>`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

interface ReactEditorProps {
  ssr?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  initialContent?: string;
  placeholder?: {
    paragraph?: string;
    imageCaption?: string;
  };
  output?: 'html' | 'json';
  hideMenuBar?: boolean;
  hideStatusBar?: boolean;
  hideBubbleMenu?: boolean;
  containerClass?: string;
  menuBarClass?: string;
  contentClass?: string;
  isBordered?: boolean;
  contentMinHeight?: string | number;
  contentMaxHeight?: string | number;
  onContentChange?: (content: string) => void;
}

const ReactEditor = forwardRef<TiptapEditorRef, ReactEditorProps>((props, ref) => {
  const { onContentChange, contentMinHeight = 256, contentMaxHeight = 640, initialContent, hideMenuBar, hideBubbleMenu } = props;
  const { theme } = useTheme();
  const [content, setContent] = useState<string>(initialContent || DEFAULT);

  const onValueChange = useMemo(
    () =>
      debounce((value: string) => {
        setContent(value);
        onContentChange?.(value);
      }, 300),
    [setContent, onContentChange]
  );

  return (
    <RichTextEditor
      ref={ref}
      output="html"
      content={content}
      onChangeContent={onValueChange}
      extensions={extensions}
      dark={theme === 'dark'}
      minHeight={contentMinHeight}
      maxHeight={contentMaxHeight}
      hideToolbar={hideMenuBar}
      hideBubble={hideBubbleMenu}
      dense
      removeDefaultWrapper
    />
  );
});

ReactEditor.displayName = 'ReactEditor';

export default ReactEditor;
