import { findOrCreateConversation } from '@/actions/message';
import { getCurrentUserTenant } from '@/actions/user';
import { TriangleAlert } from 'lucide-react';

import { Conversation } from './conversation';

interface UserIdPageProps {
  params: Promise<{ tenantId: string; memberId: string }>;
}

const UserIdPage = async ({ params }: UserIdPageProps) => {
  const { tenantId, memberId: userId } = await params;
  const currentUser = await getCurrentUserTenant(tenantId);
  const conversation = await findOrCreateConversation({ tenantId, userId });

  if (!conversation.id) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-y-2">
        <TriangleAlert className="text-muted-foreground size-5" />
        <span className="text-muted-foreground text-sm">Conversation not found</span>
      </div>
    );
  }

  return <Conversation id={conversation.id} userTenantId={userId} tenantId={tenantId} currentUserTenant={currentUser} />;
};

export default UserIdPage;
