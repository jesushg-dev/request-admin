// Libraries
import React from 'react';
// Type imports
import type { FC } from 'react';
import type { CreateCategoryInputs } from '@/connections/category';
import { type Control, type FormState } from 'react-hook-form';
// Icons
import { MdOutlineGroupWork } from 'react-icons/md';

import Select from '@/components/form/select';
// Relative imports
import { api } from '@/components/hoc/tanstack-query-provider';

interface IAreaSelectProps {
  control: Control<CreateCategoryInputs>;
  formState: FormState<CreateCategoryInputs>;
}

const AreaSelect: FC<IAreaSelectProps> = ({ control, formState }) => {
  const { data: areas, isLoading: loadingAreas } = api.area.getSimpleAll.useQuery();

  return (
    <Select
      name="area"
      options={areas}
      isLoading={loadingAreas}
      formState={formState}
      control={control}
      getOptionValue={(option) => option.areaId}
      getOptionLabel={(option) => option.name || ''}
      label="Area"
      placeholder="Enter Area"
      Icon={MdOutlineGroupWork}
    />
  );
};

export default AreaSelect;
