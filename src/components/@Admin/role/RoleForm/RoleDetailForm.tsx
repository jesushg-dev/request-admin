'use client';

import React, { FC } from 'react';

import { FaAlignJustify, FaPlusCircle, FaUserTag } from 'react-icons/fa';

import ErrorList from '@/components/Form/ErrorList';
import { Button, Input, Textarea } from '@/components/Form';

import { CreateRoleInputs } from '@/connections/role/roleSchemas';
import { useCreateRoleForm } from '@/connections/role/useRoleForm';

interface RoleAndUserFormProps {
  onSubmit: (data: CreateRoleInputs) => void;
  defaultValues?: Partial<CreateRoleInputs> | null;
}

const RoleAndUserForm: FC<RoleAndUserFormProps> = ({ defaultValues, onSubmit }) => {
  const { register, handleSubmit, formState } = useCreateRoleForm(defaultValues);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2 p-10">
      <Input required name="roleName" type="text" register={register} formState={formState} label="Role Name" placeholder="Enter Role Name" maxLength={50} Icon={FaUserTag} />
      <Textarea name="description" register={register} formState={formState} label="Description" placeholder="Enter Description" maxLength={255} Icon={FaAlignJustify} />

      <ErrorList formState={formState} />
      <div className="flex w-full justify-end">
        <Button type="submit">
          <FaPlusCircle />
          Continue
        </Button>
      </div>
    </form>
  );
};

export default RoleAndUserForm;
