'use client';

import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormCreateSchema } from '@zenstackhq/runtime/zod/models';

import { api } from '@/trpc/react';
import { Input } from '@/components/form';
import ErrorList from '@/components/form/error-list';
import useSubmit from '@/hooks/use-submit.hook';

type FormCreateType = z.infer<typeof FormCreateSchema>;

const NewFormPage: React.FC = () => {
  const t = useTranslations('admin.form.create');

  const { mutateAsync: createFormAsync } = api.form.create.useMutation();

  const { register, handleSubmit, formState } = useForm<FormCreateType>({
    resolver: zodResolver(FormCreateSchema),
  });

  const onSubmit = useSubmit(createFormAsync, {
    redirectUrl: '/admin/form',
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="border-stroke dark:border-strokedark border-b px-6 py-4">
        <h3 className="font-medium text-black dark:text-white">{t('createTitle')}</h3>
      </div>
      <div className="border-stroke shadow-default dark:border-strokedark dark:bg-boxdark rounded-sm border bg-white">
        <form className="grid grid-cols-2 gap-4 p-6" onSubmit={handleSubmit((data) => onSubmit({ data }))}>
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
            {t('createButton')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewFormPage;
