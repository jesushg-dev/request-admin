import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ALargeSmallIcon, ImageIcon, Mail, MessageSquare, SendHorizonalIcon, Smile, XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Toggle } from '@/components/ui/toggle';

import { Hint } from '../hint';
import { EmojiPopover } from './emoji-popover';

type EditorValue = {
  image: File | null;
  body: string;
  isEmailNotificationEnabled?: boolean;
  isWhatsAppNotificationEnabled?: boolean;
};

interface EditorProps {
  onSubmit: ({ image, body }: EditorValue) => void;
  onCancel?: () => void;
  placeholder?: {
    paragraph?: string;
    imageCaption?: string;
  };
  defaultValue?: string;
  disabled?: boolean;
  variant?: 'create' | 'update';
}

const Editor = ({ onCancel, onSubmit, disabled = false, defaultValue = '', variant = 'create' }: EditorProps) => {
  const [text] = useState<string>(defaultValue);
  const [image, setImage] = useState<File | null>(null);
  const [sendEmail, setSendEmail] = useState(false);
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const [isToolbarHidden, setIsToolbarHidden] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const imageElementRef = useRef<HTMLInputElement>(null);

  const toggleToolbar = () => setIsToolbarHidden((prev) => !prev);

  useEffect(() => {
    if (image) {
      const objectUrl = URL.createObjectURL(image);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [image]);

  const handleSubmit = () => {
    onSubmit({ body: text as string, image, isEmailNotificationEnabled: sendEmail, isWhatsAppNotificationEnabled: sendWhatsApp });
  };

  const isEmptyContent = () => {
    return false;
  };

  return (
    <Card className="flex flex-col">
      <input type="file" accept="image/*" ref={imageElementRef} onChange={(e) => setImage(e.target.files?.[0] || null)} className="hidden" aria-label="Upload image" />

      <div className={cn('flex flex-col overflow-hidden gap-2', disabled && 'opacity-50')}>
        {imagePreview && (
          <div className="p-2">
            <div className="group/image relative flex size-[62px] justify-center">
              <Hint label="Remove image">
                <button
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                    if (imageElementRef.current) imageElementRef.current.value = '';
                  }}
                  className="absolute -top-2.5 -right-2.5 z-10 flex size-6 items-center justify-center rounded-full border-2 bg-background transition-opacity opacity-0 group-hover/image:opacity-100"
                  aria-label="Remove image">
                  <XIcon className="size-3.5" />
                </button>
              </Hint>
              <Image src={imagePreview} alt="Uploaded content preview" fill className="overflow-hidden rounded-xl border object-cover" />
            </div>
          </div>
        )}

        <div className="flex px-2 py-1.5 gap-2 items-center justify-between">
          <div className="flex items-center justify-start gap-2">
            <Hint label={isToolbarHidden ? 'Show formatting' : 'Hide formatting'}>
              <Button disabled={disabled} size="sm" variant="ghost" onClick={toggleToolbar}>
                <ALargeSmallIcon className="size-4" />
              </Button>
            </Hint>

            <EmojiPopover onEmojiSelect={console.log}>
              <Button disabled={disabled} size="sm" variant="ghost">
                <Smile className="size-4" />
                <span className="sr-only">Add emoji</span>
              </Button>
            </EmojiPopover>

            {variant === 'create' && (
              <Hint label="Add image">
                <Button disabled={disabled} size="sm" variant="ghost" onClick={() => imageElementRef.current?.click()} aria-label="Add image">
                  <ImageIcon className="size-4" />
                </Button>
              </Hint>
            )}
          </div>

          {variant === 'create' ? (
            <div className="flex items-center justify-start gap-2">
              <Toggle
                pressed={sendEmail}
                onPressedChange={setSendEmail}
                aria-label="Send email notification"
                size="sm"
                className="data-[state=on]:border-primary data-[state=on]:bg-primary/20 data-[state=on]:text-primary">
                <Mail className="h-4 w-4" />
              </Toggle>
              <Toggle
                pressed={sendWhatsApp}
                onPressedChange={setSendWhatsApp}
                aria-label="Send WhatsApp notification"
                size="sm"
                className="data-[state=on]:border-primary data-[state=on]:bg-primary/20 data-[state=on]:text-primary">
                <MessageSquare className="h-4 w-4" />
              </Toggle>

              <Button size="sm" disabled={disabled || isEmptyContent()} onClick={handleSubmit} className={cn(isEmptyContent() ? 'text-muted-foreground' : '')} aria-label="Submit content">
                <SendHorizonalIcon className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="ml-auto flex items-center gap-x-2">
              <Button disabled={disabled} onClick={onCancel} size="sm" variant="outline">
                Cancel
              </Button>
              <Button disabled={disabled || isEmptyContent()} onClick={handleSubmit} size="sm" aria-label="Save changes">
                Save
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Editor;
