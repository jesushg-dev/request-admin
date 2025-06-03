import { useCallback, useEffect, useMemo, useState } from 'react';
import { useInfiniteFindManyMessage } from '@/services/api/hooks';
import { Message as AblyMessage, MessageEvent, MessageEvents } from '@ably/chat';
import { useMessages as useAblyMessages } from '@ably/chat/react';
import type { Prisma } from '@prisma/client';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useInView } from 'react-intersection-observer';

import { MessageDefaultArgs, MessageType } from '@/types/prisma/message';

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

  /*const { send: sendAblyMessage, update: updateAblyMessage } = */ useAblyMessages({
    listener: (event: MessageEvent) => {
      if (event.type === MessageEvents.Created) {
        const newMessage = convertAblyMessageToOurType(event.message);
        setRealTimeMessages((prev) => [...prev, newMessage]);
      }
      if (event.type === MessageEvents.Updated) {
        const updatedMessage = convertAblyMessageToOurType(event.message);
        setRealTimeMessages((prev) => prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg)));
      }
      if (event.type === MessageEvents.Deleted) {
        const deletedMessage = convertAblyMessageToOurType(event.message);
        setRealTimeMessages((prev) => prev.filter((msg) => msg.id !== deletedMessage.id));
      }
    },
  });

  const { data, hasNextPage, hasPreviousPage, fetchNextPage, fetchPreviousPage, isFetchingNextPage, isFetchingPreviousPage, isFetching, error } = useInfiniteFindManyMessage({
    ...MessageDefaultArgs,
    where,
    orderBy: orderBy ? orderBy : { createdAt: 'desc' },
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const { ref, inView } = useInView();

  const historicalMessages = useMemo(() => data?.pages.flat() || [], [data]);
  const allMessages = useMemo(() => {
    return [...historicalMessages, ...realTimeMessages];
  }, [historicalMessages, realTimeMessages]);

  const groupedMessages = useMemo(() => {
    const groups: Record<string, MessageType[]> = {};

    for (const message of allMessages) {
      const date = new Date(message.createdAt);
      const dateKey = format(date, 'yyyy-MM-dd');

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

  const handleSetEditingId = useCallback((id: string | null) => {
    setEditingId(id);
  }, []);

  if (isFetching && !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

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
            <MessageGroup
              key={dateKey}
              dateKey={dateKey}
              messages={messages}
              tenantId={tenantId}
              currentUserTenantId={currentUserTenantId}
              editingId={editingId}
              handleSetEditingId={handleSetEditingId}
              variant={variant}
            />
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

      {variant === 'channel' && channelName && channelCreatedAt && <ChannelHero name={channelName} creationTime={channelCreatedAt} />}
      {variant === 'conversation' && userId && <ConversationHero name={userName} image={userImage} userId={userId} />}
    </div>
  );
};

const convertAblyMessageToOurType = (ablyMessage: AblyMessage): MessageType => {
  return {
    id: ablyMessage.serial,
    userTenant: {
      id: ablyMessage.clientId,
      person: {
        firstName: String(ablyMessage.metadata?.firstName) || 'N/A',
        lastName: String(ablyMessage.metadata?.lastName) || 'N/A',
        image: String(ablyMessage.metadata?.image) || null,
      },
      user: {
        id: String(ablyMessage.metadata?.userId) || '',
        email: String(ablyMessage.metadata?.email) || '',
      },
    },
    reactions: [],
    body: ablyMessage.text || '',
    imageId: null,
    createdAt: ablyMessage.createdAt ?? null,
    updatedAt: ablyMessage.updatedAt ?? null,
  };
};

export const convertOurMessageToAbly = (message: MessageType): Partial<AblyMessage> => {
  return {
    text: message.body,
    metadata: {
      firstName: message.userTenant.person?.firstName,
      lastName: message.userTenant.person?.lastName,
      image: message.userTenant.person?.image,
      userId: message.userTenant.user.id,
      email: message.userTenant.user?.email,
    },
  };
};
