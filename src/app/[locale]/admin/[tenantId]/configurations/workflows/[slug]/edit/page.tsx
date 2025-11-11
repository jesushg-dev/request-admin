import { type Metadata } from 'next';
import { FC } from 'react';
import { type Locale } from 'next-intl';
import { redirect } from '@/i18n/routing';
import { getAuthContext } from '@/actions/authorization';
import { PermissionActions } from '@/constants/permissions';
import { getDb } from '@/server/db-client';
import { getTranslations } from 'next-intl/server';

import { RequestWorkflowDefaultArgs, RequestWorkflowType } from '@/types/zenstackhq/workflow';
import { transformStatusToNode, transformTransitionToEdge } from '@/lib/workflow';
import WorkflowFormStepper from '@/components/common/workflow/workflow-stepper';

interface UpdateWorkflowPageProps {
  params: Promise<{ locale: Locale; slug: string; tenantId: string }>;
}

export async function generateMetadata(props: UpdateWorkflowPageProps): Promise<Metadata> {
  const { locale, tenantId, slug } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'metadata' });
  
  const db = await getDb();
  const workflow = await db.requestWorkflow.findUnique({
    where: { id: slug, tenantId },
    select: { name: true },
  });
  const workflowName = workflow?.name || `Flujo #${slug}`;

  return {
    title: `${workflowName} - ${t('pages.workflowEdit.title')} - ${t('brandName')}`,
    description: t('pages.workflowEdit.description'),
  };
}

const UpdateWorkflowPage: FC<UpdateWorkflowPageProps> = async ({ params }) => {
  const { tenantId, slug, locale } = await params;

  const auth = await getAuthContext(tenantId);
  const canEdit = auth.hasPermissions([PermissionActions.WORKFLOW.EDIT]);
  
  if (!canEdit) {
    return redirect({ locale, href: { pathname: '/admin/[tenantId]/configurations/workflows', params: { tenantId } } });
  }

  const db = await getDb();
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
