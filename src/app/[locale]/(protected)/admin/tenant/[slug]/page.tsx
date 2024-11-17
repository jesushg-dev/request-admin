'use client';

import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { TenantUpdateSchema } from '@zenstackhq/runtime/zod/models';

import { api } from '@/trpc/react';
import { Input } from '@/components/Form';
import ErrorList from '@/components/Form/ErrorList';
import ErrorRetryFallback from '@/components/ErrorRetryFallback';
import useSubmit from '@/hooks/use-submit.hook';

type TenantUpdateType = z.infer<typeof TenantUpdateSchema>;

const UpdateTenantPage: React.FC = () => {
  const params = useParams<{ slug: string }>();
  const t = useTranslations('admin.tenant.update');

  const { data, isLoading, error, refetch } = api.tenant.findFirstOrThrow.useQuery({
    where: { id: { equals: params.slug } },
  });

  const { mutateAsync: updateTenantAsync } = api.tenant.update.useMutation();

  const { register, handleSubmit, formState } = useForm<TenantUpdateType>({
    defaultValues: data,
    resolver: zodResolver(TenantUpdateSchema),
  });

  const onSubmit = useSubmit(updateTenantAsync, {
    redirectUrl: '/admin/tenant',
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
          <Input name="websiteUrl" type="text" register={register} formState={formState} label={t('inputs.websiteUrl.label')} placeholder={t('inputs.websiteUrl.placeholder')} />
          <Input name="description" type="text" register={register} formState={formState} label={t('inputs.description.label')} placeholder={t('inputs.description.placeholder')} />
          <Input
            name="secondaryColor"
            type="text"
            register={register}
            formState={formState}
            label={t('inputs.secondaryColor.label')}
            placeholder={t('inputs.secondaryColor.placeholder')}
          />
          <Input
            name="contactPhone"
            type="text"
            register={register}
            formState={formState}
            label={t('inputs.contactPhone.label')}
            placeholder={t('inputs.contactPhone.placeholder')}
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

export default UpdateTenantPage;
