import { useMemo } from 'react';
import { type EmojiClickData } from 'emoji-picker-react';

import { MessageType } from '@/types/prisma/message';
import { cn } from '@/lib/utils';

import { Hint } from '../hint';

interface ReactionsProps {
  currentUserId: string;
  data: MessageType['reactions'];
  onChange: (value: EmojiClickData) => void;
}

export const Reactions = ({ currentUserId, data, onChange }: ReactionsProps) => {
  const processedReactions = useMemo(() => {
    return data.reduce<Record<string, { value: string; count: number; memberIds: string[] }>>((acc, reaction) => {
      const { value, userTenant } = reaction;

      if (!acc[value]) {
        acc[value] = { value, count: 0, memberIds: [] };
      }

      acc[value].count += 1;
      acc[value].memberIds.push(userTenant.userId);

      return acc;
    }, {});
  }, [data]);

  const reactionsArray = useMemo(() => Object.values(processedReactions), [processedReactions]);

  if (data.length === 0) return null;

  return (
    <div className="mt-1 mb-1 flex items-center gap-1">
      {reactionsArray.map((reaction) => (
        <Hint label={`${reaction.count} ${reaction.count === 1 ? 'person' : 'people'} reacted with ${reaction.value}`} key={reaction.value}>
          <button
            onClick={() => onChange(reaction.value)}
            className={cn(
              'flex h-6 items-center gap-x-1 rounded-full border-transparent bg-slate-200/70 px-2 text-slate-800',
              reaction.memberIds.includes(currentUserId) && 'border-blue-500 bg-blue-100/70 text-white'
            )}>
            {reaction.value}
            <span className={cn('text-muted-foreground text-xs font-semibold', reaction.memberIds.includes(currentUserId) && 'bg-blue-100/70')}>{reaction.count}</span>
          </button>
        </Hint>
      ))}
    </div>
  );
};
