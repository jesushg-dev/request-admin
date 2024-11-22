'use client';

import { UserInfo } from '@/components/prullenbak/user-info';
import { useCurrentUser } from '@/hooks/use-current-user.hook';

const ClientPage = () => {
  const user = useCurrentUser();

  return <UserInfo label="📱 Client component" user={user} />;
};

export default ClientPage;
