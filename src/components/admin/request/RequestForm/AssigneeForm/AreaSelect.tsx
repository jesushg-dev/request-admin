// Libraries
import React from 'react';
import { type Control, type FormState } from 'react-hook-form';

// Type imports
import type { FC } from 'react';
import type { CreateRequestAssigneeInputs } from '@/connections/request';

// Relative imports
import { api } from '@/hoc/tanstack-query-provider';
import Select from '@/components/form/select';

// Icons
import { MdOutlineGroupWork } from 'react-icons/md';

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
