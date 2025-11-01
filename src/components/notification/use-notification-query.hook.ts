'use client';

import { useCallback, useMemo, useReducer } from 'react';
import { deleteNotification } from '@/actions/notification';
import { useCountNotification, useFindManyNotification, useUpdateManyNotificationRecipient } from '@/services/api/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useChannel } from 'ably/react';

import { NewNotificationType, NotificationDataType, NotificationType, NotificationTypeEnum } from '@/types/notification';
import { NotificationDefaultArgs } from '@/types/prisma/notification';

import { useNotifications } from './notification-provider.core';

export interface UseNotificationsCoreResult {
  tenantId: string;
  isLoading: boolean;
  unreadCount: number;
  notifications: NotificationDataType[];
  markAllAsRead: () => void;
  toggleNotifications: () => void;
  deleteNotification: (notificationId: string) => void;
  markAsUnread: (notificationId: string) => void;
  markAsRead: (notificationId: string) => void;
  notificationType: NotificationType;
  setNotificationType: (type: NotificationType) => void;
  totalItems: number;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  search: string;
  setSearch: (search: string) => void;
}

type NotificationFilterAction =
  | { type: 'SET_TYPE'; payload: NotificationType }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_PAGE_SIZE'; payload: number }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'TOGGLE_ENABLED' };

interface NotificationFilterState {
  notificationType: NotificationType;
  page: number;
  pageSize: number;
  search: string;
}

const initialFilterState: NotificationFilterState = {
  page: 1,
  pageSize: 10,
  search: '',
  notificationType: NotificationTypeEnum.ALL,
};

function filterReducer(state: NotificationFilterState, action: NotificationFilterAction): NotificationFilterState {
  switch (action.type) {
    case 'SET_TYPE':
      return { ...state, notificationType: action.payload, page: 1 };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'SET_PAGE_SIZE':
      return { ...state, pageSize: action.payload, page: 1 };
    case 'SET_SEARCH':
      return { ...state, search: action.payload, page: 1 };
    default:
      return state;
  }
}

function isNotificationTypeType(value: unknown): value is NotificationDataType {
  return Object.values(NotificationTypeEnum).includes(value as NotificationType);
}

