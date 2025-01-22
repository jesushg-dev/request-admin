import { useEffect, useMemo, useState } from 'react';
import { InfiniteData } from '@tanstack/react-query';
import { differenceInMinutes, format } from 'date-fns';
import { useInView } from 'react-intersection-observer';

import { MessageType } from '@/types/prisma/message';
import { formatDateLabel, TIME_THRESHOLD } from '@/lib/utils';

import { ChannelHero } from '../channel-hero';
import { ConversationHero } from '../conversation-hero';
import { Spinner } from '../spinner';
import { Button } from '../ui/button';
import { Message } from './message';

interface MessageListProps {
  data: InfiniteData<Array<MessageType>> | undefined;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  fetchNextPage: () => void;
  fetchPreviousPage: () => void;
  isFetchingNextPage: boolean;
  isFetchingPreviousPage: boolean;
  isFetching: boolean;
  currentUserId: string;
  variant?: 'channel' | 'thread' | 'conversation';
  channelCreationTime?: number;
  channelName?: string;
  userImage?: string;
  userName?: string;
}

export const MessageList = ({
  data,
  hasNextPage,
  hasPreviousPage,
  fetchNextPage,
  fetchPreviousPage,
  isFetchingNextPage,
  isFetchingPreviousPage,
  isFetching,
  currentUserId,
  variant = 'channel',
  channelCreationTime,
  channelName,
  userImage,
  userName,
}: MessageListProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const { ref, inView } = useInView();

  // Flatten messages from InfiniteData
  const allMessages = useMemo(() => data?.pages.flat() || [], [data]);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    return allMessages.reduce(
      (groups, message) => {
        const date = new Date(message.createdAt);
        const dateKey = format(date, 'yyyy-MM-dd');

        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].unshift(message);

        return groups;
      },
      {} as Record<string, MessageType[]>
    );
  }, [allMessages]);

  // Automatically load more when in view
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="messages-scrollbar flex flex-1 flex-col-reverse overflow-y-auto pb-4">
      <div className="mb-2 flex justify-between">
        {/* Load Older Messages */}
        <Button onClick={fetchPreviousPage} disabled={!hasPreviousPage || isFetchingPreviousPage} size="sm" variant="ghost">
          {isFetchingPreviousPage ? 'Loading Older...' : hasPreviousPage ? 'Load Older' : 'No Older Messages'}
        </Button>
        {/* Load Newer Messages */}
        <Button ref={ref} onClick={fetchNextPage} disabled={!hasNextPage || isFetchingNextPage} size="sm" variant="ghost">
          {isFetchingNextPage ? 'Loading Newer...' : hasNextPage ? 'Load Newer' : 'No Newer Messages'}
        </Button>
      </div>

      {Object.entries(groupedMessages).map(([dateKey, messages]) => (
        <div key={dateKey}>
          <div className="relative my-2 text-center">
            <hr className="absolute left-0 right-0 top-1/2 border-t border-gray-300" />
            <span className="relative inline-block rounded-full border border-gray-300 bg-white px-4 py-1 text-xs shadow-sm">{formatDateLabel(dateKey)}</span>
          </div>
          {messages.map((message, index) => {
            const prevMsg = messages[index - 1];
            const isSameAuthor = prevMsg && prevMsg.userTenant.id === message.userTenant.id && differenceInMinutes(message.createdAt, prevMsg.createdAt) < TIME_THRESHOLD;

            return (
              <Message
                key={message.id}
                id={message.id}
                userId={message.userTenant.user.id}
                authorImage={message.userTenant.person?.image}
                currentUserId={currentUserId}
                authorName={message.userTenant.person ? `${message.userTenant.person.firstName} ${message.userTenant.person.lastName}` : message.userTenant.user.email}
                reactions={message.reactions}
                body={message.body}
                image={message.imageId}
                isEditing={editingId === message.id}
                setEditingId={setEditingId}
                updatedAt={message.updatedAt}
                createdAt={message.createdAt}
                //threadCount={message.threadCount}
                //threadImage={message.threadImage}
                //threadName={message.threadName}
                //threadTimestamp={message.threadTimestamp}
                hideThreadButton={variant === 'thread'}
                isCompact={isSameAuthor}
              />
            );
          })}
        </div>
      ))}
      {isFetching && !isFetchingNextPage && (
        <div className="relative my-2 text-center">
          <Spinner />
        </div>
      )}
      {variant === 'channel' && channelName && channelCreationTime && <ChannelHero name={channelName} creationTime={channelCreationTime} />}
      {variant === 'conversation' && <ConversationHero name={userName} image={userImage} />}
    </div>
  );
};
