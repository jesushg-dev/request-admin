import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useFormatTime } from '@/hooks/use-format-time';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface ThreadBarProps {
  count?: number;
  image?: string;
  timestamp?: number;
  name?: string;
  onClick?: () => void;
}

export const ThreadBar = ({ count, image, onClick, timestamp, name = 'Member' }: ThreadBarProps) => {
  const { format, now } = useFormatTime();
  const t = useTranslations('component.chat.threadBar');
  const avatarFallback = name.charAt(0).toUpperCase();

  if (!count || !timestamp) return null;

  return (
    <div className="group/thread-bar hover:border-border flex max-w-[600px] items-center justify-start rounded-md border border-transparent p-1 transition hover:bg-white" onClick={onClick}>
      <div className="flex items-center gap-2 overflow-hidden">
        <Avatar className="size-6 shrink-0">
          <AvatarImage src={image} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <span className="truncate text-xs font-bold text-sky-700 hover:underline">
          {count} {t('threads', { count })}
        </span>
        <span className="text-muted-foreground block truncate text-xs group-hover/thread-bar:hidden">
          <i>{t('lastReply')}</i> {format.relativeTime(timestamp, now)}
        </span>
        <span className="text-muted-foreground hidden truncate text-xs group-hover/thread-bar:block">{t('viewThreads')}</span>
      </div>
      <ChevronRight className="text-muted-foreground ml-auto size-4 shrink-0 opacity-0 transition group-hover/thread-bar:opacity-100" />
    </div>
  );
};
