'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ExecutionFlowInfo, ExecutionStep } from '@/actions/report';
import { getExecutionFlowDetails, getExecutionFlows } from '@/actions/report';
import { ArrowRight, CheckCircle2, Clock, Download, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useExecutionExport } from '@/hooks/use-execution-export';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmptyState from '@/components/shared/empty-state';

interface ExecutionTabProps {
  tenantId: string;
  loading: boolean;
}

export function ExecutionTab({ tenantId, loading: initialLoading }: ExecutionTabProps) {
  const t = useTranslations('admin.reports.page.executionTab');
  const { handleExport: handleExecutionExport } = useExecutionExport();
  const [flows, setFlows] = useState<ExecutionFlowInfo[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<ExecutionFlowInfo | null>(null);
  const [flowDetails, setFlowDetails] = useState<{ flow: any; steps: ExecutionStep[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (!tenantId) return;

    async function loadFlows() {
      try {
        const flowsData = await getExecutionFlows(tenantId);
        setFlows(flowsData);
      } catch (error) {
        console.error('Error loading execution flows:', error);
      } finally {
        setLoading(false);
      }
    }

    loadFlows();
  }, [tenantId]);

  const handleFlowSelect = async (flowId: string) => {
    const flow = flows.find((f) => f.id === flowId) || null;
    setSelectedFlow(flow);

    if (flow) {
      setLoadingDetails(true);
      try {
        const details = await getExecutionFlowDetails(tenantId, flowId);
        setFlowDetails(details);
      } catch (error) {
        console.error('Error loading flow details:', error);
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  if (initialLoading || loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="h-[400px] flex items-center justify-center">
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (flows.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <EmptyState title={t('empty.title')} description={t('empty.description')} icons={[FileText, Clock, CheckCircle2]} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>{t('models.title')}</CardTitle>
          <CardDescription>{t('models.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleFlowSelect}>
            <SelectTrigger>
              <SelectValue placeholder={t('models.selectPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {flows.map((flow) => (
                <SelectItem key={flow.id} value={flow.id}>
                  {flow.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="mt-4 space-y-4">
            {flows.map((flow) => (
              <div
                key={flow.id}
                className={`cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted ${selectedFlow?.id === flow.id ? 'border-primary bg-muted/50' : ''}`}
                onClick={() => handleFlowSelect(flow.id)}>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{flow.name}</h3>
                  <Badge>v{flow.version}</Badge>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{t('models.avgTime', { days: flow.avgCompletionTime })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{t('models.successRate', { rate: flow.successRate })}</span>
                  </div>
                  <div className="mt-1 text-xs">{t('models.executions', { count: flow.executionCount })}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedFlow &&
        (loadingDetails ? (
          <Card className="md:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                <Skeleton className="h-64 w-full" />
              </div>
            </CardContent>
          </Card>
        ) : flowDetails ? (
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedFlow.name}</CardTitle>
                  <CardDescription>
                    {t('details.version', { version: selectedFlow.version })} | {t('details.nodes', { count: selectedFlow.nodeCount })} |{' '}
                    {t('details.executions', { count: selectedFlow.executionCount })}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="px-3 py-1">
                  {t('details.successRate', { rate: selectedFlow.successRate })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="steps">
                <TabsList className="mb-4">
                  <TabsTrigger value="steps">{t('tabs.steps')}</TabsTrigger>
                  <TabsTrigger value="metrics">{t('tabs.metrics')}</TabsTrigger>
                </TabsList>
                <TabsContent value="steps">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t('steps.title')}</h3>
                      <span className="text-sm text-muted-foreground">{t('steps.total', { days: selectedFlow.avgCompletionTime })}</span>
                    </div>

                    <div className="space-y-4">
                      {flowDetails.steps.map((step, index) => (
                        <div key={step.id} className="rounded-lg border p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">{index + 1}</div>
                              <h4 className="font-medium">{step.name}</h4>
                            </div>
                            <Badge variant="outline">{t('steps.days', { days: step.avgTime.toFixed(1) })}</Badge>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>{t('steps.compliance')}:</span>
                              <span>{step.compliance.toFixed(1)}%</span>
                            </div>
                            <Progress value={step.compliance} className="mt-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="metrics">
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 font-medium">{t('metrics.executionsByMonth.title')}</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={[]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis yAxisId="left" />
                            <Tooltip />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="count" name={t('metrics.executionsByMonth.series')} stroke="#8884d8" />
                          </LineChart>
                        </ResponsiveContainer>
                        <div className="text-center text-sm text-muted-foreground mt-4">{t('metrics.executionsByMonth.development')}</div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">{t('metrics.cards.avgTime.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{t('metrics.cards.avgTime.value', { days: selectedFlow.avgCompletionTime })}</div>
                          <p className="text-xs text-muted-foreground">{selectedFlow.avgCompletionTime < 2.5 ? t('metrics.cards.avgTime.below') : t('metrics.cards.avgTime.above')}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">{t('metrics.cards.successRate.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedFlow.successRate}%</div>
                          <p className="text-xs text-muted-foreground">{selectedFlow.successRate > 90 ? t('metrics.cards.successRate.excellent') : t('metrics.cards.successRate.needsImprovement')}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">{t('metrics.cards.totalExecutions.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedFlow.executionCount}</div>
                          <p className="text-xs text-muted-foreground">{selectedFlow.executionCount > 10 ? t('metrics.cards.totalExecutions.established') : t('metrics.cards.totalExecutions.new')}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">{t('footer.viewHistory')}</Button>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      {t('footer.export')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t('footer.exportFormat')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        const exportData = {
                          flows,
                          selectedFlow,
                          flowDetails,
                        };
                        handleExecutionExport('PDF', exportData);
                      }}>
                      <FileText className="mr-2 h-4 w-4" />
                      PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const exportData = {
                          flows,
                          selectedFlow,
                          flowDetails,
                        };
                        handleExecutionExport('Excel', exportData);
                      }}>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const exportData = {
                          flows,
                          selectedFlow,
                          flowDetails,
                        };
                        handleExecutionExport('JSON', exportData);
                      }}>
                      <FileJson className="mr-2 h-4 w-4" />
                      JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button asChild>
                  <Link href={`/admin/${tenantId}/workflows`}>
                    {t('footer.manageWorkflows')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ) : (
          <Card className="flex items-center justify-center md:col-span-2">
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-medium">{t('selectModel.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('selectModel.description')}</p>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
