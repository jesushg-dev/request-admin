import { FC } from 'react';
import { getRequirementsAsOptions } from '@/actions/requirement';
import { db } from '@/server/db-server';

import { AssignmentHierarchyDefaultArgs } from '@/types/prisma/hierarchy';
import { ModuleDefaultArgs } from '@/types/prisma/module';
import { UserDefaultArgs } from '@/types/prisma/user';
import AreaFormStepper from '@/components/common/area/area-form-stepper';

interface NewPageProps {
  params: Promise<{ locale: string; tenantId: string }>;
}

const NewPage: FC<NewPageProps> = async ({ params }) => {
  const { tenantId } = await params;

  // Fetch hierarchy data using Prisma
  const hierarchy = await db.assignmentHierarchy.findFirstOrThrow({ ...AssignmentHierarchyDefaultArgs });

  const requirements = await getRequirementsAsOptions(tenantId);
  const modules = await db.module.findMany({
    ...ModuleDefaultArgs,
    where: {
      feature: { some: { scope: 'area' } },
    },
  });
  const users = await db.user.findMany({ ...UserDefaultArgs });

  const levels = hierarchy.levels.sort((a, b) => a.position - b.position);

  return <AreaFormStepper assignmentLevels={levels} requirements={requirements} users={users} moduleWithFeatures={modules} />;
};

export default NewPage;
