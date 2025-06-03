import { EmojiClickData } from 'emoji-picker-react';
import { MessageSquareTextIcon, PencilIcon, SmileIcon, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Hint } from '../hint';
import { Button } from '../ui/button';
import { EmojiPopover } from './emoji-popover';

interface ToolbarProps {
  isAuthor: boolean;
  isPending: boolean;
  handelEdit: () => void;
  handleThread: () => void;
  handleDelete: () => void;
  handleReaction: (value: EmojiClickData) => void;
  hideThreadButton?: boolean;
}

export const Toolbar = ({ handelEdit, handleDelete, handleThread, handleReaction, hideThreadButton, isAuthor, isPending }: ToolbarProps) => {
  const t = useTranslations('component.chat.message.toolbar');

  return (
    <div className="absolute -top-2 right-5">
      <div className="rounded-md border opacity-0 shadow-xs transition-opacity group-hover:opacity-100 bg-card">
        <EmojiPopover hint={t('addReaction')} onEmojiSelect={handleReaction}>
          <Button variant="ghost" size="sm" disabled={isPending}>
            <SmileIcon className="size-4" />
          </Button>
        </EmojiPopover>
        {!hideThreadButton && (
          <Hint label={t('replyThread')}>
            <Button onClick={handleThread} variant="ghost" size="sm" disabled={isPending}>
              <MessageSquareTextIcon className="size-4" />
            </Button>
          </Hint>
        )}
        {isAuthor && (
          <>
            <Hint label={t('editMessage')}>
              <Button onClick={handelEdit} variant="ghost" size="sm" disabled={isPending}>
                <PencilIcon className="size-4" />
              </Button>
            </Hint>
            <Hint label={t('deleteMessage')}>
              <Button onClick={handleDelete} variant="ghost" size="sm" disabled={isPending}>
                <Trash2Icon className="size-4" />
              </Button>
            </Hint>
          </>
        )}
      </div>
    </div>
  );
};
