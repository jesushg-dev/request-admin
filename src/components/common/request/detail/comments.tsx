'use client';

import { useFindFirstChannel, useInfiniteFindManyMessage } from '@/services/api/hooks';

import { MessageDefaultArgs } from '@/types/prisma/message';
import useTenantId from '@/hooks/use-tenant-id';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChatInput } from '@/components/chat/chat-input';
import { MessageList } from '@/components/chat/message-list';

interface Comment {
  id: number;
  author: string;
  avatar: string;
  time: string;
  content: string;
  replies?: Comment[];
}

interface CommentsProps {
  slug: string;
  comments: Comment[];
  currentUserId: string;
}

export default function Comments({ slug, currentUserId, comments }: CommentsProps) {
  const tenantId = useTenantId();
  const { data: channel } = useFindFirstChannel({ where: { id: slug } });
  const { data, hasNextPage, hasPreviousPage, fetchNextPage, fetchPreviousPage, isFetchingNextPage, isFetchingPreviousPage, isFetching } = useInfiniteFindManyMessage({
    ...MessageDefaultArgs,
    where: { channelId: slug },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments ({comments.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Input placeholder="Write a comment..." />
          <Button>Send</Button>
        </div>
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}

          {channel && (
            <div className="bg-fade-100 flex h-full flex-col">
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
                channelCreationTime={channel.createdAt.getMilliseconds()}
                channelName={channel.name}
                variant="channel"
              />
              <ChatInput tenantId={tenantId} relatedId={slug} relatedType="channel" currentUserId={currentUserId} placeholder={`Message # ${channel.name}`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarImage src={comment.avatar} alt={comment.author} />
            <AvatarFallback>
              {comment.author
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">{comment.author}</p>
            <p className="text-sm text-muted-foreground">{comment.time}</p>
            <p className="text-sm">{comment.content}</p>
            {comment.replies && (
              <div className="mt-4 space-y-4">
                {comment.replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} />
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
