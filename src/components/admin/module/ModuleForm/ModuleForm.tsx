'use client';

import React, { FC } from 'react';
import { useCreateModuleForm } from '@/connections/module';
import type { CreateModuleInputs, CreateModuleWithPermissionInputs } from '@/connections/module';
import { Control, useController } from 'react-hook-form';
import { MdDescription, MdPerson } from 'react-icons/md';

import { Button, ErrorList, Input } from '@/components/form';

interface CreateModuleFormProps {
  defaultValues?: Partial<CreateModuleInputs> | null;
  submitForm: (data: CreateModuleInputs) => void;
}

const ModuleForm: FC<CreateModuleFormProps> = ({ defaultValues, submitForm }) => {
  const { register, handleSubmit, formState } = useCreateModuleForm(defaultValues);

  return (
    <form onSubmit={handleSubmit(submitForm)} className="flex flex-col gap-2 p-10">
      <Input required name="name" type="text" register={register} formState={formState} label="Name" placeholder="Enter Module Name" maxLength={50} Icon={MdPerson} />

      <Input name="description" type="text" register={register} formState={formState} label="Description" placeholder="Enter Description" maxLength={255} Icon={MdDescription} />
      <ErrorList formState={formState} />

      <div className="flex w-full justify-end">
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
};

interface ControlledModuleFormProps {
  control: Control<CreateModuleWithPermissionInputs>;
  onContinue: () => void;
}

const ControlledModuleForm: FC<ControlledModuleFormProps> = ({ control, onContinue }) => {
  const { field } = useController<CreateModuleWithPermissionInputs>({
    name: 'module',
    control,
  });

  const onSubmit = (data: Partial<CreateModuleInputs> | null) => {
    field.onChange(data);
    onContinue();
  };

  return <ModuleForm defaultValues={field.value as Partial<CreateModuleInputs> | null} submitForm={onSubmit} />;
};

export { ControlledModuleForm };

export default ModuleForm;
