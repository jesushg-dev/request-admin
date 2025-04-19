'use client';

import { useSession } from '@/server/auth-client';

import { usePanel } from '@/hooks/use-panel';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Profile } from '@/components/chat/profile';
import { Thread } from '@/components/chat/thread';
import { Spinner } from '@/components/spinner';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

const WorkspaceLayout = ({ children }: WorkspaceLayoutProps) => {
  // todo: this doesnt work since we need to fetch the usertenantId from the user in the current tenant
  const session = useSession();
  const { parentMessageId, onClose, profileUserId } = usePanel();
  if (!session.data) {
    return null;
  }
  const showPanel = !!parentMessageId || !!profileUserId;

  return (
    <div className="h-full">
      <ResizablePanelGroup autoSaveId="sc-workspace-layout" direction="horizontal">
        <ResizablePanel minSize={20} defaultSize={80}>
          {children}
        </ResizablePanel>
        {showPanel && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel minSize={20} defaultSize={29}>
              {parentMessageId ? (
                <Thread currentUserTenantId={session.data.user.id} messageId={parentMessageId} onClose={onClose} />
              ) : profileUserId ? (
                <Profile userId={profileUserId} onClose={onClose} />
              ) : (
                <Spinner />
              )}
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

export default WorkspaceLayout;
