import { useState } from 'react';
import { useFindFirstMessage, useInfiniteFindManyMessage } from '@/services/api/hooks';
import { AlertTriangle, XIcon } from 'lucide-react';

import { MessageDefaultArgs } from '@/types/prisma/message';
import useTenantId from '@/hooks/use-tenant-id';
import { Button } from '@/components/ui/button';
import { Message } from '@/components/chat/message';
import { MessageList } from '@/components/chat/message-list';
import { Spinner } from '@/components/spinner';

import { ChatInput } from './chat-input';

interface ThreadProps {
  messageId: string;
  currentUserTenantId: string;
  onClose: () => void;
}

export const Thread = ({ messageId, currentUserTenantId, onClose }: ThreadProps) => {
  const tenantId = useTenantId();

  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: thread, isLoading: loadingThread } = useFindFirstMessage({
    ...MessageDefaultArgs,
    where: { id: messageId },
  });

  const { data, hasNextPage, hasPreviousPage, fetchNextPage, fetchPreviousPage, isFetchingNextPage, isFetchingPreviousPage, isFetching } = useInfiniteFindManyMessage({
    ...MessageDefaultArgs,
    where: { parentMessageId: messageId },
  });

  if (loadingThread) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-[49px] items-center justify-between border-b border-gray-500/80 px-4">
          <p className="text-lg font-bold">Thread</p>
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
          <p className="text-lg font-bold">Thread</p>
          <Button onClick={onClose} size="sm" variant="ghost">
            <XIcon className="stoke-[1.5] size-5" />
          </Button>
        </div>
        <div className="flex h-full flex-col items-center justify-center gap-y-2">
          <AlertTriangle className="size-5 text-white" />
          <p className="text-muted-foreground text-sm">Thread not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[49px] items-center justify-between border-b border-gray-500/80 px-4">
        <p className="text-lg font-bold">Thread</p>
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
      {/* Thread Messages */}
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
        variant="thread"
      />
      {/* Chat Input */}
      <ChatInput
        tenantId={tenantId}
        relatedId={messageId}
        relatedType="parentMessage"
        currentUserTenantId={currentUserTenantId}
        placeholder={{
          paragraph: 'Reply to thread...',
          imageCaption: 'Press Enter to send message',
        }}
      />
    </div>
  );
};
