'use client';

import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { RequestUpdateSchema } from '@zenstackhq/runtime/zod/models';

import { api } from '@/trpc/react';
import { Input } from '@/components/form';
import ErrorList from '@/components/form/error-list';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import useSubmit from '@/hooks/use-submit.hook';

type RequestUpdateType = z.infer<typeof RequestUpdateSchema>;

const UpdateRequestPage: React.FC = () => {
  const params = useParams<{ slug: string }>();
  const t = useTranslations('admin.request.update');

  const { data, isLoading, error, refetch } = api.request.findFirstOrThrow.useQuery({
    where: { id: { equals: params.slug } },
  });

  const { mutateAsync: updateRequestAsync } = api.request.update.useMutation();

  const { register, handleSubmit, formState } = useForm<RequestUpdateType>({
    defaultValues: data,
    resolver: zodResolver(RequestUpdateSchema),
  });

  const onSubmit = useSubmit(updateRequestAsync, {
    redirectUrl: '/admin/request',
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
          <Input name="serviceTypeId" type="text" register={register} formState={formState} label={t('inputs.serviceTypeId.label')} placeholder={t('inputs.serviceTypeId.placeholder')} required />
          <Input name="clientId" type="text" register={register} formState={formState} label={t('inputs.clientId.label')} placeholder={t('inputs.clientId.placeholder')} required />
          <Input name="issueSubject" type="text" register={register} formState={formState} label={t('inputs.issueSubject.label')} placeholder={t('inputs.issueSubject.placeholder')} />
          <Input name="description" type="text" register={register} formState={formState} label={t('inputs.description.label')} placeholder={t('inputs.description.placeholder')} />
          <Input name="priority" type="text" register={register} formState={formState} label={t('inputs.priority.label')} placeholder={t('inputs.priority.placeholder')} />
          <Input name="closedAt" type="text" register={register} formState={formState} label={t('inputs.closedAt.label')} placeholder={t('inputs.closedAt.placeholder')} />
          <Input name="closedComment" type="text" register={register} formState={formState} label={t('inputs.closedComment.label')} placeholder={t('inputs.closedComment.placeholder')} />
          <Input name="formSubmissionId" type="text" register={register} formState={formState} label={t('inputs.formSubmissionId.label')} placeholder={t('inputs.formSubmissionId.placeholder')} />
          <ErrorList formState={formState} />
          <button type="submit" className="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90">
            {t('updateButton')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateRequestPage;
