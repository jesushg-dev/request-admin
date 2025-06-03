'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { createNotification } from '@/actions/notification';
import { useChannel, useConnectionStateListener } from 'ably/react';

import { NewNotificationType } from '@/types/notification';

type NotificationState = 'active' | 'idle' | 'unread' | 'disabled' | 'error';

interface NotificationContextType {
  connectionState: string;
  notificationState: NotificationState;
  sendInAppNotification: (notification: NewNotificationType) => Promise<void>;
  isNotificationsEnabled: boolean;
  setIsNotificationsEnabled: (enabled: boolean) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationContent({ children, tenantId }: { children: ReactNode; tenantId: string }) {
  const [connectionState, setConnectionState] = useState('initializing');
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const notificationState = useMemo<NotificationState>(() => {
    if (!isNotificationsEnabled) return 'disabled';
    if (connectionState !== 'connected') return 'error';
    return 'active';
  }, [isNotificationsEnabled, connectionState]);

  const { publish } = useChannel(`notifications:${tenantId}`);

  useConnectionStateListener(useCallback((stateChange) => setConnectionState(stateChange.current), []));

  const sendInAppNotification = useCallback(
    async (notification: NewNotificationType) => {
      try {
        await createNotification(notification);
        await publish(`notifications:${tenantId}`, notification);
      } catch (error) {
        console.error('Error publishing notification:', error);
        throw error;
      }
    },
    [publish, tenantId]
  );

  const contextValue = useMemo<NotificationContextType>(
    () => ({
      connectionState,
      setIsNotificationsEnabled,
      notificationState,
      sendInAppNotification,
      isNotificationsEnabled,
    }),
    [connectionState, notificationState, sendInAppNotification, isNotificationsEnabled]
  );

  return <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
