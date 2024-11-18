// Libraries
import React, { useEffect } from 'react';
import { type UseFormResetField, useWatch, type Control, type FormState } from 'react-hook-form';

// Type imports
import type { FC } from 'react';
import type { CreateRequestAssigneeInputs } from '@/connections/request';

// Relative imports
import { api } from '@/hoc/TRPCReactProvider';
import Select from '@/components/Form/Select';

// Icons
import { MdOutlineCategory } from 'react-icons/md';

interface ICategorySelectProps {
  control: Control<CreateRequestAssigneeInputs>;
  formState: FormState<CreateRequestAssigneeInputs>;
  resetField: UseFormResetField<CreateRequestAssigneeInputs>;
}

const CategorySelect: FC<ICategorySelectProps> = ({ control, formState, resetField }) => {
  const requestTypeId = useWatch({ control, name: 'requestType.requestTypeId' });

  const { data: categories, isLoading } = api.category.getByrequestTypeId.useQuery({ requestTypeId }, { enabled: !!requestTypeId });

  useEffect(() => {
    resetField('category', { defaultValue: { name: '', categoryId: '' } });
  }, [requestTypeId]);

  return (
    <Select
      name="category"
      options={categories}
      isLoading={isLoading}
      formState={formState}
      control={control}
      getOptionValue={(option) => option.categoryId}
      getOptionLabel={(option) => option.name || ''}
      label="Category"
      placeholder="Enter Category"
      Icon={MdOutlineCategory}
    />
  );
};

export default CategorySelect;
