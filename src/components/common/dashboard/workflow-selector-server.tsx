import { getWorkflows } from '@/actions/dashboard';
import { Locale } from 'next-intl';

import WorkflowSelectorClient from './workflow-selector-client';

interface WorkflowSelectorServerProps {
  tenantId: string;
  selectedWorkflow: string | null;
  locale: Locale;
}

export default async function WorkflowSelectorServer({ tenantId, selectedWorkflow, locale }: WorkflowSelectorServerProps) {
  const workflows = await getWorkflows(tenantId);

  return <WorkflowSelectorClient workflows={workflows} selectedWorkflow={selectedWorkflow} />;
}
