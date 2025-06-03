'use client';

import { ChatClientProvider, ChatRoomProvider } from '@ably/chat/react';

import { RequestDetailsType } from '@/types/prisma/request';
import { getAblyChatClient } from '@/lib/ablyClient';
import { Card } from '@/components/ui/card';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatInput } from '@/components/chat/chat-input';
import { MessageList } from '@/components/chat/message-list';
import { TypingIndicator } from '@/components/chat/typing-indicator';

interface MessagesProps {
  tenantId: string;
  currentUserTenantId: string;
  channel: RequestDetailsType['channel'];
  name: string;
}

export default function Messages({ tenantId, channel, currentUserTenantId, name }: MessagesProps) {
  const chatClient = getAblyChatClient(currentUserTenantId);
  return (
    <ChatClientProvider client={chatClient}>
      <Card className="flex-1 flex flex-col overflow-hidden">
        {channel ? (
          <ChatRoomProvider id={channel.id} release={true} attach={true}>
            <ChatHeader name={name} />
            <MessageList
              variant="channel"
              tenantId={tenantId}
              where={{ channelId: channel.id }}
              currentUserTenantId={currentUserTenantId}
              channelCreatedAt={channel.createdAt}
              channelName={channel.name}
            />
            <TypingIndicator currentClientId={currentUserTenantId} />
            <ChatInput tenantId={tenantId} relatedId={channel.id} variant="channel" currentUserTenantId={currentUserTenantId} />
          </ChatRoomProvider>
        ) : (
          <p className="rounded-md bg-red-100 p-4 text-center text-red-500">Channel not found</p>
        )}
      </Card>
    </ChatClientProvider>
  );
}
