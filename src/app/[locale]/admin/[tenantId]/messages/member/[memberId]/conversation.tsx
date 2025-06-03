'use client';

import { useFindFirstPerson } from '@/services/api/hooks';
import { ChatClientProvider, ChatRoomProvider } from '@ably/chat/react';

import { getAblyChatClient } from '@/lib/ablyClient';
import { usePanel } from '@/hooks/use-panel';
import { ChatInput } from '@/components/chat/chat-input';
import { MessageList } from '@/components/chat/message-list';
import { TypingIndicator } from '@/components/chat/typing-indicator';
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

  const chatClient = getAblyChatClient(currentUserTenantId);

  if (userLoading) return <Spinner />;

  return (
    <div className="bg-fade-100 flex h-full flex-col">
      {user && <Header userName={`${user.firstName} ${user.lastName}`} userImage={user.image ?? ''} onClick={() => onOpenProfile(userTenantId)} />}

      <ChatClientProvider client={chatClient}>
        <ChatRoomProvider id={id} release={true} attach={true}>
          <MessageList
            variant="conversation"
            userId={userTenantId}
            tenantId={tenantId}
            where={{ conversationId: id }}
            currentUserTenantId={currentUserTenantId}
            userName={user ? `${user.firstName} ${user.lastName}` : undefined}
            userImage={user ? user.image : undefined}
          />
          <TypingIndicator currentClientId={currentUserTenantId} />
          <ChatInput tenantId={tenantId} relatedId={id} variant="conversation" currentUserTenantId={currentUserTenantId} />
        </ChatRoomProvider>
      </ChatClientProvider>
    </div>
  );
};
