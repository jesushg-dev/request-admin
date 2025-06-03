import { type FC } from 'react';
import dynamic from 'next/dynamic';

import { MessageType } from '@/types/prisma/message';

import { Reactions } from './message-reactions';
import { ThreadBar } from './thread-bar';
import { Thumbnail } from './thumbnail';
import { UpdatedAtText } from './updated-at-text';

const Renderer = dynamic(() => import('@/components/chat/renderer'), { ssr: false });

interface MessageContentProps {
  body: string;
  image: string | null | undefined;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  reactions: MessageType['reactions'];
  threadCount?: number;
  threadImage?: string;
  threadName?: string;
  threadTimestamp?: number;
  currentUserTenantId: string;
  onOpenMessage: (id: string) => void;
  id: string;
  handleRemoveReaction: (reactionId: string) => void;
}

export const MessageContent: FC<MessageContentProps> = ({
  body,
  image,
  createdAt,
  updatedAt,
  reactions,
  threadCount,
  threadImage,
  threadName,
  threadTimestamp,
  currentUserTenantId,
  onOpenMessage,
  id,
  handleRemoveReaction,
}) => (
  <>
    <Renderer value={body} />
    <Thumbnail src={image} />
    <UpdatedAtText createdAt={createdAt} updatedAt={updatedAt} />
    <Reactions reactions={reactions} onChange={handleRemoveReaction} currentUserTenantId={currentUserTenantId} />
    <ThreadBar count={threadCount} image={threadImage} timestamp={threadTimestamp} name={threadName} onClick={() => onOpenMessage(id)} />
  </>
);
