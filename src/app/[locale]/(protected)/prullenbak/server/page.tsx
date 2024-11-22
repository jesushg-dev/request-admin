import { currentUser } from '@/services/lib/auth';
import { UserInfo } from '@/components/prullenbak/user-info';

const ServerPage = async () => {
  const user = await currentUser();

  return <UserInfo label="💻 Server component" user={user} />;
};

export default ServerPage;
