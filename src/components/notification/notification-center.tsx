'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { Bell, BellDot, BellOff, BellRing, RotateCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { NotificationType } from '@/types/notification';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTenantContext } from '@/components/hoc/tenant-provider';
import { useNotificationsQuery } from '@/components/notification/use-notification-query.hook';

import { NotificationCard } from './notification-card';
import { useNotifications } from './notification-provider.core';

const types: NotificationType[] = ['all', 'assignment', 'status', 'comment', 'system'];

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const t = useTranslations('component.notification');
  const { tenantId, userTenant } = useTenantContext();
  const { notificationState, connectionState } = useNotifications();
  const { notifications, unreadCount, markAllAsRead, markAsRead, markAsUnread, deleteNotification, notificationType, setNotificationType, isLoading } = useNotificationsQuery(
    tenantId,
    userTenant.userTenantId
  );

  const getNotificationIconState = () => {
    const baseIconProps = { className: 'h-5 w-5' };
    if (unreadCount > 0 && notificationState === 'active') {
      return { icon: <BellDot {...baseIconProps} />, tooltip: t('tooltipUnread', { count: unreadCount }) };
    }

    switch (notificationState) {
      case 'active':
        return { icon: <BellRing {...baseIconProps} />, tooltip: t('tooltipActive') };
      case 'idle':
        return { icon: <Bell {...baseIconProps} />, tooltip: t('tooltipIdle') };
      case 'disabled':
        return { icon: <BellOff {...baseIconProps} />, tooltip: t('tooltipDisabled') };
      case 'error':
        return { icon: <BellOff {...baseIconProps} className="text-yellow-500" />, tooltip: t('tooltipError') };
      default:
        return { icon: <Bell {...baseIconProps} />, tooltip: t('tooltipDefault') };
    }
  };

  const { icon, tooltip } = getNotificationIconState();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label={tooltip}>
                {icon}
                {isLoading ? (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 min-w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
                    <RotateCw className="h-3 w-3 animate-spin" />
                  </span>
                ) : (
                  unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
            {connectionState !== 'connected' && <p className="text-yellow-600 mt-1">{t('connectionState', { state: connectionState })}</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <h4 className="font-medium">{t('notifications')}</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              {t('markAllAsRead')}
            </Button>
          )}
        </div>
        <Tabs value={notificationType} onValueChange={(v) => setNotificationType(v as NotificationType)}>
          <div className="border-b px-1">
            <TabsList className="w-full justify-start rounded-none border-b-0 p-0">
              {types.map((tab) => (
                <TabsTrigger key={tab} value={tab} className="rounded-none px-3 py-1.5 data-[state=active]:border-b-2 capitalize">
                  {t(`tab.${tab}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <TabsContent value={notificationType} className="focus-visible:outline-none ">
            <ScrollArea className="h-[300px]">
              {isLoading ? (
                <div className="space-y-2 p-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : notifications.length > 0 ? (
                <div className="space-y-1 p-1">
                  {notifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      userTenantId={userTenant.userTenantId}
                      markAsRead={markAsRead}
                      markAsUnread={markAsUnread}
                      deleteNotification={deleteNotification}
                      mode="compact"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center">
                  <p className="text-sm text-muted-foreground">{t('noNotifications')}</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          <Button className="w-full" variant="link" size="sm">
            <Link href={{ pathname: '/admin/[tenantId]/notifications', params: { tenantId } }} className="w-full">
              {t('viewAll')}
            </Link>
          </Button>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
