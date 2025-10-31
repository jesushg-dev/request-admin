'use client';

import { useEffect, useState } from 'react';
import { getDashboardMetrics } from '@/actions/dashboard';
import { Link } from '@/i18n/routing';
import { AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

interface QuickStatsProps {
  tenantId: string;
  workflowId?: string | null;
}

export default function QuickStatsCards({ tenantId, workflowId }: QuickStatsProps) {
  const t = useTranslations('admin.dashboard.quickStats');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const metrics = await getDashboardMetrics(tenantId, workflowId);
        setData(metrics);
      } catch (error) {
        console.error('Error fetching quick stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [tenantId, workflowId]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle>...</CardTitle>
              <CardDescription>...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">...</div>
              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                <span>...</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{t('pending.title')}</CardTitle>
          <CardDescription>{t('pending.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{data.pendingRequests.value}</div>
          <div className="mt-2 flex items-center text-sm text-muted-foreground">
            <span>{t('pending.highPriority', { count: data.pendingRequests.highPriority || 0 })}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href={{ pathname: '/admin/[tenantId]/requests', params: { tenantId } }} className="flex items-center gap-1">
              {t('actions.viewAll')}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{t('completed.title')}</CardTitle>
          <CardDescription>{t('completed.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{data.completedRequests.value}</div>
          <div className="mt-2 flex items-center text-sm text-muted-foreground">
            <span>{t('completed.avgResolution', { days: data.completedRequests.avgResolutionTime.toFixed(1) })}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href={{ pathname: '/admin/[tenantId]/requests', params: { tenantId } }} className="flex items-center gap-1">
              {t('actions.viewAll')}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{t('reports.title')}</CardTitle>
          <CardDescription>{t('reports.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div className="mt-2 flex items-center text-sm text-muted-foreground">
            <span>{t('reports.ctaHint')}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href={{ pathname: '/admin/[tenantId]/reports', params: { tenantId } }} className="flex items-center gap-1">
              {t('actions.viewReports')}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
