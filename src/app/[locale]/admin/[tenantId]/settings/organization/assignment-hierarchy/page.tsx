import { FC } from 'react';
import { upsertAssignmentHierarchy } from '@/actions/hierarchy';
import { db } from '@/server/db-client';
import { type Locale } from 'next-intl';

import { generateUuid } from '@/lib/id';
import { HierarchyFormStepper, HierarchyFormStepperValues } from '@/components/common/hierarchy/hierarchy-form-stepper';

interface AssignmentHierarchyFormProps {
  params: Promise<{ locale: Locale; tenantId: string }>;
}

const AssignmentHierarchyForm: FC<AssignmentHierarchyFormProps> = async ({ params }) => {
  const { tenantId } = await params;

  const hierarchy = await db.assignmentHierarchy.findFirst({
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      levels: {
        select: {
          id: true,
          name: true,
          description: true,
          position: true,
        },
      },
    },
    where: {
      tenantId,
    },
  });

  const defaultValues: HierarchyFormStepperValues = {
    id: hierarchy?.id ?? generateUuid(),
    name: hierarchy?.name ?? '',
    description: hierarchy?.description ?? '',
    isActive: hierarchy?.isActive ?? true,
    levels: hierarchy?.levels
      .sort((a, b) => a.position - b.position)
      .map((level) => ({
        id: level.id,
        name: level.name,
        description: level.description ?? '',
        isActive: true,
      })) ?? [{ id: generateUuid(), name: '', isActive: true }],
  };

  const isInUse = hierarchy ? (await db.assignmentCategory.count({ where: { hierarchyId: hierarchy.id } })) > 0 : false;

  return <HierarchyFormStepper defaultValues={defaultValues} isInUse={isInUse} tenantId={tenantId} upsertAction={upsertAssignmentHierarchy} />;
};

export default AssignmentHierarchyForm;
