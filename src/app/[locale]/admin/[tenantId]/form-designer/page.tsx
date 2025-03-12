import React, { Suspense, type FC } from 'react';
import { GetForms, GetFormStats } from '@/actions/form';
import { ArrowDownIcon, BookOpenCheckIcon, MousePointerClickIcon, ViewIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import CreateFormBtn from '@/components/builder-form/create-form-btn';
import { DraggableFormCard } from '@/components/builder-form/form-card';
import { StatCard } from '@/components/stat-card';

interface PageProps {
  params: Promise<{ locale: string; tenantId: string }>;
}

const Page: FC<PageProps> = async ({ params }) => {
  const { tenantId } = await params;
  const t = await getTranslations('admin.formBuilder.main');

  return (
    <div className="flex w-full flex-1 flex-col gap-4 p-4">
      <Suspense fallback={<StatCards loading={true} />}>
        <CardStatsWrapper tenantId={tenantId} />
      </Suspense>
      <Card className="bg-background flex-1">
        <CardHeader>
          <CardTitle>{t('yourForms')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <CreateFormBtn />
            <Suspense
              fallback={[1, 2, 3, 4].map((el) => (
                <FormCardSkeleton key={el} />
              ))}>
              <FormCards tenantId={tenantId} />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const FormCardSkeleton = () => {
  return <Skeleton className="border-primary-/20 h-[190px] w-full border-2" />;
};

const FormCards = async ({ tenantId }: { tenantId: string }) => {
  const forms = await GetForms(tenantId);
  return (
    <>
      {forms.map((form) => (
        <DraggableFormCard key={form.id} data={form} />
      ))}
    </>
  );
};

const CardStatsWrapper = async ({ tenantId }: { tenantId: string }) => {
  const stats = await GetFormStats(tenantId);
  return <StatCards loading={false} data={stats} />;
};

interface StatCardProps {
  data?: Awaited<ReturnType<typeof GetFormStats>>;
  loading: boolean;
}

const StatCards = async (props: StatCardProps) => {
  const t = await getTranslations('admin.formBuilder.main');
  const { data, loading } = props;

  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title={t('totalVisits')} icon={<ViewIcon className="h-4 w-4 text-blue-600" />} description={t('visitsHelper')} value={data?.visits.toLocaleString() ?? ''} loading={loading} />
      <StatCard
        title={t('totalSubmissions')}
        icon={<BookOpenCheckIcon className="h-4 w-4 text-yellow-600" />}
        description={t('submissionsHelper')}
        value={data?.submissions.toLocaleString() ?? ''}
        loading={loading}
      />
      <StatCard
        title={t('submissionRate')}
        icon={<MousePointerClickIcon className="h-4 w-4 text-green-600" />}
        description={t('submissionRateHelper')}
        value={data?.submissionRate.toLocaleString() + '%'}
        loading={loading}
      />
      <StatCard
        title={t('bounceRate')}
        icon={<ArrowDownIcon className="h-4 w-4 text-red-600" />}
        description={t('bounceRateHelper')}
        value={data?.bounceRate.toLocaleString() + '%'}
        loading={loading}
      />
    </div>
  );
};

export default Page;
