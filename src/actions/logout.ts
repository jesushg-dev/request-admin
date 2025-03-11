'use server';

import { headers } from 'next/headers';
import { auth } from '@/server/auth-server';

export const logout = async () => {
  await auth.api.signOut({
    headers: await headers(),
  });
};
