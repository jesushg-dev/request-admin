'use client';

import { useEffect, useState } from 'react';
import { getDashboardMetrics } from '@/actions/dashboard';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { DashboardMetrics } from './dashboard-metrics';

interface MetricsData {
  totalRequests: { value: number; trend: { value: number; isPositive: boolean } };
  draftRequests: { value: number; trend: { value: number; isPositive: boolean } };
  avgResolutionTime: number;
  avgResolutionTimeTrend?: { value: number; isPositive: boolean };
  resolutionRate: { value: number; trend: { value: number; isPositive: boolean } };
  pendingRequests: { value: number; trend: { value: number; isPositive: boolean }; highPriority?: number };
  completedRequests: { value: number; avgResolutionTime: number };
  slaOverdue: { value: number; trend: { value: number; isPositive: boolean } };
  slaCompliance: { value: number; trend: { value: number; isPositive: boolean } };
  slaAtRisk: { value: number; trend: { value: number; isPositive: boolean } };
}

export default function DashboardMetricsClient({ tenantId, workflowId }: { tenantId: string; workflowId?: string | null }) {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const metrics = await getDashboardMetrics(tenantId, workflowId);
        setData(metrics);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [tenantId, workflowId]);

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Skeleton para Métricas Generales */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-48" />
            <div className="h-px bg-border flex-1 ml-4" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        {/* Skeleton para Métricas de SLA */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-64" />
            <div className="h-px bg-border flex-1 ml-4" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Error al cargar métricas</h3>
            <div className="h-px bg-border flex-1 ml-4" />
          </div>
        </div>
      </div>
    );
  }

  return <DashboardMetrics data={data} />;
}
