'use client';

import React, { type FC, useState } from 'react';
import { StepperComponent, StepsDirective, StepDirective } from '@syncfusion/ej2-react-navigations';

import UserSelector from './UserSelector';
import SummaryForm from './SummaryForm';
import RoleDetailForm from './RoleDetailForm';
import PermissionSelector from './PermissionSelector';

import { toast } from 'react-toastify';
import rswitch from '@/lib/rswitch';
import type { CreateRoleWithPermissionsAndEmployeesInputs, SelectPermissionInputs, CreateRoleInputs } from '@/connections/role';
import type { IEmployee } from '@/utils/types';

interface RoleFormProps {
  roleId?: string;
  defaultValues?: CreateRoleWithPermissionsAndEmployeesInputs | null;
  onSubmit: (data: CreateRoleWithPermissionsAndEmployeesInputs) => void;
}

const RoleForm: FC<RoleFormProps> = ({ roleId, defaultValues, onSubmit }) => {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<CreateRoleInputs>();
  const [employees, setEmployees] = useState<IEmployee[]>();
  const [permissions, setPermissions] = useState<SelectPermissionInputs>();

  const onSubmitRole = (data: CreateRoleInputs) => {
    setRole(data);
    setStep(1);

    toast('Selecciona cuidadosamente los usuarios que serán asignados a este rol', {
      type: 'warning',
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const onSubmitEmployee = (data: IEmployee[]) => {
    setEmployees(data);
    setStep(2);

    toast('En cada módulo, tendrás la flexibilidad de activar o desactivar los permisos que consideres necesarios según tus requerimientos.', {
      type: 'info',
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const onSubmitPermission = (data: SelectPermissionInputs) => {
    setPermissions(data);
    setStep(3);
  };

  return (
    <div className="border-stroke shadow-default dark:border-strokedark dark:bg-boxdark flex flex-1 flex-col rounded-sm border bg-white">
      <div className="border-stroke dark:border-strokedark border-b px-6 py-4">
        <StepperComponent
          activeStep={step}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          stepChanged={(e) => setStep(e.activeStep)}>
          <StepsDirective>
            <StepDirective label="Role" />
            <StepDirective label="User Role" />
            <StepDirective label="Permission Role" />
            <StepDirective label="Review" />
          </StepsDirective>
        </StepperComponent>
      </div>

      {rswitch(step, {
        0: <RoleDetailForm defaultValues={role} onSubmit={onSubmitRole} />,
        1: <UserSelector goBack={() => setStep(0)} defaultValues={employees} onSubmit={onSubmitEmployee} />,
        2: <PermissionSelector defaultValues={permissions} goBack={() => setStep(1)} onSubmit={onSubmitPermission} />,
        3: <>{role && employees && permissions && <SummaryForm role={role} employees={employees} permissions={permissions} goBack={() => setStep(2)} onSubmit={onSubmit} />}</>,
      })}
    </div>
  );
};

export default RoleForm;
