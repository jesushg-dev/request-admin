// Libraries
import React from 'react';
// Type imports
import type { FC } from 'react';
import type { CreateRequestAssigneeInputs } from '@/connections/request';
import { type Control, type FormState } from 'react-hook-form';
// Icons
import { MdOutlineGroupWork } from 'react-icons/md';

import Select from '@/components/form/select';
// Relative imports
import { api } from '@/components/hoc/tanstack-query-provider';

interface IAreaSelectProps {
  control: Control<CreateRequestAssigneeInputs>;
  formState: FormState<CreateRequestAssigneeInputs>;
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
