'use client';

import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormUpdateSchema } from '@zenstackhq/runtime/zod/models';

import { api } from '@/trpc/react';
import { Input } from '@/components/form';
import ErrorList from '@/components/form/error-list';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import useSubmit from '@/hooks/use-submit.hook';

type FormUpdateType = z.infer<typeof FormUpdateSchema>;

const UpdateFormPage: React.FC = () => {
  const params = useParams<{ slug: string }>();
  const t = useTranslations('admin.form.update');

  const { data, isLoading, error, refetch } = api.form.findFirstOrThrow.useQuery({
    where: { id: { equals: params.slug } },
  });

  const { mutateAsync: updateFormAsync } = api.form.update.useMutation();

  const { register, handleSubmit, formState } = useForm<FormUpdateType>({
    defaultValues: data,
    resolver: zodResolver(FormUpdateSchema),
  });

  const onSubmit = useSubmit(updateFormAsync, {
    redirectUrl: '/admin/form',
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
          <Input name="userId" type="text" register={register} formState={formState} label={t('inputs.userId.label')} placeholder={t('inputs.userId.placeholder')} required />
          <Input name="published" type="text" register={register} formState={formState} label={t('inputs.published.label')} placeholder={t('inputs.published.placeholder')} required />
          <Input name="name" type="text" register={register} formState={formState} label={t('inputs.name.label')} placeholder={t('inputs.name.placeholder')} required />
          <Input name="content" type="text" register={register} formState={formState} label={t('inputs.content.label')} placeholder={t('inputs.content.placeholder')} required />
          <Input name="visits" type="number" register={register} formState={formState} label={t('inputs.visits.label')} placeholder={t('inputs.visits.placeholder')} required />
          <Input name="submissions" type="number" register={register} formState={formState} label={t('inputs.submissions.label')} placeholder={t('inputs.submissions.placeholder')} required />
          <Input name="shareURL" type="text" register={register} formState={formState} label={t('inputs.shareURL.label')} placeholder={t('inputs.shareURL.placeholder')} required />
          <ErrorList formState={formState} />
          <button type="submit" className="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90">
            {t('updateButton')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateFormPage;
