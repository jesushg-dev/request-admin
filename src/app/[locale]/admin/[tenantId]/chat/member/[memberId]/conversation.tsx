import { useFindFirstPerson, useInfiniteFindManyMessage } from '@/services/api/hooks';

import { MessageDefaultArgs } from '@/types/prisma/message';
import { usePanel } from '@/hooks/use-panel';
import { ChatInput } from '@/components/chat/chat-input';
import { MessageList } from '@/components/chat/message-list';
import { Spinner } from '@/components/spinner';

import { Header } from './header';

interface ConversationProps {
  id: string;
  userId: string;
  tenantId: string;
  currentUserId: string;
}

export const Conversation = ({ id, tenantId, userId, currentUserId }: ConversationProps) => {
  const { onOpenProfile } = usePanel();
  const { data: user, isLoading: userLoading } = useFindFirstPerson({
    where: { id: currentUserId },
  });

  const { data, hasNextPage, hasPreviousPage, fetchNextPage, fetchPreviousPage, isFetchingNextPage, isFetchingPreviousPage, isFetching } = useInfiniteFindManyMessage({
    ...MessageDefaultArgs,
    where: { conversationId: id },
  });

  if (userLoading || status === 'LoadingFirstPage') return <Spinner />;

  return (
    <div className="bg-fade-100 flex h-full flex-col">
      {user && <Header userName={`${user.firstName} ${user.lastName}`} userImage={user.image ?? ''} onClick={() => onOpenProfile(userId)} />}
      <MessageList
        data={data}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        fetchNextPage={fetchNextPage}
        fetchPreviousPage={fetchPreviousPage}
        isFetchingNextPage={isFetchingNextPage}
        isFetchingPreviousPage={isFetchingPreviousPage}
        isFetching={isFetching}
        currentUserId={currentUserId}
        variant="conversation"
      />
      <ChatInput tenantId={tenantId} relatedId={id} relatedType="conversation" currentUserId={currentUserId} placeholder={`Message ${user?.firstName} ${user?.lastName}`} />
    </div>
  );
};
