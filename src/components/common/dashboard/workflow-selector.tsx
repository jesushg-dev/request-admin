'use client';

import { useEffect, useState } from 'react';
import { getWorkflows } from '@/actions/dashboard';
import { ChevronDown } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';

interface WorkflowSelectorProps {
  tenantId: string;
  selectedWorkflow: string | null;
  onWorkflowChange: (workflowId: string | null) => void;
}

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  _count: {
    requestCategory: number;
  };
}

export function WorkflowSelector({ tenantId, selectedWorkflow, onWorkflowChange }: WorkflowSelectorProps) {
  const t = useTranslations('admin.dashboard.workflowSelector');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkflows() {
      try {
        const workflowsData = await getWorkflows(tenantId);
        setWorkflows(workflowsData as Workflow[]);
      } catch (error) {
        console.error('Error fetching workflows:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkflows();
  }, [tenantId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{t('title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <div className="w-80">
          <Select value={selectedWorkflow || 'all'} onValueChange={(value) => onWorkflowChange(value === 'all' ? null : value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('placeholders.select')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('options.all')}</SelectItem>
              {workflows.map((workflow) => (
                <SelectItem key={workflow.id} value={workflow.id}>
                  {workflow.name} {workflow._count.requestCategory > 0 && `(${workflow._count.requestCategory} ${t('options.categories')})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedWorkflow && (
        <Card className="p-8 text-center border-dashed">
          <CardContent>
            <div className="text-muted-foreground mb-2">
              <ChevronDown className="h-8 w-8 mx-auto" />
            </div>
            <p className="text-muted-foreground">{t('helper')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
