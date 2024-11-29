// Libraries
import React, { useEffect } from 'react';
// Type imports
import type { FC } from 'react';
import type { CreateRequestAssigneeInputs } from '@/connections/request';
import { useWatch, type Control, type FormState, type UseFormResetField } from 'react-hook-form';
// Icons
import { MdOutlineCategory } from 'react-icons/md';

import Select from '@/components/form/select';
// Relative imports
import { api } from '@/components/hoc/tanstack-query-provider';

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
