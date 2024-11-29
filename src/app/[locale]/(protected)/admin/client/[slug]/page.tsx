'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/trpc/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClientUpdateSchema } from '@zenstackhq/runtime/zod/models';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import useSubmit from '@/hooks/use-submit.hook';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { Input } from '@/components/form';
import ErrorList from '@/components/form/error-list';

type ClientUpdateType = z.infer<typeof ClientUpdateSchema>;

const UpdateClientPage: React.FC = () => {
  const params = useParams<{ slug: string }>();
  const t = useTranslations('admin.client.update');

  const { data, isLoading, error, refetch } = api.client.findFirstOrThrow.useQuery({
    where: { id: { equals: params.slug } },
  });

  const { mutateAsync: updateClientAsync } = api.client.update.useMutation();

  const { register, handleSubmit, formState } = useForm<ClientUpdateType>({
    defaultValues: data,
    resolver: zodResolver(ClientUpdateSchema),
  });

  const onSubmit = useSubmit(updateClientAsync, {
    redirectUrl: '/admin/client',
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
          <Input name="email" type="text" register={register} formState={formState} label={t('inputs.email.label')} placeholder={t('inputs.email.placeholder')} />
          <Input
            name="identificationNumber"
            type="text"
            register={register}
            formState={formState}
            label={t('inputs.identificationNumber.label')}
            placeholder={t('inputs.identificationNumber.placeholder')}
            required
          />
          <Input name="corporateName" type="text" register={register} formState={formState} label={t('inputs.corporateName.label')} placeholder={t('inputs.corporateName.placeholder')} />
          <Input name="monthlyIncome" type="text" register={register} formState={formState} label={t('inputs.monthlyIncome.label')} placeholder={t('inputs.monthlyIncome.placeholder')} />
          <Input name="phone" type="text" register={register} formState={formState} label={t('inputs.phone.label')} placeholder={t('inputs.phone.placeholder')} />
          <Input
            name="identificationTypeId"
            type="text"
            register={register}
            formState={formState}
            label={t('inputs.identificationTypeId.label')}
            placeholder={t('inputs.identificationTypeId.placeholder')}
            required
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

export default UpdateClientPage;
