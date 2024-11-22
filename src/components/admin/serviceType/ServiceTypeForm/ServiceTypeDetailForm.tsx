'use client';
import React, { FC } from 'react';

import { MdArchitecture, MdNotes, MdStore } from 'react-icons/md';

import { Button, ErrorList, Input, Select, Textarea } from '@/components/form';

import { RouterOutputType } from '@/connections/generic_types';
import { useCreateServiceTypeForm } from '@/connections/service-type';
import type { CreateServiceTypeInputs } from '@/connections/service-type';

type InferredOutput = RouterOutputType['salesChannel']['getAll'];

interface IServiceTypeDetailFormProps {
  onClose?: () => void;
  options: InferredOutput;
  defaultValues?: CreateServiceTypeInputs | null;
  onSubmit: (data: CreateServiceTypeInputs) => void;
}

const ServiceTypeDetailForm: FC<IServiceTypeDetailFormProps> = ({ onClose, options, defaultValues, onSubmit }) => {
  const { register, control, handleSubmit, formState } = useCreateServiceTypeForm(defaultValues);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-6">
      <Input required name="name" type="text" register={register} formState={formState} label="Name" placeholder="Enter Name" maxLength={50} Icon={MdArchitecture} />
      <Select
        required
        name="salesChannelId"
        control={control}
        formState={formState}
        label="Sales Channel"
        options={options}
        getOptionLabel={(option) => option.name || ''}
        getOptionValue={(option) => option.salesChannelId}
        placeholder="Select Sales Channel"
        Icon={MdStore}
      />
      <Textarea required name="description" register={register} formState={formState} label="Description" placeholder="Enter Description" maxLength={255} Icon={MdNotes} />
      <Input name="acceptsNewClients" type="checkbox" register={register} formState={formState} label="Accepts New Clients" />

      <ErrorList formState={formState} />

      <div className="flex justify-end gap-4">
        <Button type="button" onClick={onClose} className="bg-gray-300 text-black dark:bg-gray-700 dark:text-white">
          Cancel
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
};

export default ServiceTypeDetailForm;
