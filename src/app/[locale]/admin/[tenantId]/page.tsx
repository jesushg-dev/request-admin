'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { AlertTriangle, ArrowRight, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralMetrics } from '@/components/common/dashboard/dashboard-metrics';
import DashboardStats from '@/components/common/dashboard/dashboard-stats';
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
                <GeneralMetrics />
              </div>

              <div className="mt-8">
                <DashboardStats />
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Solicitudes Pendientes</CardTitle>
                    <CardDescription>Solicitudes que requieren atención</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">12</div>
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                      <span>4 con prioridad alta</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link className="flex items-center gap-1" href={{ pathname: '/admin/[tenantId]/requests', params: { tenantId }, query: { status: 'pending' } }}>
                        Ver todas
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Solicitudes Completadas</CardTitle>
                    <CardDescription>Solicitudes resueltas este mes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">48</div>
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                      <span>Tiempo promedio: 2.3 días</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link className="flex items-center gap-1" href={{ pathname: '/admin/[tenantId]/requests', params: { tenantId }, query: { status: 'completed' } }}>
                        Ver todas
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Reportes</CardTitle>
                    <CardDescription>Análisis de desempeño</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">
                      <AlertTriangle className="h-8 w-8" />
                    </div>
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                      <span>Accede a reportes detallados</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link className="flex items-center gap-1" href={{ pathname: '/admin/[tenantId]/reports', params: { tenantId } }}>
                        Ver reportes
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-bold">Solicitudes Recientes</h2>
                <div className="mt-4">
                  <RecentRequests />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="workflow" className="h-full overflow-y-auto">
              <div className="mt-8">
                <WorkflowSelector selectedWorkflow={selectedWorkflow} onWorkflowChange={handleWorkflowChange} />
              </div>

              <div className="mt-8">
                <DashboardStats />
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-bold">Solicitudes Recientes {selectedWorkflow && `- ${selectedWorkflow}`}</h2>
                <div className="mt-4">
                  <RecentRequests workflowFilter={selectedWorkflow} />
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
