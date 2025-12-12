'use client';

import { Bell, Check, Filter, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { NotificationType } from '@/types/notification';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTenantContext } from '@/components/hoc/tenant-provider';
import { NotificationCard } from '@/components/notification/notification-card';
import { useNotificationsQuery } from '@/components/notification/use-notification-query.hook';

const types: NotificationType[] = ['all', 'assignment', 'status', 'comment', 'system'];

export default function NotificationsPage() {
  const { tenantId, userTenant } = useTenantContext();
  const t = useTranslations('component.notification');
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    markAsUnread,
    deleteNotification,
    notificationType,
    setNotificationType,
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    isLoading,
    totalItems,
  } = useNotificationsQuery(tenantId, userTenant.userTenantId);

  const total = totalItems ?? notifications.length;

  return (
    <div className="container mx-auto p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{t('notifications')}</h1>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {t('unreadCount', { count: unreadCount, defaultValue: '{count} unread' })}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('searchPlaceholder', { defaultValue: 'Search notifications...' })}
              className="w-[200px] pl-8 md:w-[300px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label={t('filter', { defaultValue: 'Filter notifications' })}>
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSearch('no leída')}>{t('showOnlyUnread', { defaultValue: 'Show only unread' })}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearch('')}>{t('showAll', { defaultValue: 'Show all' })}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              {t('markAllAsRead')}
            </Button>
          )}
        </div>
      </div>

      <div className="relative block md:hidden">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder={t('searchPlaceholder', { defaultValue: 'Search notifications...' })} className="w-full pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle>{t('centerTitle', { defaultValue: 'Notification Center' })}</CardTitle>
          <CardDescription>{t('centerDescription', { defaultValue: 'Manage all your system notifications in one place.' })}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={notificationType} onValueChange={(v) => setNotificationType(v as NotificationType)} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-5 md:w-auto md:grid-cols-none md:flex">
              {types.map((tab) => (
                <TabsTrigger key={tab} value={tab} className="rounded-none px-3 py-1.5 data-[state=active]:border-b-2 capitalize">
                  {t(`tab.${tab}`)}
                </TabsTrigger>
              ))}
            </TabsList>
            <Separator className="my-4" />
            <TabsContent value={notificationType} className="focus-visible:outline-none flex-1 flex flex-col overflow-hidden">
              {isLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : notifications.length > 0 ? (
                <div className="space-y-4 overflow-y-auto flex flex-col flex-1">
                  {notifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      userTenantId={userTenant.userTenantId}
                      markAsRead={markAsRead}
                      markAsUnread={markAsUnread}
                      deleteNotification={deleteNotification}
                      mode="default"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center">
                  <p className="text-muted-foreground">{t('noNotifications')}</p>
                </div>
              )}
            </TabsContent>
            <Pagination
              currentPage={page}
              setCurrentPage={setPage}
              itemsPerPage={pageSize}
              setItemsPerPage={setPageSize}
              totalItems={total}
              pageSizeOptions={[5, 10, 20]}
              className="mt-6"
            />
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