export function useNotificationsQuery(tenantId: string, userTenantId: string): UseNotificationsCoreResult {
  const queryClient = useQueryClient();
  const { isNotificationsEnabled } = useNotifications();
  const [filterState, dispatch] = useReducer(filterReducer, initialFilterState);

  const {
    data: notifications = [],
    isLoading,
    queryKey: notificationsQueryKey,
  } = useFindManyNotification({
    select: {
      ...NotificationDefaultArgs.select,
      recipients: {
        select: {
          ...NotificationDefaultArgs.select.recipients.select,
        },
        where: { userTenantId },
      },
    },
    where: {
      tenantId,
      recipients: { some: { userTenantId } },
      ...(filterState.notificationType !== NotificationTypeEnum.ALL && { type: filterState.notificationType }),
      ...(filterState.search && { body: { contains: filterState.search,  } }),
    },
    orderBy: { createdAt: 'desc' },
    skip: (filterState.page - 1) * filterState.pageSize,
    take: filterState.pageSize,
  });

  const notificationsTyped: NotificationDataType[] = useMemo(() => {
    return notifications.map((notification) => {
      if (isNotificationTypeType(notification.type)) {
        return notification as NotificationDataType;
      }
      console.warn(`Invalid notification type: ${notification.type}`);
      return { ...notification, type: NotificationTypeEnum.ALL } as NotificationDataType;
    });
  }, [notifications]);

  const {
    data: totalItems = 0,
    isLoading: isTotalItemsRefetching,
    queryKey: totalItemsQueryKey,
  } = useCountNotification({
    where: {
      tenantId,
      recipients: { some: { userTenantId } },
      ...(filterState.notificationType !== NotificationTypeEnum.ALL && { type: filterState.notificationType }),
      ...(filterState.search && {
        OR: [{ body: { contains: filterState.search,  } }],
      }),
    },
  });

  const { data: unreadCount = 0, queryKey: unreadCountQueryKey } = useCountNotification({
    where: {
      tenantId,
      recipients: { some: { userTenantId, readAt: null } },
    },
  });

  const { mutateAsync: updateRecipient } = useUpdateManyNotificationRecipient();

  useChannel({ channelName: `notifications:${tenantId}` }, (message) => {
    if (!isNotificationsEnabled) return;
    const data = message.data as NewNotificationType;
    const isRecipient = Array.isArray(data.recipients) && (data.recipients.length === 0 || data.recipients.some((r) => r.userTenantId === userTenantId));

    if (data.tenantId === tenantId && isRecipient) {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey, exact: true });
      queryClient.invalidateQueries({ queryKey: totalItemsQueryKey, exact: true });
      queryClient.invalidateQueries({ queryKey: unreadCountQueryKey, exact: true });
    }
  });

  const toggleNotifications = useCallback(() => dispatch({ type: 'TOGGLE_ENABLED' }), []);

  const updateRecipientStatus = useCallback(
    async (notificationId: string, readAt: Date | null) => {
      await updateRecipient({
        where: { tenantId, userTenantId, notificationId },
        data: { readAt },
      });
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey, exact: true });
      queryClient.invalidateQueries({ queryKey: totalItemsQueryKey, exact: true });
      queryClient.invalidateQueries({ queryKey: unreadCountQueryKey, exact: true });
    },
    [updateRecipient, tenantId, userTenantId, queryClient, notificationsQueryKey, totalItemsQueryKey, unreadCountQueryKey]
  );

  const markAllAsRead = useCallback(async () => {
    await updateRecipient({
      where: { tenantId, userTenantId, readAt: null },
      data: { readAt: new Date() },
    });
    queryClient.invalidateQueries({ queryKey: notificationsQueryKey, exact: true });
    queryClient.invalidateQueries({ queryKey: totalItemsQueryKey, exact: true });
    queryClient.invalidateQueries({ queryKey: unreadCountQueryKey, exact: true });
  }, [updateRecipient, tenantId, userTenantId, queryClient, notificationsQueryKey, totalItemsQueryKey, unreadCountQueryKey]);

  const markAsRead = useCallback((notificationId: string) => updateRecipientStatus(notificationId, new Date()), [updateRecipientStatus]);

  const markAsUnread = useCallback((notificationId: string) => updateRecipientStatus(notificationId, null), [updateRecipientStatus]);

  const _deleteNotification = useCallback(
    async (notificationId: string) => {
      await deleteNotification(tenantId, userTenantId, notificationId);
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey, exact: true });
      queryClient.invalidateQueries({ queryKey: totalItemsQueryKey, exact: true });
    },
    [tenantId, userTenantId, queryClient, notificationsQueryKey, totalItemsQueryKey]
  );

  const setNotificationType = useCallback(
    (type: NotificationType) => {
      dispatch({ type: 'SET_TYPE', payload: type });
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey, exact: true });
      queryClient.invalidateQueries({ queryKey: totalItemsQueryKey, exact: true });
    },
    [queryClient, notificationsQueryKey, totalItemsQueryKey]
  );

  const setPage = useCallback(
    (page: number) => {
      dispatch({ type: 'SET_PAGE', payload: page });
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey, exact: true });
      queryClient.invalidateQueries({ queryKey: totalItemsQueryKey, exact: true });
    },
    [queryClient, notificationsQueryKey, totalItemsQueryKey]
  );

  const setPageSize = useCallback(
    (size: number) => {
      dispatch({ type: 'SET_PAGE_SIZE', payload: size });
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey, exact: true });
      queryClient.invalidateQueries({ queryKey: totalItemsQueryKey, exact: true });
    },
    [queryClient, notificationsQueryKey, totalItemsQueryKey]
  );

  const setSearch = useCallback(
    (search: string) => {
      dispatch({ type: 'SET_SEARCH', payload: search });
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey, exact: true });
      queryClient.invalidateQueries({ queryKey: totalItemsQueryKey, exact: true });
    },
    [queryClient, notificationsQueryKey, totalItemsQueryKey]
  );

  return {
    notifications: notificationsTyped,
    isLoading: isLoading || isTotalItemsRefetching,
    tenantId,
    totalItems,
    unreadCount,
    markAllAsRead,
    markAsRead,
    markAsUnread,
    deleteNotification: _deleteNotification,
    toggleNotifications,
    notificationType: filterState.notificationType,
    setNotificationType,
    page: filterState.page,
    setPage,
    pageSize: filterState.pageSize,
    setPageSize,
    search: filterState.search,
    setSearch,
  };
}
