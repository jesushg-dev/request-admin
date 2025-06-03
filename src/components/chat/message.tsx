import { useTransition, type FC } from 'react';
import dynamic from 'next/dynamic';
import { deleteReaction, removeMessage, updateMessage, upsertReaction } from '@/actions/message';
import { EmojiClickData } from 'emoji-picker-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { MessageType } from '@/types/prisma/message';
import useMessage from '@/lib/message';
import { cn } from '@/lib/utils';
import { useFormatTime } from '@/hooks/use-format-time';
import { usePanel } from '@/hooks/use-panel';

import { Hint } from '../hint';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { MessageContent } from './message-content';
import { Toolbar } from './toolbar';

const Editor = dynamic(() => import('@/components/chat/editor'), { ssr: false });

interface MessageProps {
  id: string;
  tenantId: string;
  authorName?: string;
  authorImage?: string | null;
  userTenantId: string;
  currentUserTenantId: string;
  reactions: MessageType['reactions'];
  body: string;
  image: string | null | undefined;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  isEditing: boolean;
  isCompact?: boolean;
  setEditingId: (id: string | null) => void;
  hideThreadButton?: boolean;
  threadCount?: number;
  threadImage?: string;
  threadName?: string;
  threadTimestamp?: number;
}

export const Message: FC<MessageProps> = ({
  id,
  tenantId,
  body,
  createdAt,
  updatedAt,
  image,
  threadTimestamp,
  threadImage,
  userTenantId,
  currentUserTenantId,
  authorImage,
  authorName = 'user',
  isEditing,
  isCompact,
  setEditingId,
  hideThreadButton,
  threadCount,
  reactions,
  threadName,
}) => {
  const t = useTranslations('component.chat.message');
  const message = useMessage();
  const { now, format } = useFormatTime();
  const { onOpenMessage, onClose, parentMessageId, onOpenProfile } = usePanel();

  const avatarFallback = authorName.charAt(0).toUpperCase();

  const [isPending, startTransition] = useTransition();
  const [isRemovingMessage, startRemovingTransition] = useTransition();

  const handleReaction = (value: EmojiClickData) => {
    startTransition(() => {
      try {
        upsertReaction({
          messageId: id,
          userTenantId: currentUserTenantId,
          tenantId,
          value: value.emoji,
        });
      } catch (error) {
        console.error(error);
      }
    });
  };

  const handleRemoveReaction = (reactionId: string) => {
    startTransition(() => {
      try {
        deleteReaction({ id: reactionId });
      } catch (error) {
        console.error(error);
      }
    });
  };

  const handleRemove = async () => {
    const ok = await message.confirm(t('delete.confirm'), {
      title: t('delete.title'),
      confirmText: t('delete.button'),
      cancelText: t('delete.cancel'),
    });

    if (!ok) return;
    startRemovingTransition(async () => {
      try {
        await removeMessage({ id });
        toast.success(t('delete.success'));
        if (parentMessageId === id) onClose();
      } catch (error) {
        console.error('Error deleting message:', error);
        toast.error(t('delete.error'));
      }
    });
  };

  const handleUpdate = async ({ body }: { body: string }) => {
    startTransition(async () => {
      try {
        await updateMessage({ id, body });
        toast.success(t('update.success'));
        setEditingId(null);
      } catch (error) {
        console.error('Error updating message:', error);
        toast.error(t('update.error'));
      }
    });
  };

  const containerClasses = cn(
    'w-full hover:border-muted border border-transparent rounded-sm group relative flex flex-col gap-2 p-1.5 px-5',
    isEditing && 'bg-secondary hover:bg-secondary',
    isRemovingMessage && 'origin-bottom scale-y-0 transform bg-rose-500/50 transition-all duration-200'
  );

  const timestamp = createdAt
    ? format.dateTime(createdAt, isCompact ? { hour: 'numeric', minute: 'numeric' } : { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A';

  return (
    <div className={containerClasses}>
      <div className="flex items-start gap-2">
        {isCompact ? (
          <Hint label={createdAt ? format.relativeTime(createdAt, now) : 'N/A'}>
            <span className="text-muted-foreground w-[40px] text-center text-xs leading-[22px] opacity-0 group-hover:opacity-100 hover:underline">{timestamp}</span>
          </Hint>
        ) : (
          <button type="button" onClick={() => onOpenProfile(userTenantId)}>
            <Avatar>
              <AvatarImage src={authorImage || ''} alt={authorName} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
          </button>
        )}

        <div className="flex w-full flex-col overflow-hidden items-start">
          {!isCompact && (
            <div className="text-sm">
              <button type="button" onClick={() => onOpenProfile(userTenantId)} className="text-primary font-semibold hover:underline">
                {authorName}
              </button>
              <span>&nbsp;&nbsp;</span>
              <Hint label={createdAt ? format.relativeTime(createdAt, now) : 'N/A'}>
                <button type="button" className="text-muted-foreground text-xs hover:underline">
                  {timestamp}
                </button>
              </Hint>
            </div>
          )}

          {isEditing ? (
            <Editor onSubmit={handleUpdate} disabled={isPending} defaultValue={body} onCancel={() => setEditingId(null)} variant="update" />
          ) : (
            <MessageContent
              id={id}
              body={body}
              image={image}
              createdAt={createdAt}
              updatedAt={updatedAt}
              reactions={reactions}
              threadCount={threadCount}
              threadImage={threadImage}
              threadName={threadName}
              threadTimestamp={threadTimestamp}
              currentUserTenantId={currentUserTenantId}
              onOpenMessage={onOpenMessage}
              handleRemoveReaction={handleRemoveReaction}
            />
          )}
        </div>
      </div>

      {!isEditing && (
        <Toolbar
          isPending={isPending}
          handleDelete={handleRemove}
          handleReaction={handleReaction}
          handelEdit={() => setEditingId(id)}
          handleThread={() => onOpenMessage(id)}
          isAuthor={currentUserTenantId === userTenantId}
          hideThreadButton={hideThreadButton}
        />
      )}
    </div>
  );
};
