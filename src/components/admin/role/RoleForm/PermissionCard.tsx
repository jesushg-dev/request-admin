import React, { type FC } from 'react';
import { type SelectFeatureInputs } from '@/connections/role';
import type { Control, FormState } from 'react-hook-form';

import { Select } from '@/components/form';
import { type RouterOutputs } from '@/components/hoc/tanstack-query-provider';

type ModuleWithFeatures = RouterOutputs['module']['getModulesFeatures'][number];

interface IFeatureCardProps {
  index: number;
  module: ModuleWithFeatures;
  control: Control<SelectFeatureInputs>;
  formState: FormState<SelectFeatureInputs>;
  defaultValues?: SelectFeatureInputs | null;
}

const FeatureCard: FC<IFeatureCardProps> = ({ index, control, formState, module }) => {
  return (
    <div>
      <h1 className="font-bold capitalize">{module.name}</h1>
      <hr className="my-2" />
      <Select
        control={control}
        formState={formState}
        isMulti
        name={`moduleFeatures.${index}.features`}
        options={module.features}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.featureId}
        className="w-full"
      />
    </div>
  );
};

export default FeatureCard;
