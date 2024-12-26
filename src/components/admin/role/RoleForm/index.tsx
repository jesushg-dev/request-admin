'use client';

import React, { useState, type FC } from 'react';
import type { CreateRoleInputs, CreateRoleWithFeaturesAndEmployeesInputs, SelectFeatureInputs } from '@/connections/role';
import type { IEmployee } from '@/utils/types';
import { StepDirective, StepperComponent, StepsDirective } from '@syncfusion/ej2-react-navigations';

import rswitch from '@/lib/rswitch';

import FeatureSelector from './FeatureSelector';
import RoleDetailForm from './RoleDetailForm';
import SummaryForm from './SummaryForm';
import UserSelector from './UserSelector';

interface RoleFormProps {
  roleId?: string;
  defaultValues?: CreateRoleWithFeaturesAndEmployeesInputs | null;
  onSubmit: (data: CreateRoleWithFeaturesAndEmployeesInputs) => void;
}

const RoleForm: FC<RoleFormProps> = ({ roleId, defaultValues, onSubmit }) => {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<CreateRoleInputs>();
  const [employees, setEmployees] = useState<IEmployee[]>();
  const [features, setFeatures] = useState<SelectFeatureInputs>();

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

  const onSubmitFeature = (data: SelectFeatureInputs) => {
    setFeatures(data);
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
            <StepDirective label="Feature Role" />
            <StepDirective label="Review" />
          </StepsDirective>
        </StepperComponent>
      </div>

      {rswitch(step, {
        0: <RoleDetailForm defaultValues={role} onSubmit={onSubmitRole} />,
        1: <UserSelector goBack={() => setStep(0)} defaultValues={employees} onSubmit={onSubmitEmployee} />,
        2: <FeatureSelector defaultValues={features} goBack={() => setStep(1)} onSubmit={onSubmitFeature} />,
        3: <>{role && employees && features && <SummaryForm role={role} employees={employees} features={features} goBack={() => setStep(2)} onSubmit={onSubmit} />}</>,
      })}
    </div>
  );
};

export default RoleForm;
