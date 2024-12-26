'use client';

import React, { useEffect, type FC } from 'react';
import { useSelectFeatureForm, type SelectFeatureInputs } from '@/connections/role';

import BackAndContinue from '@/components/common/back-and-continue';
import { ErrorList } from '@/components/form';
import { api } from '@/components/hoc/tanstack-query-provider';

import FeatureCard from './FeatureCard';

interface IFeatureSelectorProps {
  goBack: () => void;
  defaultValues?: SelectFeatureInputs;
  onSubmit: (data: SelectFeatureInputs) => void;
}

const FeatureSelector: FC<IFeatureSelectorProps> = ({ goBack, defaultValues, onSubmit }) => {
  const { data } = api.module.getModulesFeatures.useQuery();

  const { control, handleSubmit, reset, formState } = useSelectFeatureForm(defaultValues);

  useEffect(() => {
    if (data) {
      const newDefaultValues: SelectFeatureInputs = {
        ...defaultValues,
        moduleFeatures: data.map((module) => {
          const features = defaultValues?.moduleFeatures.find((p) => p.moduleId === module.moduleId);
          return {
            name: module.name,
            moduleId: module.moduleId,
            features: features?.features || [],
          };
        }),
      };
      reset(newDefaultValues);
    }
  }, [data, reset, defaultValues]);

  return (
    <form className="flex flex-1 flex-col gap-2 p-10">
      {data?.map((module, index) => <FeatureCard index={index} module={module} control={control} key={module.moduleId} formState={formState} />)}

      <ErrorList formState={formState} />
      <BackAndContinue goBack={goBack} type="submit" goContinue={handleSubmit(onSubmit)} />
    </form>
  );
};

export default FeatureSelector;
