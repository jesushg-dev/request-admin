'use client';

import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { RequirementCreateSchema } from '@zenstackhq/runtime/zod/models';

import { api } from '@/trpc/react';
import { Input } from '@/components/Form';
import ErrorList from '@/components/Form/ErrorList';
import useSubmit from '@/hooks/use-submit.hook';

type RequirementCreateType = z.infer<typeof RequirementCreateSchema>;

const NewRequirementPage: React.FC = () => {
  const t = useTranslations('admin.requirement.create');

  const { mutateAsync: createRequirementAsync } = api.requirement.create.useMutation();

  const { register, handleSubmit, formState } = useForm<RequirementCreateType>({
    resolver: zodResolver(RequirementCreateSchema),
  });

  const onSubmit = useSubmit(createRequirementAsync, {
    redirectUrl: '/admin/requirement',
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
          <Input
            name="description"
            type="text"
            register={register}
            formState={formState}
            label={t('inputs.description.label')}
            placeholder={t('inputs.description.placeholder')}
            required
          />
          <Input
            name="categoryRequirementId"
            type="text"
            register={register}
            formState={formState}
            label={t('inputs.categoryRequirementId.label')}
            placeholder={t('inputs.categoryRequirementId.placeholder')}
          />
          <Input
            name="onlyRequireInNewClients"
            type="text"
            register={register}
            formState={formState}
            label={t('inputs.onlyRequireInNewClients.label')}
            placeholder={t('inputs.onlyRequireInNewClients.placeholder')}
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

export default NewRequirementPage;
