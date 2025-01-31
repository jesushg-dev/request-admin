import { auth } from '@/server/auth';
import { db } from '@/server/db-client';
import { omit } from 'lodash';

import { RequirementDefaultArgs } from '@/types/prisma/requirement';
import { RequirementFormValues } from '@/components/common/requirement/requirement-form';

class UserNotFoundErr extends Error {}

export const getRequirementsAsOptions = async (tenantId: string) => {
  const session = await auth();
  if (!session) throw new UserNotFoundErr('User not found');

  const requirements = await db.requirement.findMany({ ...RequirementDefaultArgs, where: { tenantId } });
  const preparedRequirements = requirements.map((req) => ({ value: req.id, label: req.name }));

  return preparedRequirements;
};

export const getRequirementAsFormById = async (id: string, tenantId: string) => {
  const session = await auth();
  if (!session) throw new UserNotFoundErr('User not found');

  const requirement = await db.requirement.findFirstOrThrow({
    select: {
      id: true,
      name: true,
      description: true,
      requirementTypeId: true,
      isRequiredOnlyOnce: true,
      isActive: true,
      requirementType: { select: { id: true, name: true } },
    },
    where: { id, tenantId },
  });

  const initialValues: RequirementFormValues = {
    ...omit(requirement, ['requirementType']),
    description: requirement.description ?? '',
    requirementType: { label: requirement.requirementType.name, value: requirement.requirementTypeId },
  };

  return initialValues;
};
