import { MessageSquareTextIcon, PencilIcon, SmileIcon, Trash2Icon } from 'lucide-react';

import { Hint } from '../hint';
import { Button } from '../ui/button';
import { EmojiPopover } from './emoji-popover';

interface ToolbarProps {
  isAuthor: boolean;
  isPending: boolean;
  handelEdit: () => void;
  handleThread: () => void;
  handleDelete: () => void;
  handleReaction: (value: string) => void;
  hideThreadButton?: boolean;
}

export const Toolbar = ({ handelEdit, handleDelete, handleThread, handleReaction, hideThreadButton, isAuthor, isPending }: ToolbarProps) => {
  return (
    <div className="absolute right-5 top-0">
      <div className="rounded-md border bg-white opacity-0 shadow-xs transition-opacity group-hover:opacity-100">
        <EmojiPopover hint="Add reaction" onEmojiSelect={(emoji) => handleReaction(emoji.native)}>
          <Button variant="ghost" size="sm" disabled={isPending}>
            <SmileIcon className="size-4" />
          </Button>
        </EmojiPopover>
        {!hideThreadButton && (
          <Hint label="Reply in thread">
            <Button onClick={handleThread} variant="ghost" size="sm" disabled={isPending}>
              <MessageSquareTextIcon className="size-4" />
            </Button>
          </Hint>
        )}
        {isAuthor && (
          <>
            <Hint label="Edit message">
              <Button onClick={handelEdit} variant="ghost" size="sm" disabled={isPending}>
                <PencilIcon className="size-4" />
              </Button>
            </Hint>
            <Hint label="Delete message">
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
