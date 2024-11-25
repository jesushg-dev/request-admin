'use server';

import { currentPermissions } from '@/lib/auth';

export const admin = async () => {
  const permissions = await currentPermissions();

  // todo: improve this
  if ((permissions?.length ?? 0) > 0) {
    return { success: 'Allowed Server Action!' };
  }

  return { error: 'Forbidden Server Action!' };
};
