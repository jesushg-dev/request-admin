import { db } from '@/server/db-server';

import { ModuleDefaultArgs } from '@/types/prisma/module';
import { RequirementDefaultArgs } from '@/types/prisma/requirement';
import { UserDefaultArgs } from '@/types/prisma/user';
import RoleFormStepper from '@/components/common/role/role-form-stepper';

export default async function NewRolePage() {
  const requirements = await db.requirement.findMany({ ...RequirementDefaultArgs });
  const modules = await db.module.findMany({
    ...ModuleDefaultArgs,
    where: {
      feature: { some: { scope: 'global' } },
    },
  });
  const users = await db.user.findMany({ ...UserDefaultArgs });

  const preparedRequirements = requirements.map((req) => ({ value: req.id, label: req.name }));

  return <RoleFormStepper requirements={preparedRequirements} users={users} moduleWithFeatures={modules} />;
}
