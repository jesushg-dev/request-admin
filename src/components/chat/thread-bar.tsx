import { formatDistanceToNow } from 'date-fns';
import { ChevronRight } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface ThreadBarProps {
  count?: number;
  image?: string;
  timestamp?: number;
  name?: string;
  onClick?: () => void;
}

export const ThreadBar = ({ count, image, onClick, timestamp, name = 'Member' }: ThreadBarProps) => {
  if (!count || !timestamp) return null;
  const avatarFallback = name.charAt(0).toUpperCase();
  return (
    <button className="group/thread-bar hover:border-border flex max-w-[600px] items-center justify-start rounded-md border border-transparent p-1 transition hover:bg-white" onClick={onClick}>
      <div className="flex items-center gap-2 overflow-hidden">
        <Avatar className="size-6 shrink-0">
          <AvatarImage src={image} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <span className="truncate text-xs font-bold text-sky-700 hover:underline">
          {count} {count > 1 ? 'replies' : 'reply'}
        </span>
        <span className="text-muted-foreground block truncate text-xs group-hover/thread-bar:hidden">
          <i>Last reply</i> {formatDistanceToNow(timestamp, { addSuffix: true })}
        </span>
        <span className="text-muted-foreground hidden truncate text-xs group-hover/thread-bar:block">
          View <i>threads</i>
        </span>
      </div>
      <ChevronRight className="text-muted-foreground ml-auto size-4 shrink-0 opacity-0 transition group-hover/thread-bar:opacity-100" />
    </button>
  );
};
