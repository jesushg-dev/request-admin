'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClientCreateSchema } from '@zenstackhq/runtime/zod/models';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import useSubmit from '@/hooks/use-submit';
import { Input } from '@/components/form';
import ErrorList from '@/components/form/error-list';

type ClientCreateType = z.infer<typeof ClientCreateSchema>;

const NewClientPage: React.FC = () => {
  const t = useTranslations('admin.client.create');

  const { mutateAsync: createClientAsync } = api.client.create.useMutation();

  const { register, handleSubmit, formState } = useForm<ClientCreateType>({
    resolver: zodResolver(ClientCreateSchema),
  });

  const onSubmit = useSubmit(createClientAsync, {
    redirectUrl: '/admin/client',
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="border-stroke dark:border-strokedark border-b px-6 py-4">
        <h3 className="font-medium text-black dark:text-white">{t('createTitle')}</h3>
      </div>
      <div className="border-stroke shadow-default dark:border-strokedark dark:bg-boxdark rounded-sm border bg-white">
        <form className="grid grid-cols-2 gap-4 p-6" onSubmit={handleSubmit((data) => onSubmit({ data }))}>
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
            {t('createButton')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewClientPage;
