'use client';

import { type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { AblyProvider, ChannelProvider } from 'ably/react';

import { getAblyClient } from '@/lib/ablyClient';

import { NotificationContent } from './notification-provider.core';

// Component that wraps children with Ably providers
const AblyWrapper = dynamic(
  () => {
    const Component = ({ children, tenantId, userTenantId }: { children: ReactNode; tenantId: string; userTenantId: string }) => {
      const client = getAblyClient(userTenantId);

      return (
        <AblyProvider client={client}>
          <ChannelProvider channelName={`notifications:${tenantId}`}>{children}</ChannelProvider>
        </AblyProvider>
      );
    };
    return Promise.resolve(Component);
  },
  {
    ssr: false,
    loading: () => <div>Loading notifications...</div>,
  }
);

// Main provider
export default function NotificationProvider({ children, tenantId, userTenantId }: { children: ReactNode; tenantId: string; userTenantId: string }) {
  return (
    <AblyWrapper tenantId={tenantId} userTenantId={userTenantId}>
      <NotificationContent tenantId={tenantId}>{children}</NotificationContent>
    </AblyWrapper>
  );
}
