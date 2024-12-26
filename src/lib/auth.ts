import { auth } from '@/server/auth';

export const currentUser = async () => {
  const session = await auth();
  return session?.user;
};

export const currentFeatures = async () => {
  const session = await auth();

  return session?.user?.features;
};
