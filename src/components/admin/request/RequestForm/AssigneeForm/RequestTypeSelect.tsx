// Libraries
import React, { useEffect } from 'react';
// Type imports
import type { FC } from 'react';
import type { CreateRequestAssigneeInputs } from '@/connections/request';
import { useWatch, type Control, type FormState, type UseFormResetField } from 'react-hook-form';
// Icons
import { MdOutlineSignpost } from 'react-icons/md';

import Select from '@/components/form/select';
// Relative imports
import { api } from '@/components/hoc/tanstack-query-provider';

interface IrequestTypeSelectProps {
  control: Control<CreateRequestAssigneeInputs>;
  formState: FormState<CreateRequestAssigneeInputs>;
  resetField: UseFormResetField<CreateRequestAssigneeInputs>;
}

const RequestTypeSelect: FC<IrequestTypeSelectProps> = ({ control, formState, resetField }) => {
  const areaId = useWatch({ control, name: 'area.areaId' });
  const { data: requestTypes, isLoading } = api.requestType.getByAreaId.useQuery({ areaId }, { enabled: !!areaId });

  useEffect(() => {
    resetField('requestType', { defaultValue: { name: '', requestTypeId: '' } });
  }, [areaId]);

  return (
    <Select
      name="requestType"
      options={requestTypes}
      isLoading={isLoading}
      formState={formState}
      control={control}
      getOptionValue={(option) => option.requestTypeId}
      getOptionLabel={(option) => option.name || ''}
      label="Request Type"
      placeholder="Enter Request Type"
      Icon={MdOutlineSignpost}
    />
  );
};

export default RequestTypeSelect;
