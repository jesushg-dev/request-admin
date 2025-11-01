import { memo, type FC } from 'react';
import dynamic from 'next/dynamic';

import { MessageType } from '@/types/zenstackhq/message';

import { Reactions } from './message-reactions';
import { ThreadBar } from './thread-bar';
import { Thumbnail } from './thumbnail';
import { UpdatedAtText } from './updated-at-text';

const Renderer = dynamic(() => import('@/components/chat/renderer'), { ssr: false });

interface MessageContentProps {
  message: MessageType;
  currentUserTenantId: string;
  threadImage?: string;
  threadName?: string;
  threadTimestamp?: number;
  onOpenMessage: (id: string) => void;
  handleRemoveReaction: (reactionId: string) => void;
}

export const MessageContent: FC<MessageContentProps> = memo(({ message, currentUserTenantId, threadImage, threadName, threadTimestamp, onOpenMessage, handleRemoveReaction }) => {
  return (
    <>
      <Renderer value={message.body} />
      <Thumbnail src={message.imageId} />
      <UpdatedAtText createdAt={message.createdAt} updatedAt={message.updatedAt} />
      <Reactions reactions={message.reactions} onChange={handleRemoveReaction} currentUserTenantId={currentUserTenantId} />
      <ThreadBar count={message._count.replies} image={threadImage} timestamp={threadTimestamp} name={threadName} onClick={() => onOpenMessage(message.id)} />
    </>
  );
});

MessageContent.displayName = 'MessageContent';
