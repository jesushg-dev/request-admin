'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardMetricsClient from '@/components/common/dashboard/dashboard-metrics-client';
import DashboardStats from '@/components/common/dashboard/dashboard-stats';
import QuickStatsCards from '@/components/common/dashboard/quick-stats-cards';
import RecentRequests from '@/components/common/dashboard/recent-requests';
import { SLADashboard } from '@/components/common/dashboard/sla-dashboard';
import { SLAFilters, SLAFilterValues } from '@/components/common/dashboard/sla-filters';
import { WorkflowSelector } from '@/components/common/dashboard/workflow-selector';
import { useTenantContext } from '@/components/hoc/tenant-provider';

export default function Home() {
  const { tenantId } = useTenantContext();
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  const handleSearch = (filters: SLAFilterValues): void => {
    console.log('Searching with filters:', filters);
    toast.info('Búsqueda aplicada', {
      description: 'Los filtros han sido aplicados correctamente',
    });
  };

  const handleWorkflowChange = (workflowId: string | null): void => {
    setSelectedWorkflow(workflowId);
    console.log('Selected workflow:', workflowId);

    if (workflowId) {
      toast.success('Flujo de trabajo seleccionado', {
        description: `Se ha seleccionado el flujo: ${workflowId}`,
      });
    }
  };

  return (
    <ScrollArea className="flex-grow min-h-0">
      <div className="container py-6 flex flex-col h-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Bienvenido al sistema de gestión de solicitudes de Claro-Nicaragua</p>
          </div>
          <Button className="w-full md:w-auto">
            <Link className="flex gap-2 items-center" href={{ pathname: '/admin/[tenantId]/requests/new', params: { tenantId } }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Solicitud
            </Link>
          </Button>
        </div>

        <div className="mt-8 flex flex-col flex-grow min-h-0">
          <Tabs defaultValue="general" className="flex flex-col flex-grow min-h-0">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="workflow">Flujo de Trabajo</TabsTrigger>
              <TabsTrigger value="sla">SLAs</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="h-full overflow-y-auto">
              <div className="mt-8">
                <DashboardMetricsClient tenantId={tenantId} workflowId={null} />
              </div>

              <div className="mt-8">
                <DashboardStats tenantId={tenantId} workflowId={null} />
              </div>

              <div className="mt-8">
                <QuickStatsCards tenantId={tenantId} workflowId={null} />
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-bold">Solicitudes Recientes</h2>
                <div className="mt-4">
                  <RecentRequests tenantId={tenantId} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="workflow" className="h-full overflow-y-auto">
              <div className="mt-8">
                <WorkflowSelector tenantId={tenantId} selectedWorkflow={selectedWorkflow} onWorkflowChange={handleWorkflowChange} />
              </div>

              <div className="mt-8">
                <DashboardMetricsClient tenantId={tenantId} workflowId={selectedWorkflow} />
              </div>

              <div className="mt-8">
                <DashboardStats tenantId={tenantId} workflowId={selectedWorkflow} />
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-bold">Solicitudes Recientes {selectedWorkflow && `- ${selectedWorkflow}`}</h2>
                <div className="mt-4">
                  <RecentRequests tenantId={tenantId} workflowFilter={selectedWorkflow} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sla" className="h-full overflow-y-auto">
              <div className="mt-6">
                <SLAFilters onSearch={handleSearch} />
              </div>

              <div className="mt-8">
                <SLADashboard />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ScrollArea>
  );
}
