import { getDashboardMetrics } from '@/actions/dashboard';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { AlertTriangle, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Locale } from 'next-intl';

interface QuickStatsCardsServerProps {
  tenantId: string;
  workflowId?: string | null;
  locale: Locale;
}

export function QuickStatsFallback() {
  return (
    <div className="mt-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="h-36 animate-pulse rounded-lg bg-muted" />
        <div className="h-36 animate-pulse rounded-lg bg-muted" />
        <div className="hidden h-36 animate-pulse rounded-lg bg-muted xl:block" />
        <div className="hidden h-36 animate-pulse rounded-lg bg-muted xl:block" />
      </div>
    </div>
  );
}

export default async function QuickStatsCardsServer({ tenantId, workflowId, locale }: QuickStatsCardsServerProps) {
  const t = await getTranslations({ locale: locale , namespace: 'admin.dashboard.quickStats' });
  const data = await getDashboardMetrics(tenantId, workflowId);

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

