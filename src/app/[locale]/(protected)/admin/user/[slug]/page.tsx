'use client';

import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserUpdateSchema } from '@zenstackhq/runtime/zod/models';

import { api } from '@/trpc/react';
import { Input } from '@/components/form';
import ErrorList from '@/components/form/error-list';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import useSubmit from '@/hooks/use-submit.hook';

type UserUpdateType = z.infer<typeof UserUpdateSchema>;

const UpdateUserPage: React.FC = () => {
  const params = useParams<{ slug: string }>();
  const t = useTranslations('admin.user.update');

  const { data, isLoading, error, refetch } = api.user.findFirstOrThrow.useQuery({
    where: { id: { equals: params.slug } },
  });

  const { mutateAsync: updateUserAsync } = api.user.update.useMutation();

  const { register, handleSubmit, formState } = useForm<UserUpdateType>({
    defaultValues: data,
    resolver: zodResolver(UserUpdateSchema),
  });

  const onSubmit = useSubmit(updateUserAsync, {
    redirectUrl: '/admin/user',
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
          <Input name="name" type="text" register={register} formState={formState} label={t('inputs.name.label')} placeholder={t('inputs.name.placeholder')} />
          <Input name="email" type="text" register={register} formState={formState} label={t('inputs.email.label')} placeholder={t('inputs.email.placeholder')} />
          <Input name="emailVerified" type="text" register={register} formState={formState} label={t('inputs.emailVerified.label')} placeholder={t('inputs.emailVerified.placeholder')} />
          <Input name="password" type="text" register={register} formState={formState} label={t('inputs.password.label')} placeholder={t('inputs.password.placeholder')} required />
          <Input name="isTwoFactorEnabled" type="text" register={register} formState={formState} label={t('inputs.isTwoFactorEnabled.label')} placeholder={t('inputs.isTwoFactorEnabled.placeholder')} required />
          <Input name="areaId" type="text" register={register} formState={formState} label={t('inputs.areaId.label')} placeholder={t('inputs.areaId.placeholder')} />
          <Input name="coordinatorId" type="text" register={register} formState={formState} label={t('inputs.coordinatorId.label')} placeholder={t('inputs.coordinatorId.placeholder')} />
          <ErrorList formState={formState} />
          <button type="submit" className="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90">
            {t('updateButton')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateUserPage;
