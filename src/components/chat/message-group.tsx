import { differenceInMinutes } from 'date-fns';
import { useFormatter, useNow } from 'next-intl';

import { MessageType } from '@/types/prisma/message';
import { TIME_THRESHOLD } from '@/lib/utils';

import { Message } from './message';

interface MessageGroupProps {
  dateKey: string;
  messages: MessageType[];
  tenantId: string;
  currentUserTenantId: string;
  editingId: string | null;
  handleSetEditingId: (id: string | null) => void;
  variant: 'channel' | 'thread' | 'conversation';
}

export const MessageGroup = ({ dateKey, messages, tenantId, currentUserTenantId, editingId, handleSetEditingId, variant }: MessageGroupProps) => {
  const now = useNow();
  const format = useFormatter();

  // dateKey is in 'yyyy-MM-dd' format, so we parse it as midnight
  const date = new Date(dateKey + 'T00:00:00');

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
          <Message
            key={message.id}
            id={message.id}
            tenantId={tenantId}
            userTenantId={message.userTenant.id}
            authorImage={message.userTenant.person?.image}
            currentUserTenantId={currentUserTenantId}
            authorName={message.userTenant.person ? `${message.userTenant.person.firstName} ${message.userTenant.person.lastName}` : message.userTenant.user.email}
            reactions={message.reactions}
            body={message.body}
            image={message.imageId}
            isEditing={editingId === message.id}
            setEditingId={handleSetEditingId}
            updatedAt={message.updatedAt}
            createdAt={message.createdAt}
            hideThreadButton={variant === 'thread'}
            isCompact={isSameAuthor}
          />
        );
      })}
    </div>
  );
};
