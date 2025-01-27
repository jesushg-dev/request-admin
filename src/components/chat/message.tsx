import { useState } from 'react';
import dynamic from 'next/dynamic';
import { toggleReaction } from '@/actions/message';
import { useDeleteMessage, useUpdateMessage } from '@/services/api/hooks';
import { format, isToday, isYesterday } from 'date-fns';
import { toast } from 'sonner';

import { MessageType } from '@/types/prisma/message';
import useMessage from '@/lib/message';
import { cn } from '@/lib/utils';
import { usePanel } from '@/hooks/use-panel';

import { Hint } from '../hint';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Reactions } from './reactions';
import { ThreadBar } from './thread-bar';
import { Thumbnail } from './thumbnail';
import { Toolbar } from './toolbar';
import { UpdatedAtText } from './updated-at-text';

const Editor = dynamic(() => import('@/components/chat/editor'), { ssr: false });
const Renderer = dynamic(() => import('@/components/chat/renderer'), { ssr: false });

interface MessageProps {
  id: string;
  userId: string;
  authorImage?: string | null;
  authorName?: string;
  currentUserId: string;
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

const formatFullTime = (date: Date) => {
  return `${isToday(date) ? 'Today' : isYesterday(date) ? 'Yesterday' : format(date, 'MMM d, yyyy')} at ${format(date, 'h:mm:ss a')}`;
};

export const Message = ({
  body,
  createdAt,
  updatedAt,
  id,
  image,
  threadTimestamp,
  threadImage,
  currentUserId,
  authorImage,
  authorName = 'user',
  isEditing,
  isCompact,
  setEditingId,
  hideThreadButton,
  threadCount,
  userId,
  reactions,
  threadName,
}: MessageProps) => {
  const message = useMessage();
  const { onOpenMessage, onClose, parentMessageId, onOpenProfile } = usePanel();

  const avatarFallback = authorName.charAt(0).toUpperCase();

  const [isTogglingReaction, setTogglingReaction] = useState(false);
  const { mutateAsync: updateMessage, isPending: isUpdatingMessage } = useUpdateMessage();
  const { mutateAsync: removeMessage, isPending: isRemovingMessage } = useDeleteMessage();

  const isPending = isUpdatingMessage || isRemovingMessage || isTogglingReaction;

  const handleReaction = (value: string) => {
    try {
      setTogglingReaction(true);
      toggleReaction({ messageId: id, value, tenantId: '1', userTenantId: '1' });
    } catch (error) {
      console.error(error);
    } finally {
      setTogglingReaction(false);
    }
  };

  const handleRemove = async () => {
    const ok = await message.showConfirm('Are you sure you want to delete this message? This action cannot be undone.', 'Delete message');

    if (!ok) return;

    try {
      await removeMessage({ where: { id } });
      toast.success('Message deleted');

      if (parentMessageId === id) onClose();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleUpdate = async ({ body }: { body: string }) => {
    try {
      await updateMessage({
        data: { body },
        where: { id },
      });
      toast.success('Message updated');
      setEditingId(null);
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Failed to update message');
    }
  };

  if (isCompact) {
    return (
      <div
        className={cn(
          'hover:bg-fade-200/60 group relative flex flex-col gap-2 p-1.5 px-5',
          isEditing && 'bg-paleyellow-100 hover:bg-paleyellow-100',
          isRemovingMessage && 'origin-bottom scale-y-0 transform bg-rose-500/50 transition-all duration-200'
        )}>
        <div className="flex items-start gap-2">
          <Hint label={createdAt ? formatFullTime(createdAt) : 'N/A'}>
            <button className="text-muted-foreground w-[40px] text-center text-xs leading-[22px] opacity-0 group-hover:opacity-100 hover:underline">
              {createdAt ? format(createdAt, 'hh:mm') : 'N/A'}
            </button>
          </Hint>
          {isEditing ? (
            <div className="size-full">
              <Editor onSubmit={handleUpdate} disabled={isPending} defaultValue={JSON.parse(body)} onCancel={() => setEditingId(null)} variant="update" />
            </div>
          ) : (
            <div className="flex w-full flex-col overflow-hidden">
              <Renderer value={body} />
              <Thumbnail url={image} />
              <UpdatedAtText createdAt={createdAt} updatedAt={updatedAt} />
              <Reactions data={reactions} onChange={handleReaction} currentUserId={currentUserId} />
              <ThreadBar count={threadCount} image={threadImage} timestamp={threadTimestamp} name={threadName} onClick={() => onOpenMessage(id)} />
            </div>
          )}
        </div>
        {!isEditing && (
          <Toolbar
            isPending={isPending}
            isAuthor={currentUserId === userId}
            handelEdit={() => setEditingId(id)}
            handleThread={() => onOpenMessage(id)}
            handleDelete={handleRemove}
            handleReaction={handleReaction}
            hideThreadButton={hideThreadButton}
          />
        )}
      </div>
    );
  }

  // ELSE
  return (
    <div
      className={cn(
        'hover:bg-fade-200/60 group relative flex flex-col gap-2 p-1.5 px-5',
        isEditing && 'bg-paleyellow-100 hover:bg-paleyellow-100',
        isRemovingMessage && 'origin-bottom scale-y-0 transform bg-rose-500/50 transition-all duration-200'
      )}>
      <div className="flex items-center gap-2">
        <button onClick={() => onOpenProfile(userId)}>
          <Avatar>
            <AvatarImage src={authorImage || ''} alt={authorName} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        </button>
        {isEditing ? (
          <div className="size-full">
            <Editor onSubmit={handleUpdate} disabled={isPending} defaultValue={JSON.parse(body)} onCancel={() => setEditingId(null)} variant="update" />
          </div>
        ) : (
          //  IS NOT EDITING
          <div className="flex w-full flex-col overflow-hidden">
            <div className="text-sm">
              <button onClick={() => onOpenProfile(userId)} className="text-primary font-semibold hover:underline">
                {authorName}
              </button>
              <span>&nbsp;&nbsp;</span>
              <Hint label={createdAt ? formatFullTime(createdAt) : 'N/A'}>
                <button className="text-muted-foreground text-xs hover:underline">{createdAt ? format(createdAt, 'h:mm a') : 'N/A'}</button>
              </Hint>
            </div>
            <Renderer value={body} />
            <Thumbnail url={image} />
            <UpdatedAtText createdAt={createdAt} updatedAt={updatedAt} />
            <Reactions data={reactions} onChange={handleReaction} currentUserId={currentUserId} />
            <ThreadBar count={threadCount} image={threadImage} name={threadName} timestamp={threadTimestamp} onClick={() => onOpenMessage(id)} />
          </div>
        )}
      </div>
      {!isEditing && (
        <Toolbar
          isPending={isPending}
          isAuthor={currentUserId === userId}
          handelEdit={() => setEditingId(id)}
          handleThread={() => onOpenMessage(id)}
          handleDelete={handleRemove}
          handleReaction={handleReaction}
          hideThreadButton={hideThreadButton}
        />
      )}
    </div>
  );
};
