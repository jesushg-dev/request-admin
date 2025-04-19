'use client';

import { useFindFirstPerson, useInfiniteFindManyMessage } from '@/services/api/hooks';

import { MessageDefaultArgs } from '@/types/prisma/message';
import { usePanel } from '@/hooks/use-panel';
import { ChatInput } from '@/components/chat/chat-input';
import { MessageList } from '@/components/chat/message-list';
import { Spinner } from '@/components/spinner';

import { Header } from './header';

interface ConversationProps {
  id: string;
  tenantId: string;
  userTenantId: string;
  currentUserTenantId: string;
}

export const Conversation = ({ id, tenantId, userTenantId, currentUserTenantId }: ConversationProps) => {
  const { onOpenProfile } = usePanel();
  const { data: user, isLoading: userLoading } = useFindFirstPerson({
    where: { userTenantId },
  });

  const { data, hasNextPage, hasPreviousPage, fetchNextPage, fetchPreviousPage, isFetchingNextPage, isFetchingPreviousPage, isFetching } = useInfiniteFindManyMessage({
    ...MessageDefaultArgs,
    where: { conversationId: id },
  });

  if (userLoading || status === 'LoadingFirstPage') return <Spinner />;

  return (
    <div className="bg-fade-100 flex h-full flex-col">
      {user && <Header userName={`${user.firstName} ${user.lastName}`} userImage={user.image ?? ''} onClick={() => onOpenProfile(userTenantId)} />}
      <MessageList
        data={data}
        tenantId={tenantId}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        fetchNextPage={fetchNextPage}
        fetchPreviousPage={fetchPreviousPage}
        isFetchingNextPage={isFetchingNextPage}
        isFetchingPreviousPage={isFetchingPreviousPage}
        isFetching={isFetching}
        currentUserTenantId={currentUserTenantId}
        variant="conversation"
      />
      <ChatInput
        tenantId={tenantId}
        relatedId={id}
        relatedType="conversation"
        currentUserTenantId={currentUserTenantId}
        placeholder={{
          paragraph: 'Type a message...',
          imageCaption: 'Press Enter to send message',
        }}
      />
    </div>
  );
};
