'use client';

import { useInfiniteFindManyMessage } from '@/services/api/hooks';
import { Channel } from '@zenstackhq/runtime/models';

import { MessageDefaultArgs } from '@/types/prisma/message';
import { ChatInput } from '@/components/chat/chat-input';
import { MessageList } from '@/components/chat/message-list';

interface CommentsProps {
  slug: string;
  tenantId: string;
  channel?: Channel | null;
  currentUserId: string;
}

export default function Comments({ slug, tenantId, channel, currentUserId }: CommentsProps) {
  const { data, hasNextPage, hasPreviousPage, fetchNextPage, fetchPreviousPage, isFetchingNextPage, isFetchingPreviousPage, isFetching } = useInfiniteFindManyMessage({
    ...MessageDefaultArgs,
    where: { channelId: slug },
  });

  return (
    <div className="flex w-full flex-1 flex-col gap-4">
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
      <ChatInput tenantId={tenantId} relatedId={slug} relatedType="channel" currentUserId={currentUserId} placeholder={`Message # ${channel?.name}`} />
    </div>
  );
}
