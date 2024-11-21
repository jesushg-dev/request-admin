import { auth } from '@/server/auth';

export const currentUser = async () => {
  const session = await auth();
  console.log('🚀 ~ currentUser ~ session:', session);

  return session?.user;
};

export const currentPermissions = async () => {
  const session = await auth();

  return session?.user?.permissions;
};
