'use client';

import React, { FC } from 'react';

import { api } from '@/components/hoc/tanstack-query-provider';
import { useCreaterequestTypeForm } from '@/connections/request-type/useRequestTypeForm';
import { CreateRequestTypeInputs } from '@/connections/request-type/requestTypeSchemas';

import { Input, Select, Textarea } from '@/components/form';
import ErrorList from '@/components/form/error-list';
import CardForm from '../common/CardForm';
import BackAndContinue from '../common/BackAndContinue';

interface requestTypeFormProps {
  defaultValues?: Partial<CreateRequestTypeInputs>;
  submitForm: (data: CreateRequestTypeInputs) => void;
}

const requestTypeForm: FC<requestTypeFormProps> = ({ defaultValues, submitForm }) => {
  const { data: areas } = api.area.getSimpleAll.useQuery();
  const { register, control, handleSubmit, formState } = useCreaterequestTypeForm(defaultValues);

  return (
    <CardForm header={<h3 className="font-medium text-black dark:text-white">{defaultValues ? 'Update requestType' : 'Create New requestType'}</h3>}>
      <form onSubmit={handleSubmit(submitForm)} className="flex flex-col gap-4 p-6">
        <div className="grid grid-cols-2 gap-4">
          <Input name="name" type="text" register={register} formState={formState} label="Name" placeholder="Enter Name" maxLength={50} required />
          <Select options={areas} getOptionLabel={(option) => option.name} getOptionValue={(option) => option.areaId} name="area" control={control} formState={formState} label="Area" placeholder="Enter Area ID" required />
          <Textarea name="description" containerClassName="col-span-2" rows={5} register={register} formState={formState} label="Description" placeholder="Enter Description" maxLength={255} />
          <Input name="state" type="checkbox" register={register} formState={formState} label="State" />
        </div>
        <ErrorList formState={formState} />
        <BackAndContinue type="submit" />
      </form>
    </CardForm>
  );
};

export default requestTypeForm;
