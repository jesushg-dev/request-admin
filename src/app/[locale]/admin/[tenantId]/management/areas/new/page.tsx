import { db } from '@/server/db-server';

import { AssignmentHierarchyDefaultArgs } from '@/types/prisma/hierarchy';
import { ModuleDefaultArgs } from '@/types/prisma/module';
import { RequirementDefaultArgs } from '@/types/prisma/requirement';
import { UserDefaultArgs } from '@/types/prisma/user';

import StepsComponent from './steps-component';

export default async function NewAreaPage() {
  // Fetch hierarchy data using Prisma
  const hierarchy = await db.assignationHierarchy.findFirst({ ...AssignmentHierarchyDefaultArgs });

  const requirements = await db.requirement.findMany({ ...RequirementDefaultArgs });
  const modules = await db.module.findMany({
    ...ModuleDefaultArgs,
    where: { feature: { some: { NOT: { scope: 'global' } } } },
  });
  const users = await db.user.findMany({ ...UserDefaultArgs });

  const preparedRequirements = requirements.map((req) => ({ value: req.id, label: req.name }));

  if (!hierarchy) {
    return { notFound: true };
  }

  const levels = hierarchy.levels.sort((a, b) => a.position - b.position);

  return <StepsComponent assignationLevels={levels} requirements={preparedRequirements} users={users} moduleWithFeatures={modules} />;
}
