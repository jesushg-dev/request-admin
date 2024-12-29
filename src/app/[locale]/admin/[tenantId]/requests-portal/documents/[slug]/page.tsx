'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/trpc/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { DocumentUpdateSchema } from '@zenstackhq/runtime/zod/models';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import useSubmit from '@/hooks/use-submit';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { Input } from '@/components/form';
import ErrorList from '@/components/form/error-list';

type DocumentUpdateType = z.infer<typeof DocumentUpdateSchema>;

const UpdateDocumentPage: React.FC = () => {
  const params = useParams<{ slug: string }>();
  const t = useTranslations('admin.document.update');

  const { data, isLoading, error, refetch } = api.document.findFirstOrThrow.useQuery({
    where: { id: { equals: params.slug } },
  });

  const { mutateAsync: updateDocumentAsync } = api.document.update.useMutation();

  const { register, handleSubmit, formState } = useForm<DocumentUpdateType>({
    defaultValues: data,
    resolver: zodResolver(DocumentUpdateSchema),
  });

  const onSubmit = useSubmit(updateDocumentAsync, {
    redirectUrl: '/admin/document',
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
          <Input name="status" type="number" register={register} formState={formState} label={t('inputs.status.label')} placeholder={t('inputs.status.placeholder')} required />
          <ErrorList formState={formState} />
          <button type="submit" className="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90">
            {t('updateButton')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateDocumentPage;
