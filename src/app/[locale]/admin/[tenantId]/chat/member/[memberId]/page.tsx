import { findOrCreateConversation } from '@/actions/message';
import { auth } from '@/server/auth';
import { TriangleAlert } from 'lucide-react';

import { Conversation } from './conversation';

interface UserIdPageProps {
  params: Promise<{ tenantId: string; memberId: string }>;
}

const UserIdPage = async ({ params }: UserIdPageProps) => {
  const currentUser = await auth();
  if (!currentUser) return null;

  const { tenantId, memberId: userId } = await params;
  const conversation = await findOrCreateConversation({ tenantId, userId });

  if (!conversation.id) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-y-2">
        <TriangleAlert className="text-muted-foreground size-5" />
        <span className="text-muted-foreground text-sm">Conversation not found</span>
      </div>
    );
  }

  return <Conversation id={conversation.id} userId={userId} tenantId={tenantId} currentUserId={currentUser.user.id} />;
};

export default UserIdPage;
