'use server';

import { currentFeatures } from '@/lib/auth';

export const admin = async () => {
  const features = await currentFeatures();

  // todo: improve this
  if ((features?.length ?? 0) > 0) {
    return { success: 'Allowed Server Action!' };
  }

  return { error: 'Forbidden Server Action!' };
};
