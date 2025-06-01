import { MoreHorizontal } from 'lucide-react';
import { useFormatter, useNow, useTranslations } from 'next-intl';

import { NotificationBody, NotificationDataType } from '@/types/notification';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface NotificationCardProps {
  notification: NotificationDataType;
  userTenantId: string;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  deleteNotification: (id: string) => void;
  mode?: 'default' | 'compact';
}

export function NotificationCard({ notification, userTenantId, markAsRead, markAsUnread, deleteNotification, mode = 'default' }: NotificationCardProps) {
  const now = useNow();
  const format = useFormatter();
  const t = useTranslations('component.notification');
  const isCompact = mode === 'compact';
  const isUnread = !notification.recipients.some((recipient) => recipient.userTenantId === userTenantId && recipient.readAt);

  // Parse the JSON body
  let parsedBody: NotificationBody | undefined = undefined;
  try {
    parsedBody = typeof notification.body === 'string' ? (JSON.parse(notification.body) as NotificationBody) : (notification.body as NotificationBody);
  } catch {
    parsedBody = undefined;
  }

  let title = t('unknownTitle');
  let description = t('unknownDescription');

  if (parsedBody) {
    switch (parsedBody.type) {
      case 'assignment':
        title = t('body.assignment.title', parsedBody.data);
        description = t('body.assignment.description', parsedBody.data);
        break;
      case 'status':
        title = t('body.status.title', parsedBody.data);
        description = t('body.status.description', parsedBody.data);
        break;
      case 'comment':
        title = t('body.comment.title', parsedBody.data);
        description = t('body.comment.description', parsedBody.data);
        break;
      case 'system':
        title = t('body.system.title', parsedBody.data);
        description = t('body.system.description', parsedBody.data);
        break;
      default:
        break;
    }
  }

  return (
    <div className={`flex items-start justify-between ${isCompact ? 'gap-3 rounded-lg px-3 py-2 hover:bg-muted' : 'rounded-lg border p-4'} ${isUnread ? 'bg-muted/50' : ''}`}>
      <div className={isCompact ? 'flex-1' : 'flex-1 space-y-1'}>
        <div className="flex items-center gap-2">
          <p className={isCompact ? 'text-sm font-medium' : 'font-medium'}>{title}</p>
          {isUnread && <span className="h-2 w-2 rounded-full bg-blue-600"></span>}
        </div>
        <p className={isCompact ? 'text-xs text-muted-foreground' : 'text-sm text-muted-foreground'}>{description}</p>
        <div className="flex items-center gap-2 pt-1">
          <Badge variant="outline">{t(`tab.${notification.type}`)}</Badge>
          <span className="text-xs text-muted-foreground">{format.relativeTime(new Date(notification.createdAt), now)}</span>
        </div>
      </div>
      <div className={`${isCompact ? '' : 'ml-4'} flex items-center gap-1`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t('tooltipDefault')}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isUnread ? (
              <DropdownMenuItem onClick={() => markAsRead(notification.id)}>{t('markAsRead', { defaultValue: 'Mark as read' })}</DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => markAsUnread(notification.id)}>{t('markAsUnread', { defaultValue: 'Mark as unread' })}</DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => deleteNotification(notification.id)}>{t('delete', { defaultValue: 'Delete' })}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
