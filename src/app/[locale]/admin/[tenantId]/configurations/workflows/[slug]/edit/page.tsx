import { FC } from 'react';
import { type Locale } from 'next-intl';
import { redirect } from '@/i18n/routing';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { db } from '@/server/db-client';

import { RequestWorkflowDefaultArgs, RequestWorkflowType } from '@/types/prisma/workflow';
import { transformStatusToNode, transformTransitionToEdge } from '@/lib/workflow';
import WorkflowFormStepper from '@/components/common/workflow/workflow-stepper';

interface UpdateWorkflowPageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

const UpdateWorkflowPage: FC<UpdateWorkflowPageProps> = async ({ params }) => {
  const { tenantId, slug, locale } = await params;

  const auth = await getAuthContext(tenantId);
  const canEdit = auth.hasPermissions([PermissionActions.WORKFLOW.EDIT]);
  
  if (!canEdit) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/workflows', params: { tenantId } } });
  }

  const workflow = await db.requestWorkflow.findFirst({
    ...RequestWorkflowDefaultArgs,
    where: { tenantId, id: slug },
  });

  if (!workflow) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/workflows', params: { tenantId } } });
  }

  const { requestWorkflowStatus, requestWorkflowTransition, ...workflowData } = workflow as RequestWorkflowType;
  const nodes = requestWorkflowStatus.map(transformStatusToNode);
  const edges = requestWorkflowTransition.map(transformTransitionToEdge);

  return <WorkflowFormStepper tenantId={tenantId} defaultValues={{ ...workflowData, description: workflowData.description ?? undefined, nodes, edges }} />;
};

export default UpdateWorkflowPage;
