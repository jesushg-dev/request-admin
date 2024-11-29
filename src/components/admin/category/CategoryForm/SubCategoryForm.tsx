'use client';

import React, { FC } from 'react';
import { useCreateSubcategoryArrayForm } from '@/connections/category';
import type { CreateSubcategoryArrayInputs } from '@/connections/category';
import { triggerConfirmCallback } from '@/utils/tools/message';
import { IoMdTrash } from 'react-icons/io';
import { MdDynamicForm, MdSubdirectoryArrowRight, MdTextFields } from 'react-icons/md';

import BackAndContinue from '@/components/common/back-and-continue';
import { Button, ErrorList, Input, Select, Textarea } from '@/components/form';
import { api } from '@/components/hoc/tanstack-query-provider';
import Scrollable from '@/components/Scrollable';

interface CreateSubCategoryFormProps {
  goBack: () => void;
  defaultValues?: CreateSubcategoryArrayInputs | null;
  onSubmit: (data: CreateSubcategoryArrayInputs) => void;
}

const SubCategoryForm: FC<CreateSubCategoryFormProps> = ({ goBack, onSubmit, defaultValues }) => {
  const { data: dataForms } = api.form.getAll.useQuery();

  const { register, handleSubmit, control, formState, subCategories } = useCreateSubcategoryArrayForm(defaultValues);

  return (
    <form className="flex flex-1 flex-col justify-between gap-2 p-6" onSubmit={handleSubmit(onSubmit)}>
      {subCategories.fields.length === 0 && (
        //no categorys
        <div className="text-center text-gray-400">
          <p>No categorys added yet</p>
          <span className="text-gray-600">Add a category to continue</span>
        </div>
      )}

      <Scrollable>
        <div className="flex flex-col gap-2">
          {subCategories.fields.map((category, index) => (
            <div key={category.id || index} className="rounded border border-gray-200 p-2 shadow-sm">
              <div className="flex gap-4">
                <div className="mb-2 grid w-full grid-cols-3 items-start gap-2">
                  <input type="hidden" {...register(`subCategories.${index}.subCategoryId`)} />
                  <Input
                    required
                    name={`subCategories.${index}.name`}
                    type="text"
                    register={register}
                    formState={formState}
                    label={`#${index + 1} Name`}
                    placeholder={`Name of Category`}
                    Icon={MdSubdirectoryArrowRight}
                  />
                  <Textarea
                    name={`subCategories.${index}.description`}
                    register={register}
                    formState={formState}
                    rows={1}
                    label={`#${index + 1} Description`}
                    placeholder={`Briefly Describe Category ${index + 1}`}
                    Icon={MdTextFields}
                  />
                  <Select
                    label={`#${index + 1} Form`}
                    name={`subCategories.${index}.form`}
                    control={control}
                    formState={formState}
                    Icon={MdDynamicForm}
                    options={dataForms}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option.id.toString()}
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => triggerConfirmCallback('This action cannot be undone.', 'Are you sure?', () => subCategories.remove(index))}
                  className="flex-1 rounded bg-red-500 px-2 font-semibold text-white hover:bg-red-700">
                  <IoMdTrash />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Scrollable>

      <button
        type="button"
        onClick={() => subCategories.append({ name: '', description: '' })}
        className="w-full rounded border-2 border-dashed border-gray-200 p-2 text-center text-sm text-gray-600 shadow-sm hover:border-gray-400 hover:text-gray-800">
        Add Subcategory
      </button>

      <ErrorList formState={formState} />
      <BackAndContinue goBack={goBack} type="submit" />
    </form>
  );
};

export default SubCategoryForm;
