'use client';

import React, { FC } from 'react';

import { MdOutlineCategory } from 'react-icons/md';

import { Input, Textarea } from '@/components/form';
import ErrorList from '@/components/form/error-list';

import BackAndContinue from '@/components/common/back-and-continue';
import { CreateCategoryInputs } from '@/connections/category/categorySchemas';
import { useCreateCategoryForm } from '@/connections/category/useCategoryForm';
import AreaSelect from './AreaSelect';
import RequestTypeSelect from './RequestTypeSelect';

interface CategoryDetailFormProps {
  defaultValues?: Partial<CreateCategoryInputs> | null;
  onSubmit: (data: CreateCategoryInputs) => void;
}

const CategoryDetailForm: FC<CategoryDetailFormProps> = ({ defaultValues, onSubmit }) => {
  const { register, handleSubmit, control, formState, resetField } = useCreateCategoryForm(defaultValues);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-6">
      <Input name="name" type="text" register={register} formState={formState} label="Name" placeholder="Enter Name" maxLength={150} Icon={MdOutlineCategory} />

      <AreaSelect control={control} formState={formState} />
      <RequestTypeSelect control={control} formState={formState} resetField={resetField} />
      <Textarea name="description" register={register} formState={formState} label="Description" placeholder="Enter Description" maxLength={255} />

      <ErrorList formState={formState} />
      <BackAndContinue type="submit" />
    </form>
  );
};

export default CategoryDetailForm;
