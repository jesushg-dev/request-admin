'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/trpc/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AreaUpdateSchema } from '@zenstackhq/runtime/zod/models';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import useSubmit from '@/hooks/use-submit';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { Input } from '@/components/form';
import ErrorList from '@/components/form/error-list';

type AreaUpdateType = z.infer<typeof AreaUpdateSchema>;

const UpdateAreaPage: React.FC = () => {
  const params = useParams<{ slug: string }>();
  const t = useTranslations('admin.area.update');

  const { data, isLoading, error, refetch } = api.area.findFirstOrThrow.useQuery({
    where: { id: { equals: params.slug } },
  });

  const { mutateAsync: updateAreaAsync } = api.area.update.useMutation();

  const { register, handleSubmit, formState } = useForm<AreaUpdateType>({
    defaultValues: data,
    resolver: zodResolver(AreaUpdateSchema),
  });

  const onSubmit = useSubmit(updateAreaAsync, {
    redirectUrl: '/admin/management/area',
  });

  if (isLoading) {
    return <p className="animate-pulse text-center text-lg font-medium text-gray-600 dark:text-gray-300">{t('loading')}</p>;
  }

  if (error) {
    return <ErrorRetryFallback message={t('errorLoading')} onRetry={refetch} buttonText={t('retry')} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-stroke dark:border-strokedark border-b px-6 py-4">
        <h3 className="font-medium text-black dark:text-white">{t('updateTitle')}</h3>
      </div>
      <div className="border-stroke shadow-default dark:border-strokedark dark:bg-boxdark rounded-sm border bg-white">
        <form className="grid grid-cols-2 gap-4 p-6" onSubmit={handleSubmit((data) => onSubmit({ data, where: { id: params.slug } }))}>
          <Input name="id" type="text" register={register} formState={formState} label={t('inputs.id.label')} placeholder={t('inputs.id.placeholder')} required />
          <Input name="name" type="text" register={register} formState={formState} label={t('inputs.name.label')} placeholder={t('inputs.name.placeholder')} required />
          <Input name="description" type="text" register={register} formState={formState} label={t('inputs.description.label')} placeholder={t('inputs.description.placeholder')} />
          <ErrorList formState={formState} />
          <button type="submit" className="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90">
            {t('updateButton')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateAreaPage;
