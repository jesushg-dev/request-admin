import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Content } from '@tiptap/react';
import { ALargeSmallIcon, ImageIcon, SendHorizonalIcon, Smile, XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import TiptapEditor, { type TiptapEditorRef } from '@/components/tip-tap/TiptapEditor';

import { Hint } from '../hint';
import { Button } from '../ui/button';
import { EmojiPopover } from './emoji-popover';

type EditorValue = {
  image: File | null;
  body: string;
};

interface EditorProps {
  onSubmit: ({ image, body }: EditorValue) => void;
  onCancel?: () => void;
  placeholder?: string;
  defaultValue?: Content;
  disabled?: boolean;
  variant?: 'create' | 'update';
}

const Editor = ({ onCancel, onSubmit, disabled = false, defaultValue = [], placeholder = 'Write something...', variant = 'create' }: EditorProps) => {
  const [text, setText] = useState<Content>('');
  const [image, setImage] = useState<File | null>(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);

  const submitRef = useRef(onSubmit);
  const disabledRef = useRef(disabled);
  const defaultValueRef = useRef(defaultValue);
  const placeholderRef = useRef(placeholder);
  const editorRef = useRef<TiptapEditorRef>(null);
  const imageElementRef = useRef<HTMLInputElement>(null);

  const toggleToolbar = () => setIsToolbarVisible((prev) => !prev);
  const isEmpty = useMemo(() => editorRef.current?.getInstance()?.isEmpty ?? true, []);

  useLayoutEffect(() => {
    submitRef.current = onSubmit;
    disabledRef.current = disabled;
    defaultValueRef.current = defaultValue;
    placeholderRef.current = placeholder;
  });

  return (
    <div className="flex flex-col">
      <input type="file" accept="image/*" ref={imageElementRef} onChange={(e) => setImage(e.target.files?.[0] || null)} className="hidden" />
      <div className={cn('flex flex-col overflow-hidden gap-2', disabled && 'opacity-50')}>
        <TiptapEditor
          containerClass="border-[0px]"
          hideMenuBar={isToolbarVisible}
          ref={editorRef}
          ssr={true}
          output="html"
          onContentChange={setText}
          hideStatusBar
          initialContent={text}
          contentMinHeight={100}
          contentMaxHeight={100}
        />
        {!!image && (
          <div className="p-2">
            <div className="ic group/image relative flex size-[62px] justify-center">
              <Hint label="Remove image">
                <button
                  onClick={() => {
                    setImage(null);
                    imageElementRef.current!.value = '';
                  }}
                  className="absolute -top-2.5 -right-2.5 z-4 hidden size-6 items-center justify-center rounded-full border-2">
                  <XIcon className="size3.5" />
                </button>
              </Hint>
              <Image src={URL.createObjectURL(image)} alt="Uploaded" fill className="overflow-hidden rounded-xl border object-cover" />
            </div>
          </div>
        )}
        <div className="z-5 flex px-2">
          <Hint label={isToolbarVisible ? 'Hide formatting' : 'Show formatting'}>
            <Button disabled={disabled} size="sm" variant="ghost" onClick={toggleToolbar}>
              <ALargeSmallIcon className="size-4" />
            </Button>
          </Hint>
          <EmojiPopover onEmojiSelect={console.log}>
            <Button disabled={disabled} size="sm" variant="ghost">
              <Smile className="size-4" />
            </Button>
          </EmojiPopover>
          {variant === 'create' && (
            <Hint label="Image">
              <Button disabled={disabled} size="sm" variant="ghost" onClick={() => imageElementRef.current?.click()}>
                <ImageIcon className="size-4" />
              </Button>
            </Hint>
          )}
          {/* CREATE VARIANT */}
          {variant === 'create' ? (
            <Button
              size="sm"
              disabled={disabled || isEmpty}
              onClick={() =>
                onSubmit({
                  body: JSON.stringify(text),
                  image,
                })
              }
              className={cn('ml-auto', isEmpty ? 'text-muted-foreground ' : '')}>
              <SendHorizonalIcon className="size-4" />
            </Button>
          ) : (
            <div className="ml-auto flex items-center gap-x-2">
              {/* UPDATE VARIANT */}
              <Button disabled={disabled} onClick={onCancel} size="sm" variant="outline">
                Cancel
              </Button>
              <Button
                disabled={disabled || isEmpty}
                onClick={() =>
                  onSubmit({
                    body: JSON.stringify(text),
                    image,
                  })
                }
                size="sm">
                Save
              </Button>
            </div>
          )}
        </div>
      </div>
      {variant === 'create' && (
        <div className={cn('text-muted-foreground flex justify-end p-2 text-[10px] opacity-0 transition', !isEmpty && 'opacity-100')}>
          <p>
            <strong>Shift + Enter</strong> to add a new line
          </p>
        </div>
      )}
    </div>
  );
};

export default Editor;
