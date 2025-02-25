'use client';

import { useInfiniteFindManyMessage } from '@/services/api/hooks';

import { MessageDefaultArgs } from '@/types/prisma/message';
import { RequestDetailsType } from '@/types/prisma/request';
import { Card } from '@/components/ui/card';
import { ChatInput } from '@/components/chat/chat-input';
import { MessageList } from '@/components/chat/message-list';

interface CommentsProps {
  tenantId: string;
  currentUserId: string;
  channel: RequestDetailsType['channel'];
}

export default function Comments({ tenantId, channel, currentUserId }: CommentsProps) {
  const { data, hasNextPage, hasPreviousPage, fetchNextPage, fetchPreviousPage, isFetchingNextPage, isFetchingPreviousPage, isFetching } = useInfiniteFindManyMessage({
    ...MessageDefaultArgs,
    where: { channelId: channel?.id },
  });

  return (
    <Card className="flex-1 flex flex-col">
      {!channel && <p className="rounded-md bg-red-100 p-4 text-center text-red-500">Channel not found</p>}
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
        channelCreatedAt={channel?.createdAt}
        channelName={channel?.name}
        variant="channel"
      />
      {channel && (
        <ChatInput
          tenantId={tenantId}
          relatedId={channel.id}
          relatedType="channel"
          currentUserId={currentUserId}
          placeholder={{
            paragraph: `Type your message here...`,
            imageCaption: `Add a caption...`,
          }}
        />
      )}
    </Card>
  );
}
