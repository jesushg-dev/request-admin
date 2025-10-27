'use client';

import { useFindFirstPerson } from '@/services/api/hooks';
import { ChatClientProvider, ChatRoomProvider } from '@ably/chat/react';

import { UserTenant } from '@/types/user';
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
  currentUserTenant: UserTenant;
}

export const Conversation = ({ id, tenantId, userTenantId, currentUserTenant }: ConversationProps) => {
  const { onOpenProfile } = usePanel();
  const { data: user, isLoading: userLoading } = useFindFirstPerson({
    where: { userTenantId },
  });

  const chatClient = getAblyChatClient(currentUserTenant.userTenantId);

  if (userLoading) return <Spinner />;

  return (
    <div className="bg-fade-100 flex h-full flex-col">
      {user && <Header userName={`${user.firstName} ${user.lastName}`} userImage={user.image ?? ''} onClick={() => onOpenProfile(userTenantId)} />}

      <ChatClientProvider client={chatClient}>
        <ChatRoomProvider name={id}>
          <MessageList
            variant="conversation"
            channelName={id}
            userId={userTenantId}
            tenantId={tenantId}
            where={{ conversationId: id }}
            currentUserTenantId={currentUserTenant.userTenantId}
            userName={user ? `${user.firstName} ${user.lastName}` : undefined}
            userImage={user ? user.image : undefined}
          />
          <TypingIndicator currentClientId={currentUserTenant.userTenantId} />
          <ChatInput tenantId={tenantId} relatedId={id} variant="conversation" currentUserTenant={currentUserTenant} enableEmail enableWhatsApp />
        </ChatRoomProvider>
      </ChatClientProvider>
    </div>
  );
};
