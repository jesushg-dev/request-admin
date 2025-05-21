'use server';

import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-client';

import { RequirementTypeDefaultArgs } from '@/types/prisma/requirementType';
import { RequirementTypeFormValues } from '@/components/common/requirement-type/requirement-type-form';

class UserNotFoundErr extends Error {}

export const getRequirementTypesAsOptions = async (tenantId: string) => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  return await db.requirementType.findMany({ ...RequirementTypeDefaultArgs, where: { tenantId, isActive: true } });
};

export const getRequirementTypeAsFormById = async (id: string, tenantId: string): Promise<RequirementTypeFormValues> => {
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr('User not found');

  const requirementType = await db.requirementType.findFirstOrThrow({
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      //isDefault: true,
    },
    where: { id, tenantId },
  });

  return {
    ...requirementType,
    isDefault: false,
    description: requirementType.description ?? '',
  };
};
