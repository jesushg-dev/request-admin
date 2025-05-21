'use server';

import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-client';

import { RequestPriorityTypeDefaultArgs } from '@/types/prisma/priority';
import { RequestPriorityTypeFormValues } from '@/components/common/priority/priority-form';

class UserNotFoundErr extends Error {}

export const getRequestPriorityTypesAsOptions = async (tenantId: string) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  return await db.requestPriorityType.findMany({ ...RequestPriorityTypeDefaultArgs, where: { tenantId, isActive: true } });
};

export const getRequestPriorityTypeAsFormById = async (id: string, tenantId: string): Promise<RequestPriorityTypeFormValues> => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  const priority = await db.requestPriorityType.findFirstOrThrow({
    select: {
      id: true,
      name: true,
      description: true,
      primaryColor: true,
      level: true,
      isActive: true,
      //isDefault: true,
    },
    where: { id, tenantId },
  });

  return {
    ...priority,
    isDefault: false,
    description: priority.description ?? '',
  };
};
