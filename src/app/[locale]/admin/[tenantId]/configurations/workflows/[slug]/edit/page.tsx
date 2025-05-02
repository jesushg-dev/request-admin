import { FC } from 'react';
import { db } from '@/server/db-client';
import { type Locale } from 'next-intl';

import { RequestWorkflowDefaultArgs } from '@/types/prisma/workflow';
import { transformStatusToNode, transformTransitionToEdge } from '@/lib/workflow';
import WorkflowFormStepper from '@/components/common/workflow/workflow-stepper';

interface UpdateRequirementPageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

const UpdateRequirementPage: FC<UpdateRequirementPageProps> = async ({ params }) => {
  const { tenantId, slug } = await params;

  const workflow = await db.requestWorkflow.findFirst({
    ...RequestWorkflowDefaultArgs,
    where: { tenantId, id: slug },
  });

  if (!workflow) {
    throw new Error('Workflow not found');
  }
  const { requestWorkflowStatus, requestWorkflowTransition, ...workflowData } = workflow;
  const nodes = requestWorkflowStatus.map(transformStatusToNode);
  const edges = requestWorkflowTransition.map(transformTransitionToEdge);

  return <WorkflowFormStepper tenantId={tenantId} defaultValues={{ ...workflowData, description: workflowData.description ?? undefined, nodes, edges }} />;
};

export default UpdateRequirementPage;
