'use client';

import { ChatClientProvider, ChatRoomProvider } from '@ably/chat/react';

import { RequestDetailsType } from '@/types/prisma/request';
import { getAblyChatClient } from '@/lib/ablyClient';
import { Card } from '@/components/ui/card';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatInput } from '@/components/chat/chat-input';
import { MessageList } from '@/components/chat/message-list';
import { TypingIndicator } from '@/components/chat/typing-indicator';
import { useTenantContext } from '@/components/hoc/tenant-provider';

interface MessagesProps {
  tenantId: string;
  channel: RequestDetailsType['channel'];
}

export default function Messages({ tenantId, channel }: MessagesProps) {
  const { userTenant } = useTenantContext();
  const chatClient = getAblyChatClient(userTenant.userTenantId);

  return (
    <ChatClientProvider client={chatClient}>
      <Card className="flex-1 flex flex-col overflow-hidden">
        {channel ? (
          <ChatRoomProvider id={channel.id} release={true} attach={true}>
            <ChatHeader name={userTenant.displayUserName} />
            <MessageList
              variant="channel"
              roomId={channel.id}
              tenantId={tenantId}
              where={{ channelId: channel.id }}
              currentUserTenantId={userTenant.userTenantId}
              channelCreatedAt={channel.createdAt}
              channelName={channel.name}
            />
            <TypingIndicator currentClientId={userTenant.userTenantId} />
            <ChatInput tenantId={tenantId} relatedId={channel.id} variant="channel" currentUserTenant={userTenant} />
          </ChatRoomProvider>
        ) : (
          <p className="rounded-md bg-red-100 p-4 text-center text-red-500">Channel not found</p>
        )}
      </Card>
    </ChatClientProvider>
  );
}
