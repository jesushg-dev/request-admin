import React, { ReactNode, Suspense } from 'react';
import { GetForms, GetFormStats } from '@/actions/form';
import { ArrowDownIcon, BookOpenCheckIcon, MousePointerClickIcon, ViewIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import CreateFormBtn from '@/components/builder-form/create-form-btn';
import { Draggable, FormCard } from '@/components/builder-form/form-card';

const Home = async () => {
  const t = await getTranslations('admin.formBuilder.main');

  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      <Suspense fallback={<StatsCards loading={true} />}>
        <CardStatsWrapper />
      </Suspense>
      <Card className="flex-1 bg-background">
        <CardHeader>
          <CardTitle>{t('yourForms')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <CreateFormBtn />
            <Suspense
              fallback={[1, 2, 3, 4].map((el) => (
                <FormCardSkeleton key={el} />
              ))}>
              <FormCards />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CardStatsWrapper = async () => {
  const stats = await GetFormStats();
  return <StatsCards loading={false} data={stats} />;
};

interface StatsCardProps {
  data?: Awaited<ReturnType<typeof GetFormStats>>;
  loading: boolean;
}

const StatsCards = async (props: StatsCardProps) => {
  const t = await getTranslations('admin.formBuilder.main');
  const { data, loading } = props;

  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard title={t('totalVisits')} icon={<ViewIcon className="h-4 w-4 text-blue-600" />} helperText={t('visitsHelper')} value={data?.visits.toLocaleString() ?? ''} loading={loading} />
      <StatsCard
        title={t('totalSubmissions')}
        icon={<BookOpenCheckIcon className="h-4 w-4 text-yellow-600" />}
        helperText={t('submissionsHelper')}
        value={data?.submissions.toLocaleString() ?? ''}
        loading={loading}
      />
      <StatsCard
        title={t('submissionRate')}
        icon={<MousePointerClickIcon className="h-4 w-4 text-green-600" />}
        helperText={t('submissionRateHelper')}
        value={data?.submissionRate.toLocaleString() + '%'}
        loading={loading}
      />
      <StatsCard
        title={t('bounceRate')}
        icon={<ArrowDownIcon className="h-4 w-4 text-red-600" />}
        helperText={t('bounceRateHelper')}
        value={data?.bounceRate.toLocaleString() + '%'}
        loading={loading}
      />
    </div>
  );
};

export const StatsCard = ({ title, value, icon, helperText, loading, className }: { title: string; value: string; helperText: string; className?: string; loading: boolean; icon: ReactNode }) => {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="p-4">
        <div className="text-xl font-bold">
          {loading && (
            <Skeleton>
              <span className="opacity-0">0</span>
            </Skeleton>
          )}
          {!loading && value}
        </div>
        <p className="pt-1 text-xs text-muted-foreground">{helperText}</p>
      </CardContent>
    </Card>
  );
};

const FormCardSkeleton = () => {
  return <Skeleton className="border-primary-/20 h-[190px] w-full border-2" />;
};

const FormCards = async () => {
  const forms = await GetForms();
  return (
    <>
      {forms.map((form) => (
        <Draggable key={form.id} data={form}>
          <FormCard form={form} />
        </Draggable>
      ))}
    </>
  );
};

export default Home;
