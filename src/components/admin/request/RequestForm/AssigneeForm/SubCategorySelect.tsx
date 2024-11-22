// Libraries
import React, { useEffect } from 'react';
import { type UseFormResetField, useWatch, type Control, type FormState } from 'react-hook-form';

// Type imports
import type { FC } from 'react';
import type { CreateRequestAssigneeInputs } from '@/connections/request';

// Relative imports
import { api } from '@/hoc/TRPCReactProvider';
import Select from '@/components/form/select';

// Icons
import { MdOutlineChangeHistory } from 'react-icons/md';

interface ISubcategorySelectProps {
  control: Control<CreateRequestAssigneeInputs>;
  formState: FormState<CreateRequestAssigneeInputs>;
  resetField: UseFormResetField<CreateRequestAssigneeInputs>;
}

const SubCategorySelect: FC<ISubcategorySelectProps> = ({ control, formState, resetField }) => {
  const categoryId = useWatch({ control, name: 'category.categoryId' });

  const { data: subCategories, isLoading } = api.category.getSubCategoriesByCategoryId.useQuery({ categoryId }, { enabled: !!categoryId });

  useEffect(() => {
    resetField('subCategory', { defaultValue: { name: '', subCategoryId: '' } });
  }, [categoryId]);

  return (
    <Select
      name="subCategory"
      options={subCategories}
      isLoading={isLoading}
      formState={formState}
      control={control}
      getOptionValue={(option) => option.subCategoryId}
      getOptionLabel={(option) => option.name || ''}
      label="Sub Category"
      placeholder="Enter Sub Category"
      Icon={MdOutlineChangeHistory}
    />
  );
};

export default SubCategorySelect;
