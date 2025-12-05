import { useFindFirstMessage } from '@/services/api/hooks';
import { ChatClientProvider, ChatRoomProvider } from '@ably/chat/react';
import { AlertTriangle, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { UserTenant } from '@/types/user';
import { MessageDefaultArgs } from '@/types/zenstackhq/message';
import { getAblyChatClient } from '@/lib/ablyClient';
import { Button } from '@/components/ui/button';
import { Message } from '@/components/chat/message';
import { MessageList } from '@/components/chat/message-list';
import { Spinner } from '@/components/spinner';

import { ChatInput } from './chat-input';
import { TypingIndicator } from './typing-indicator';

interface ThreadProps {
  tenantId: string;
  roomId: string;
  messageId: string;
  currentUserTenant: UserTenant;
  onClose: () => void;
}

export const Thread = ({ tenantId, messageId, currentUserTenant, onClose }: ThreadProps) => {
  const t = useTranslations('component.chat.thread');

  const { data: thread, isLoading: loadingThread } = useFindFirstMessage({
    ...MessageDefaultArgs,
    where: { id: messageId },
  });

  const chatClient = getAblyChatClient(currentUserTenant.userTenantId);

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
      <ChatClientProvider client={chatClient}>
        <ChatRoomProvider name={messageId}>
          {/* Root Message */}
          <div className="border-b border-gray-500/80 p-4">
            <Message message={thread} tenantId={tenantId} currentUserTenantId={currentUserTenant.userTenantId} />
          </div>

          {/* Thread Messages */}
          <MessageList tenantId={tenantId} where={{ parentMessageId: messageId }} currentUserTenantId={currentUserTenant.userTenantId} variant="thread" />
          <TypingIndicator currentClientId={currentUserTenant.userTenantId} />
          {/* Chat Input */}
          <ChatInput tenantId={tenantId} relatedId={messageId} variant="thread" currentUserTenant={currentUserTenant} enableEmail enableWhatsApp />
        </ChatRoomProvider>
      </ChatClientProvider>
    </div>
  );
};
