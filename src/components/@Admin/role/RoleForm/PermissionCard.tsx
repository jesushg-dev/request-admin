import React, { type FC } from 'react';

import { Select } from '@/components/Form';
import { type RouterOutputs } from '@/hoc/TRPCReactProvider';
import { type SelectPermissionInputs } from '@/connections/role';
import type { Control, FormState } from 'react-hook-form';

type ModuleWithPermissions = RouterOutputs['module']['getModulesPermissions'][number];

interface IPermissionCardProps {
  index: number;
  module: ModuleWithPermissions;
  control: Control<SelectPermissionInputs>;
  formState: FormState<SelectPermissionInputs>;
  defaultValues?: SelectPermissionInputs | null;
}

const PermissionCard: FC<IPermissionCardProps> = ({ index, control, formState, module }) => {
  return (
    <div>
      <h1 className="font-bold capitalize">{module.name}</h1>
      <hr className="my-2" />
      <Select
        control={control}
        formState={formState}
        isMulti
        name={`modulePermissions.${index}.permissions`}
        options={module.permissions}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.permissionId}
        className="w-full"
      />
    </div>
  );
};

export default PermissionCard;
