'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { IdentificationTypeCreateSchema } from '@zenstackhq/runtime/zod/models';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import useSubmit from '@/hooks/use-submit';
import { Input } from '@/components/form';
import ErrorList from '@/components/form/error-list';

type IdentificationTypeCreateType = z.infer<typeof IdentificationTypeCreateSchema>;

const NewIdentificationTypePage: React.FC = () => {
  const t = useTranslations('admin.identificationType.create');

  const { mutateAsync: createIdentificationTypeAsync } = api.identificationType.create.useMutation();

  const { register, handleSubmit, formState } = useForm<IdentificationTypeCreateType>({
    resolver: zodResolver(IdentificationTypeCreateSchema),
  });

  const onSubmit = useSubmit(createIdentificationTypeAsync, {
    redirectUrl: '/admin/identification-type',
  });

  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      <div className="border-stroke dark:border-strokedark border-b px-6 py-4">
        <h3 className="font-medium text-black dark:text-white">{t('createTitle')}</h3>
      </div>
      <div className="border-stroke shadow-default dark:border-strokedark dark:bg-boxdark rounded-sm border bg-white">
        <form className="grid grid-cols-2 gap-4 p-6" onSubmit={handleSubmit((data) => onSubmit({ data }))}>
          <Input name="id" type="text" register={register} formState={formState} label={t('inputs.id.label')} placeholder={t('inputs.id.placeholder')} required />
          <Input name="name" type="text" register={register} formState={formState} label={t('inputs.name.label')} placeholder={t('inputs.name.placeholder')} required />
          <Input name="description" type="text" register={register} formState={formState} label={t('inputs.description.label')} placeholder={t('inputs.description.placeholder')} />
          <ErrorList formState={formState} />
          <button type="submit" className="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90">
            {t('createButton')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewIdentificationTypePage;
