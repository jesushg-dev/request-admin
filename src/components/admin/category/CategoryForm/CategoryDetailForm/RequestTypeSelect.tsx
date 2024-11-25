// Libraries
import React, { useEffect, useRef } from 'react';
import { type UseFormResetField, useWatch, type Control, type FormState } from 'react-hook-form';

// Type imports
import type { FC } from 'react';
import type { CreateCategoryInputs } from '@/connections/category';

// Relative imports
import { api } from '@/components/hoc/tanstack-query-provider';
import Select from '@/components/form/select';

// Icons
import { MdOutlineSignpost } from 'react-icons/md';

type PreservedType = { prev: string | null; isFirstRender: boolean };

interface IrequestTypeSelectProps {
  control: Control<CreateCategoryInputs>;
  formState: FormState<CreateCategoryInputs>;
  resetField: UseFormResetField<CreateCategoryInputs>;
}

const RequestTypeSelect: FC<IrequestTypeSelectProps> = ({ control, formState, resetField }) => {
  const areaId = useWatch({ control, name: 'area.areaId' });
  const { data: requestTypes, isLoading } = api.requestType.getByAreaId.useQuery({ areaId }, { enabled: !!areaId });
  const areaIdRef = useRef<PreservedType>({ prev: null, isFirstRender: true });

  useEffect(() => {
    if (areaIdRef.current.isFirstRender) {
      areaIdRef.current.isFirstRender = false;
    } else if (areaIdRef.current.prev !== areaId) {
      resetField('requestType', { defaultValue: { requestTypeId: '', name: '' } });
    }
    areaIdRef.current.prev = areaId;
  }, [areaId, resetField]);

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
