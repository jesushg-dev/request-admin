'use client';

import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { ServiceTypeUpdateSchema } from '@zenstackhq/runtime/zod/models';

import { api } from '@/trpc/react';
import { Input } from '@/components/Form';
import ErrorList from '@/components/Form/ErrorList';
import ErrorRetryFallback from '@/components/ErrorRetryFallback';
import useSubmit from '@/hooks/use-submit.hook';

type ServiceTypeUpdateType = z.infer<typeof ServiceTypeUpdateSchema>;

const UpdateServiceTypePage: React.FC = () => {
  const params = useParams<{ slug: string }>();
  const t = useTranslations('admin.serviceType.update');

  const { data, isLoading, error, refetch } = api.serviceType.findFirstOrThrow.useQuery({
    where: { id: { equals: params.slug } },
  });

  const { mutateAsync: updateServiceTypeAsync } = api.serviceType.update.useMutation();

  const { register, handleSubmit, formState } = useForm<ServiceTypeUpdateType>({
    defaultValues: data,
    resolver: zodResolver(ServiceTypeUpdateSchema),
  });

  const onSubmit = useSubmit(updateServiceTypeAsync, {
    redirectUrl: '/admin/service-type',
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
          <Input
            name="salesChannelId"
            type="text"
            register={register}
            formState={formState}
            label={t('inputs.salesChannelId.label')}
            placeholder={t('inputs.salesChannelId.placeholder')}
            required
          />
          <Input name="name" type="text" register={register} formState={formState} label={t('inputs.name.label')} placeholder={t('inputs.name.placeholder')} required />
          <Input name="description" type="text" register={register} formState={formState} label={t('inputs.description.label')} placeholder={t('inputs.description.placeholder')} />
          <Input
            name="acceptsNewClients"
            type="text"
            register={register}
            formState={formState}
            label={t('inputs.acceptsNewClients.label')}
            placeholder={t('inputs.acceptsNewClients.placeholder')}
          />
          <ErrorList formState={formState} />
          <button type="submit" className="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90">
            {t('updateButton')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateServiceTypePage;
