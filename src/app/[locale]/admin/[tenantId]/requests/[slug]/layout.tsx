'use client';

import { usePanel } from '@/hooks/use-panel';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Profile } from '@/components/chat/profile';
import { Thread } from '@/components/chat/thread';
import { useTenantContext } from '@/components/hoc/tenant-provider';
import { Spinner } from '@/components/spinner';

interface RoomChatLayoutProps {
  children: React.ReactNode;
}

const RoomChatLayout = ({ children }: RoomChatLayoutProps) => {
  const { tenantId, userTenant } = useTenantContext();
  const { parentMessageId, onClose, profileUserId } = usePanel();
  const showPanel = !!parentMessageId || !!profileUserId;

  return (
    <>
      {children}
      <Sheet open={showPanel} onOpenChange={onClose}>
        <SheetHeader>
          <SheetTitle className="sr-only">Panel</SheetTitle>
        </SheetHeader>
        <SheetContent side="right" className="w-full max-w-lg p-0">
          {parentMessageId ? (
            <Thread tenantId={tenantId} roomId={parentMessageId} currentUserTenant={userTenant} messageId={parentMessageId} onClose={onClose} />
          ) : profileUserId ? (
            <Profile userTenantId={profileUserId} tenantId={tenantId} onClose={onClose} />
          ) : (
            <Spinner />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default RoomChatLayout;
