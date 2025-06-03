import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTyping } from '@ably/chat/react';
import { ImageIcon, Mail, MessageSquare, RadioTower, SendHorizontal, Smile } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SplitButton } from '@/components/custom-ui/split-button';

import { Hint } from '../hint';
import { EmojiPopover } from './emoji-popover';
import { ImagePreview } from './image-preview';

type EditorValue = {
  image: File | null;
  body: string;
  emailEnabled?: boolean;
  whatsAppEnabled?: boolean;
};

interface EditorProps {
  onSubmit: (value: EditorValue) => void;
  onCancel?: () => void;
  placeholder?: {
    paragraph?: string;
    imageCaption?: string;
  };
  defaultValue?: string;
  disabled?: boolean;
  whatsAppEnabled?: boolean;
  emailEnabled?: boolean;
  variant?: 'create' | 'update';
}

const Editor = ({ onCancel, onSubmit, disabled = false, defaultValue = '', variant = 'create', emailEnabled = false, whatsAppEnabled = false, placeholder }: EditorProps) => {
  const t = useTranslations('component.chat.editor');
  const [text, setText] = useState(defaultValue);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const imageElementRef = useRef<HTMLInputElement>(null);
  const textRef = useRef(text);
  const imageRef = useRef(image);

  const { keystroke, stop, error: typingError } = useTyping();

  // Sync refs with state
  useEffect(() => {
    textRef.current = text;
    imageRef.current = image;
  }, [text, image]);

  // Handle image preview
  useEffect(() => {
    if (!image) {
      setImagePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(image);
    setImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  // Check if content is empty
  const isEmptyContent = useCallback(() => !textRef.current.trim() && !imageRef.current, []);

  // Reset editor state
  const resetEditor = useCallback(() => {
    setText('');
    setImage(null);
    textRef.current = '';
    imageRef.current = null;
    if (imageElementRef.current) imageElementRef.current.value = '';
    stop();
  }, [stop]);

  // Create submit handlers with proper channel flags
  const createSubmitHandler = useCallback(
    (email: boolean, whatsApp: boolean) => {
      return () => {
        if (isEmptyContent()) return;

        onSubmit({
          body: textRef.current,
          image: imageRef.current,
          emailEnabled: email,
          whatsAppEnabled: whatsApp,
        });

        resetEditor();
      };
    },
    [isEmptyContent, onSubmit, resetEditor]
  );

  // Primary send handler
  const handleSendInApp = useMemo(() => createSubmitHandler(false, false), [createSubmitHandler]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isEmptyContent()) {
        handleSendInApp();
      } else {
        keystroke();
      }
    },
    [keystroke, handleSendInApp, isEmptyContent]
  );

  // Event handlers
  const handleBlur = useCallback(() => stop(), [stop]);
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value), []);
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setImage(e.target.files?.[0] || null), []);

  const removeImage = useCallback(() => {
    setImage(null);
    if (imageElementRef.current) imageElementRef.current.value = '';
  }, []);

  const handleEmojiSelect = useCallback(
    (emoji: { emoji: string }) => {
      setText((prev) => prev + emoji.emoji);
      keystroke();
    },
    [keystroke]
  );

  // Generate split button actions
  const splitActions = useMemo(() => {
    const actions = [
      {
        label: t('sendInApp'),
        icon: SendHorizontal,
        onClick: createSubmitHandler(false, false),
      },
    ];

    if (emailEnabled) {
      actions.push({
        label: t('sendInAppAndEmail'),
        icon: Mail,
        onClick: createSubmitHandler(true, false),
      });
    }

    if (whatsAppEnabled) {
      actions.push({
        label: t('sendInAppAndWhatsApp'),
        icon: MessageSquare,
        onClick: createSubmitHandler(false, true),
      });
    }

    if (emailEnabled && whatsAppEnabled) {
      actions.push({
        label: t('sendAll'),
        icon: RadioTower,
        onClick: createSubmitHandler(true, true),
      });
    }

    return actions;
  }, [t, emailEnabled, whatsAppEnabled, createSubmitHandler]);

  return (
    <Card className="flex flex-col focus-within:border-black shadow-none rounded-sm w-full">
      <input type="file" accept="image/*" ref={imageElementRef} onChange={handleImageChange} className="hidden" aria-label={t('uploadImage')} />

      <div className={cn('flex flex-col overflow-hidden gap-2', disabled && 'opacity-50')}>
        {imagePreview && <ImagePreview imagePreview={imagePreview} imageName={image?.name} disabled={disabled} onRemove={removeImage} removeImageLabel={t('removeImage')} altLabel={t('alt')} />}
        {typingError && <div className="px-2 py-1 text-xs text-red-500">{t('typingError', { error: typingError.message })}</div>}

        <div className={cn('w-full flex gap-2 resize-none rounded-md transition-colors px-2 py-1.5 min-h-[40px]')}>
          <textarea
            disabled={disabled}
            className="flex-1 h-full min-h-[inherit] outline-none bg-transparent border-none shadow-none"
            placeholder={placeholder?.paragraph || t('messageBody')}
            value={text}
            onChange={handleTextChange}
            onBlur={handleBlur}
            rows={1}
            aria-label={t('messageBody')}
            onKeyDown={handleKeyDown}
          />

          <div className="flex items-center justify-start gap-2">
            <EmojiPopover onEmojiSelect={handleEmojiSelect}>
              <Button disabled={disabled} size="sm" variant="ghost">
                <Smile className="size-4" />
                <span className="sr-only">{t('addEmoji')}</span>
              </Button>
            </EmojiPopover>

            {variant === 'create' && (
              <Hint label={t('addImage')}>
                <Button disabled={disabled} size="sm" variant="ghost" onClick={() => imageElementRef.current?.click()} aria-label={t('addImage')}>
                  <ImageIcon className="size-4" />
                </Button>
              </Hint>
            )}

            {variant === 'create' ? (
              <div className="flex items-center justify-start gap-2">
                <SplitButton swapPrimary disabled={disabled || isEmptyContent()} actions={splitActions} />
              </div>
            ) : (
              <div className="ml-auto flex items-center gap-x-2">
                <Button disabled={disabled} onClick={onCancel} size="sm" variant="outline">
                  {t('cancel')}
                </Button>
                <Button disabled={disabled || isEmptyContent()} onClick={handleSendInApp} size="sm" aria-label={t('save')}>
                  {t('save')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Editor;
