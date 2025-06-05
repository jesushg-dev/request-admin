import { useEffect, useMemo, useState } from 'react';
import { useInfiniteFindManyMessage } from '@/services/api/hooks';
import { ChatMessageEventType } from '@ably/chat';
import { useMessages as useAblyMessages } from '@ably/chat/react';
import type { Prisma } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { useInView } from 'react-intersection-observer';

import { MessageDefaultArgs, MessageType } from '@/types/prisma/message';
import { ablyToAppMessage } from '@/lib/ablyChat';

import { Spinner } from '../spinner';
import { Button } from '../ui/button';
import { ChannelHero } from './channel-hero';
import { ConversationHero } from './conversation-hero';
import { MessageGroup } from './message-group';

interface MessageListProps {
  where: Prisma.MessageWhereInput;
  orderBy?: Prisma.MessageOrderByWithRelationInput | Prisma.MessageOrderByWithRelationInput[];
  currentUserTenantId: string;
  variant: 'channel' | 'thread' | 'conversation';
  channelCreatedAt?: Date;
  channelName?: string;
  userImage?: string | null;
  userName?: string | null;
  userId?: string;
  tenantId: string;
}

export const MessageList = ({ where, orderBy, currentUserTenantId, variant, channelCreatedAt, channelName, userImage, userName, userId, tenantId }: MessageListProps) => {
  const t = useTranslations('component.chat.messageList');

  const [realTimeMessages, setRealTimeMessages] = useState<MessageType[]>([]);

  useAblyMessages({
    listener: (event) => {
      if (event.type === ChatMessageEventType.Created) {
        const newMessage = ablyToAppMessage(event.message);
        setRealTimeMessages((prev) => [...prev, newMessage]);
      }
      if (event.type === ChatMessageEventType.Updated) {
        const updatedMessage = ablyToAppMessage(event.message);
        setRealTimeMessages((prev) => prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg)));
      }
      if (event.type === ChatMessageEventType.Deleted) {
        const deletedMessage = ablyToAppMessage(event.message);
        setRealTimeMessages((prev) => prev.filter((msg) => msg.id !== deletedMessage.id));
      }
    },
  });

  const { data, hasNextPage, hasPreviousPage, fetchNextPage, fetchPreviousPage, isFetchingNextPage, isFetchingPreviousPage, isFetching, error } = useInfiniteFindManyMessage({
    ...MessageDefaultArgs,
    where,
    orderBy: orderBy ? orderBy : { createdAt: 'desc' },
  });

  const { ref, inView } = useInView();

  const historicalMessages = useMemo(() => data?.pages.flat() || [], [data]);
  const allMessages = useMemo(() => {
    return [...historicalMessages, ...realTimeMessages];
  }, [historicalMessages, realTimeMessages]);

  const groupedMessages = useMemo(() => {
    const groups: Record<string, MessageType[]> = {};

    for (const message of allMessages) {
      const dateKey = message.createdAt.toDateString();

      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].unshift(message);
    }

    return groups;
  }, [allMessages]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      const timer = setTimeout(() => {
        fetchNextPage();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">{t('errorLoading', { message: error.message })}</p>
      </div>
    );
  }

  return (
    <div className=" flex w-full flex-1 flex-col-reverse overflow-y-auto pb-4">
      <Button ref={ref} onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage} size="sm" variant="ghost">
        {isFetchingNextPage ? t('loadingNewer') : hasNextPage ? t('loadNewer') : t('noNewer')}
      </Button>

      {!data || allMessages.length === 0 ? (
        <p className="text-gray-500 mb-4 w-full text-center">{t('noMessages')}</p>
      ) : (
        <>
          {Object.entries(groupedMessages).map(([dateKey, messages]) => (
            <MessageGroup key={dateKey} dateKey={dateKey} messages={messages} tenantId={tenantId} currentUserTenantId={currentUserTenantId} variant={variant} />
          ))}
        </>
      )}

      {isFetching && !isFetchingNextPage && (
        <div className="relative my-2 text-center">
          <Spinner />
        </div>
      )}

      <Button onClick={() => fetchPreviousPage()} disabled={!hasPreviousPage || isFetchingPreviousPage} size="sm" variant="ghost">
        {isFetchingPreviousPage ? t('loadingOlder') : hasPreviousPage ? t('loadOlder') : t('noOlder')}
      </Button>

      {variant === 'channel' && <ChannelHero name={channelName} creationTime={channelCreatedAt} />}
      {variant === 'conversation' && <ConversationHero name={userName} image={userImage} userId={userId} />}
    </div>
  );
};
