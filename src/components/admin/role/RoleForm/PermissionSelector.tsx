'use client';

import React, { useEffect, type FC } from 'react';

import PermissionCard from './PermissionCard';
import BackAndContinue from '@/components/common/back-and-continue';

import { api } from '@/hoc/TRPCReactProvider';
import { ErrorList } from '@/components/form';
import { useSelectPermissionForm, type SelectPermissionInputs } from '@/connections/role';

interface IPermissionSelectorProps {
  goBack: () => void;
  defaultValues?: SelectPermissionInputs;
  onSubmit: (data: SelectPermissionInputs) => void;
}

const PermissionSelector: FC<IPermissionSelectorProps> = ({ goBack, defaultValues, onSubmit }) => {
  const { data } = api.module.getModulesPermissions.useQuery();

  const { control, handleSubmit, reset, formState } = useSelectPermissionForm(defaultValues);

  useEffect(() => {
    if (data) {
      const newDefaultValues: SelectPermissionInputs = {
        ...defaultValues,
        modulePermissions: data.map((module) => {
          const permissions = defaultValues?.modulePermissions.find((p) => p.moduleId === module.moduleId);
          return {
            name: module.name,
            moduleId: module.moduleId,
            permissions: permissions?.permissions || [],
          };
        }),
      };
      reset(newDefaultValues);
    }
  }, [data, reset, defaultValues]);

  return (
    <form className="flex flex-1 flex-col gap-2 p-10">
      {data?.map((module, index) => <PermissionCard index={index} module={module} control={control} key={module.moduleId} formState={formState} />)}

      <ErrorList formState={formState} />
      <BackAndContinue goBack={goBack} type="submit" goContinue={handleSubmit(onSubmit)} />
    </form>
  );
};

export default PermissionSelector;
