import { differenceInMinutes } from 'date-fns';

import { MessageType } from '@/types/prisma/message';
import { TIME_THRESHOLD } from '@/lib/utils';
import { useFormatTime } from '@/hooks/use-format-time';

import { Message } from './message';

interface MessageGroupProps {
  dateKey: string;
  roomId: string;
  messages: MessageType[];
  tenantId: string;
  currentUserTenantId: string;
  variant: 'channel' | 'thread' | 'conversation';
}

export const MessageGroup = ({ dateKey, messages, tenantId, roomId, currentUserTenantId, variant }: MessageGroupProps) => {
  const { now, format } = useFormatTime();
  const date = new Date(dateKey);

  return (
    <div key={dateKey}>
      <div className="relative my-2 text-center">
        <hr className="absolute top-1/2 right-0 left-0 border-t" />
        <span className="relative inline-block rounded-full border px-4 z-20 py-1 text-xs shadow-xs bg-accent">{format.relativeTime(date, now)}</span>
      </div>
      {messages.map((message, index) => {
        const prevMsg = messages[index - 1];
        const isSameAuthor = prevMsg && prevMsg.userTenant.id === message.userTenant.id && differenceInMinutes(new Date(message.createdAt), new Date(prevMsg.createdAt)) < TIME_THRESHOLD;
        return (
          <Message key={message.id} message={message} roomId={roomId} tenantId={tenantId} currentUserTenantId={currentUserTenantId} hideThreadButton={variant === 'thread'} isCompact={isSameAuthor} />
        );
      })}
    </div>
  );
};
