'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getAlerts,
  getAreaDistribution,
  getAreas,
  getAverageResolutionTime,
  getMonthlyTrends,
  getOverviewReport,
  getPriorities,
  getSLACompliance,
  getStatusDistribution,
  getStatuses,
  getWorkflowDistribution,
} from '@/actions/report';
import { endOfDay, startOfDay, subDays } from 'date-fns';
import { BarChart2, CheckCircle2, Clock, Download, FileJson, FileSpreadsheet, FileText, Filter, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';

import { useReportExport } from '@/hooks/use-report-export';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreasTab } from '@/components/common/reports/areas-tab';
import { ExecutionTab } from '@/components/common/reports/execution-tab';
import { OverviewTab } from '@/components/common/reports/overview-tab';
import { ReportFilters } from '@/components/common/reports/report-filters';
import { StatusTab } from '@/components/common/reports/status-tab';
import type { Area, AreaDistribution, MonthlyTrend, OverviewData, Priority, ReportFilters as ReportFiltersType, SLACompliance, Status, StatusDistribution } from '@/components/common/reports/types';
import EmptyState from '@/components/shared/empty-state';

interface ReportsPageClientProps {
  tenantId: string;
  canExportReports: boolean;
}

export function ReportsPageClient({ tenantId, canExportReports }: ReportsPageClientProps) {
  const t = useTranslations('admin.reports.page');
  const { handleExport: handleReportExport } = useReportExport();
  const [dateRange, setDateRange] = useState<string>('year');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>('overview');

  // Real data states
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [areaDistribution, setAreaDistribution] = useState<AreaDistribution[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [slaCompliance, setSlaCompliance] = useState<SLACompliance[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [responseTimeData, setResponseTimeData] = useState<{ name: string; tiempo: number }[]>([]);
  const [workflowData, setWorkflowData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [alertsData, setAlertsData] = useState<{ type: string; count: number; statusName: string; alerts: any[] }[]>([]);
  const [loading, setLoading] = useState(true);

  // Load filter options
  useEffect(() => {
    if (!tenantId) return;

    async function loadFilterOptions() {
      try {
        const [areasData, statusesData, prioritiesData] = await Promise.all([getAreas(tenantId), getStatuses(tenantId), getPriorities(tenantId)]);
        setAreas(areasData);
        setStatuses(statusesData);
        setPriorities(prioritiesData);
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    }

    loadFilterOptions();
  }, [tenantId]);

  // Memoize filter arrays to prevent unnecessary re-renders
  const selectedAreasKey = useMemo(() => JSON.stringify([...selectedAreas].sort()), [selectedAreas]);
  const selectedStatusesKey = useMemo(() => JSON.stringify([...selectedStatuses].sort()), [selectedStatuses]);
  const selectedPrioritiesKey = useMemo(() => JSON.stringify([...selectedPriorities].sort()), [selectedPriorities]);

  // Load overview data
  useEffect(() => {
    if (!tenantId) return;

    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);

        // Build filters inside the effect to avoid stale closures
        const filters: ReportFiltersType = {};

        // Date range filter
        if (dateRange === 'month') {
          filters.dateRange = {
            from: startOfDay(subDays(new Date(), 30)),
            to: endOfDay(new Date()),
          };
        } else if (dateRange === 'quarter') {
          filters.dateRange = {
            from: startOfDay(subDays(new Date(), 90)),
            to: endOfDay(new Date()),
          };
        } else if (dateRange === 'year') {
          filters.dateRange = {
            from: startOfDay(subDays(new Date(), 365)),
            to: endOfDay(new Date()),
          };
        }

        // Area filter
        if (selectedAreas.length > 0) {
          filters.areas = selectedAreas;
        }

        // Status filter
        if (selectedStatuses.length > 0) {
          filters.statuses = selectedStatuses;
        }

        // Priority filter
        if (selectedPriorities.length > 0) {
          filters.priorities = selectedPriorities;
        }

        const [overview, trends, areas, statuses, compliance, responseTime, workflows, alerts] = await Promise.all([
          getOverviewReport(tenantId, filters),
          getMonthlyTrends(tenantId, filters),
          getAreaDistribution(tenantId, filters),
          getStatusDistribution(tenantId, filters),
          getSLACompliance(tenantId, filters),
          getAverageResolutionTime(tenantId, filters),
          getWorkflowDistribution(tenantId, filters),
          getAlerts(tenantId, filters),
        ]);

        if (!cancelled) {
          setOverviewData(overview);
          setMonthlyTrends(trends);
          setAreaDistribution(areas);
          setStatusDistribution(statuses);
          setSlaCompliance(compliance);
          setResponseTimeData(responseTime);
          setWorkflowData(workflows);
          setAlertsData(alerts);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading report data:', error);
          toast.error('Error al cargar los reportes');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [tenantId, dateRange, selectedAreasKey, selectedStatusesKey, selectedPrioritiesKey]);

  const handleAreaToggle = useCallback((areaId: string) => {
    setSelectedAreas((prev) => (prev.includes(areaId) ? prev.filter((a) => a !== areaId) : [...prev, areaId]));
  }, []);

  const handleStatusToggle = useCallback((statusId: string) => {
    setSelectedStatuses((prev) => (prev.includes(statusId) ? prev.filter((s) => s !== statusId) : [...prev, statusId]));
  }, []);

  const handlePriorityToggle = useCallback((priorityId: string) => {
    setSelectedPriorities((prev) => (prev.includes(priorityId) ? prev.filter((p) => p !== priorityId) : [...prev, priorityId]));
  }, []);

  const handleExport = useCallback(
    (format: string) => {
      const exportData = {
        overviewData,
        monthlyTrends,
        areaDistribution,
        statusDistribution,
        slaCompliance,
        responseTimeData,
        workflowData,
        alertsData,
        dateRange,
      };

      handleReportExport(format, exportData);
    },
    [handleReportExport, overviewData, monthlyTrends, areaDistribution, statusDistribution, slaCompliance, responseTimeData, workflowData, alertsData, dateRange]
  );

  const clearFilters = useCallback(() => {
    setSelectedAreas([]);
    setSelectedStatuses([]);
    setSelectedPriorities([]);
  }, []);

  return (
    <ScrollArea className="flex-grow min-h-0">
      <div className="container py-6 flex flex-col h-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? t('buttons.hideFilters') : t('buttons.showFilters')}
            </Button>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('period.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">{t('period.month')}</SelectItem>
                <SelectItem value="quarter">{t('period.quarter')}</SelectItem>
                <SelectItem value="year">{t('period.year')}</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={!canExportReports}>
                <Button
                  disabled={!canExportReports}
                  className={!canExportReports ? 'opacity-50 cursor-not-allowed' : ''}
                  title={!canExportReports ? (t('export.noPermission' as any) as string) : undefined}>
                  <Download className="mr-2 h-4 w-4" />
                  {t('export.title')}
                </Button>
              </DropdownMenuTrigger>
              {canExportReports && (
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t('export.format')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport('PDF')}>
                    <FileText className="mr-2 h-4 w-4" />
                    {t('export.pdf')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('Excel')}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    {t('export.excel')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('JSON')}>
                    <FileJson className="mr-2 h-4 w-4" />
                    {t('export.json')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          </div>
        </div>

        {showFilters && (
          <ReportFilters
            areas={areas}
            statuses={statuses}
            priorities={priorities}
            selectedAreas={selectedAreas}
            selectedStatuses={selectedStatuses}
            selectedPriorities={selectedPriorities}
            onAreaToggle={handleAreaToggle}
            onStatusToggle={handleStatusToggle}
            onPriorityToggle={handlePriorityToggle}
            onClearFilters={clearFilters}
          />
        )}

        <div className="mt-8 flex flex-col flex-grow min-h-0">
          <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab} className="flex flex-col flex-grow min-h-0">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
              <TabsTrigger value="areas">{t('tabs.areas')}</TabsTrigger>
              <TabsTrigger value="status">{t('tabs.status')}</TabsTrigger>
              <TabsTrigger value="performance">{t('tabs.performance')}</TabsTrigger>
              <TabsTrigger value="workflows">{t('tabs.workflows')}</TabsTrigger>
              <TabsTrigger value="execution">{t('tabs.execution')}</TabsTrigger>
              <TabsTrigger value="alerts">{t('tabs.alerts')}</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="h-full overflow-y-auto">
              <OverviewTab
                overviewData={overviewData}
                monthlyTrends={monthlyTrends}
                areaDistribution={areaDistribution}
                statusDistribution={statusDistribution}
                slaCompliance={slaCompliance}
                loading={loading}
              />
            </TabsContent>
            <TabsContent value="areas" className="h-full overflow-y-auto">
              <AreasTab areaDistribution={areaDistribution} loading={loading} />
            </TabsContent>
            <TabsContent value="status" className="h-full overflow-y-auto">
              <StatusTab statusDistribution={statusDistribution} loading={loading} />
            </TabsContent>
            <TabsContent value="performance" className="h-full overflow-y-auto">
              {loading ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] flex flex-col gap-4 justify-center items-center">
                      <div className="w-full flex items-end justify-around gap-2">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <Skeleton className="w-full" style={{ height: `${Math.random() * 100 + 100}px` }} />
                          </div>
                        ))}
                      </div>
                      <div className="w-full flex justify-around">
                        {[...Array(6)].map((_, i) => (
                          <Skeleton key={i} className="h-3 w-16" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : responseTimeData.length === 0 ? (
                <EmptyState title={t('performance.empty.title')} description={t('performance.empty.description')} icons={[Clock, BarChart2, TrendingUp]} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('performance.chart.title')}</CardTitle>
                    <CardDescription>{t('performance.chart.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={responseTimeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="tiempo" name={t('performance.chart.series.timeDays')} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="workflows" className="h-full overflow-y-auto">
              {loading ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="h-[400px] flex flex-col gap-4 justify-center items-center">
                        <div className="w-full flex items-end justify-around gap-2">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                              <Skeleton className="w-full" style={{ height: `${Math.random() * 100 + 100}px` }} />
                            </div>
                          ))}
                        </div>
                        <div className="w-full flex justify-around">
                          {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-3 w-16" />
                          ))}
                        </div>
                      </div>
                      <div className="h-[400px] flex items-center justify-center">
                        <div className="w-64 h-64 rounded-full border-4 border-muted flex items-center justify-center">
                          <Skeleton className="h-32 w-32 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : workflowData.length === 0 ? (
                <EmptyState title={t('workflows.empty.title')} description={t('workflows.empty.description')} icons={[FileText, BarChart2, TrendingUp]} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('workflows.chart.title')}</CardTitle>
                    <CardDescription>{t('workflows.chart.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={workflowData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" name={t('workflows.chart.series.requests')} radius={[4, 4, 0, 0]}>
                              {workflowData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={workflowData} cx="50%" cy="50%" outerRadius={150} dataKey="value" label={({ name, percent }) => `${name} ${(((percent as number) ?? 0) * 100).toFixed(0)}%`}>
                              {workflowData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="execution" className="h-full overflow-y-auto">
              <ExecutionTab tenantId={tenantId} loading={loading} />
            </TabsContent>
            <TabsContent value="alerts" className="h-full overflow-y-auto">
              {loading ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-md" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : alertsData.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('alerts.title')}</CardTitle>
                    <CardDescription>{t('alerts.subtitle')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center py-12">
                      <EmptyState title={t('alerts.empty.title')} description={t('alerts.empty.description')} icons={[CheckCircle2, Clock, TrendingUp]} />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('alerts.title')}</CardTitle>
                    <CardDescription>{t('alerts.subtitle')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {alertsData.map((alertGroup, index) => {
                        const badgeColor = alertGroup.type === 'critical' ? 'bg-red-500' : alertGroup.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500';
                        const borderColor = alertGroup.type === 'critical' ? 'border-red-200' : alertGroup.type === 'warning' ? 'border-amber-200' : 'border-blue-200';
                        const bgColor = alertGroup.type === 'critical' ? 'bg-red-50' : alertGroup.type === 'warning' ? 'bg-amber-50' : 'bg-blue-50';
                        const title = alertGroup.type === 'critical' ? t('alerts.levels.critical') : alertGroup.type === 'warning' ? t('alerts.levels.warning') : t('alerts.levels.info');
                        const description = alertGroup.type === 'critical' ? t('alerts.descriptions.critical') : t('alerts.descriptions.warning');

                        return (
                          <div key={index} className={`rounded-md border ${borderColor} ${bgColor} p-4`}>
                            <div className="flex items-center">
                              <Badge className={badgeColor}>{title}</Badge>
                              <h3 className="ml-2 font-medium">
                                {t('alerts.requestCount', { count: alertGroup.count, status: alertGroup.statusName, type: alertGroup.type === 'critical' ? 'vencido' : 'enRiesgo' })}
                              </h3>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                            <Button variant="outline" size="sm" className="mt-2">
                              {t('alerts.viewRequests')}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ScrollArea>
  );
}
