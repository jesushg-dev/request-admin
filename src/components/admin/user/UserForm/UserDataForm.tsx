import React, { useEffect } from 'react';
import type { FC } from 'react';

import { MdOutlineEmail, MdArchitecture, MdPersonOutline, MdDateRange, MdImage, MdLocationOn, MdAccountCircle, MdLockOutline, MdApproval } from 'react-icons/md';

import { ErrorList, Button, Input, Select } from '@/components/form';

import { api } from '@/hoc/tanstack-query-provider';
import { useCreateUserForm } from '@/connections/user';
import type { CreateUserInputs } from '@/connections/user';

interface IUserDataFormProps {
  onAreaChange?: (areaId: string) => void;
  onSubmit: (data: CreateUserInputs) => void;
  defaultValues?: Partial<CreateUserInputs> | null;
}

const UserDataForm: FC<IUserDataFormProps> = ({ defaultValues, onSubmit, onAreaChange }) => {
  const areas = api.area.getAll.useQuery();
  const roles = api.role.getAll.useQuery();
  const { control, register, handleSubmit, formState, watch } = useCreateUserForm(defaultValues);
  const areaId = watch('area.areaId');

  useEffect(() => {
    if (onAreaChange) {
      onAreaChange(areaId);
    }
  }, [areaId, onAreaChange]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 p-10">
      <div className="grid grid-cols-1 gap-4 gap-y-2 text-sm md:grid-cols-5">
        <div className="md:col-span-5">
          <Input name="name" type="text" register={register} formState={formState} label="Name" placeholder="Enter Name" Icon={MdPersonOutline} />
        </div>
        <div className="md:col-span-3">
          <Input name="userName" type="text" register={register} formState={formState} label="Username" placeholder="Enter Username" maxLength={50} Icon={MdAccountCircle} />
        </div>
        <div className="md:col-span-2">
          <Input name="password" type="password" register={register} formState={formState} label="Password" placeholder="Enter Password" maxLength={255} Icon={MdLockOutline} />
        </div>
        <div className="md:col-span-3">
          <Input name="email" type="email" register={register} formState={formState} label="Email" placeholder="Enter Email" required Icon={MdOutlineEmail} />
        </div>
        <div className="md:col-span-2">
          <Input name="position" type="text" register={register} formState={formState} label="Position" Icon={MdApproval} />

          <Input readOnly required name="emailVerified" type="hidden" register={register} formState={formState} label="Email Verified" Icon={MdDateRange} />
        </div>
        <div className="md:col-span-5">
          <Select
            isMulti
            name="roles"
            options={roles.data}
            formState={formState}
            control={control}
            getOptionValue={(option) => option.roleId}
            getOptionLabel={(option) => option.name || ''}
            label="Roles"
            Icon={MdArchitecture}
            placeholder="Select Roles"
          />
        </div>

        <div className="md:col-span-3">
          <Input name="image" type="text" register={register} formState={formState} label="Image" placeholder="Enter Image URL" Icon={MdImage} />
        </div>
        <div className="md:col-span-2">
          <Select
            name="area"
            options={areas.data}
            isLoading={areas.isLoading}
            formState={formState}
            control={control}
            getOptionValue={(option) => option.areaId}
            getOptionLabel={(option) => option.name || ''}
            label="Area ID"
            placeholder="Enter Area ID"
            Icon={MdLocationOn}
          />
        </div>

        <div className="flex gap-2 md:col-span-5">
          <Input name="superAdmin" type="checkbox" register={register} formState={formState} label="Super Admin" />
          <Input name="isActivated" type="checkbox" register={register} formState={formState} label="Is Activated" />
          <Input name="isLocked" type="checkbox" register={register} formState={formState} label="Is Locked" />
        </div>
      </div>
      <ErrorList formState={formState} />
      <div className="flex w-full justify-end">
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
};

export default UserDataForm;
