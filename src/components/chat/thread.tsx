import { useState } from 'react';
import { useFindFirstMessage } from '@/services/api/hooks';
import { ChatClientProvider, ChatRoomProvider } from '@ably/chat/react';
import { AlertTriangle, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { MessageDefaultArgs } from '@/types/prisma/message';
import { getAblyChatClient } from '@/lib/ablyClient';
import { Button } from '@/components/ui/button';
import { Message } from '@/components/chat/message';
import { MessageList } from '@/components/chat/message-list';
import { Spinner } from '@/components/spinner';

import { ChatInput } from './chat-input';
import { TypingIndicator } from './typing-indicator';

interface ThreadProps {
  tenantId: string;
  messageId: string;
  currentUserTenantId: string;
  onClose: () => void;
}

export const Thread = ({ tenantId, messageId, currentUserTenantId, onClose }: ThreadProps) => {
  const t = useTranslations('component.chat.thread');

  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: thread, isLoading: loadingThread } = useFindFirstMessage({
    ...MessageDefaultArgs,
    where: { id: messageId },
  });

  const chatClient = getAblyChatClient(currentUserTenantId);

  if (loadingThread) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-[49px] items-center justify-between border-b border-gray-500/80 px-4">
          <p className="text-lg font-bold">{t('title')}</p>
          <Button onClick={onClose} size="sm" variant="ghost">
            <XIcon className="stoke-[1.5] size-5" />
          </Button>
        </div>
        <Spinner />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-[49px] items-center justify-between border-b border-gray-500/80 px-4">
          <p className="text-lg font-bold">{t('title')}</p>
          <Button onClick={onClose} size="sm" variant="ghost">
            <XIcon className="stoke-[1.5] size-5" />
          </Button>
        </div>
        <div className="flex h-full flex-col items-center justify-center gap-y-2">
          <AlertTriangle className="size-5 text-white" />
          <p className="text-muted-foreground text-sm">{t('error.notFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[49px] items-center justify-between border-b border-gray-500/80 px-4">
        <p className="text-lg font-bold">{t('title')}</p>
        <Button onClick={onClose} size="sm" variant="ghost">
          <XIcon className="stoke-[1.5] size-5" />
        </Button>
      </div>
      {/* Root Message */}
      <div className="border-b border-gray-500/80 p-4">
        <Message
          key={thread.id}
          tenantId={tenantId}
          id={thread.id}
          userTenantId={thread.userTenant.id}
          authorImage={thread.userTenant.person?.image}
          currentUserTenantId={currentUserTenantId}
          authorName={thread.userTenant.person ? `${thread.userTenant.person.firstName} ${thread.userTenant.person.lastName}` : thread.userTenant.user.email}
          reactions={thread.reactions}
          body={thread.body}
          image={thread.imageId}
          isEditing={editingId === thread.id}
          setEditingId={setEditingId}
          updatedAt={thread.updatedAt}
          createdAt={thread.createdAt}
        />
      </div>

      <ChatClientProvider client={chatClient}>
        <ChatRoomProvider id={messageId} release={true} attach={true}>
          {/* Thread Messages */}
          <MessageList tenantId={tenantId} where={{ parentMessageId: messageId }} currentUserTenantId={currentUserTenantId} variant="thread" />
          <TypingIndicator currentClientId={currentUserTenantId} />
          {/* Chat Input */}
          <ChatInput tenantId={tenantId} relatedId={messageId} variant="thread" currentUserTenantId={currentUserTenantId} />
        </ChatRoomProvider>
      </ChatClientProvider>
    </div>
  );
};
