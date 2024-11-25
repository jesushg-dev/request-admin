'use client';

import React, { type FC, useState } from 'react';

import { StepperComponent, StepsDirective, StepDirective } from '@syncfusion/ej2-react-navigations';

import ModuleForm from './ModuleForm';
import SummaryForm from './SummaryForm';
import PermissionsForm from './PermissionsForm';

import rswitch from '@/lib/rswitch';
import CardForm from '@/components/common/CardForm';
import { type CreatePermissionsInputs } from '@/connections/permission';
import { type CreateModuleWithPermissionInputs, type CreateModuleInputs } from '@/connections/module';

interface FormProps {
  defaultValues?: Partial<CreateModuleWithPermissionInputs>;
  onSubmit: (data: CreateModuleWithPermissionInputs) => void;
}

const Form: FC<FormProps> = ({ defaultValues, onSubmit }) => {
  const [step, setStep] = useState(0);
  const [module, setModule] = useState<CreateModuleInputs | null>(defaultValues?.module || null);
  const [permissions, setPermissions] = useState<CreatePermissionsInputs | null>(defaultValues?.permissions || null);

  const onSubmitModule = (data: CreateModuleInputs) => {
    setModule(data);
    setStep(1);
  };

  const onSubmitPermissions = (data: CreatePermissionsInputs) => {
    setPermissions(data);
    setStep(2);
  };

  const handleSubmit = () => {
    if (!module || !permissions) return;
    onSubmit({ module, permissions });
  };

  return (
    <CardForm
      header={
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        <StepperComponent activeStep={step} stepChanged={(e) => setStep(e.activeStep)}>
          <StepsDirective>
            <StepDirective label="Module" />
            <StepDirective label="Permissions" />
            <StepDirective label="Review" />
          </StepsDirective>
        </StepperComponent>
      }>
      {rswitch(step, {
        0: <ModuleForm defaultValues={module} submitForm={onSubmitModule} />,
        1: <PermissionsForm goBack={() => setStep(0)} defaultValues={permissions || undefined} submitForm={onSubmitPermissions} />,
        2: <SummaryForm module={module} permissions={permissions || []} onSubmit={handleSubmit} />,
      })}
    </CardForm>
  );
};

export default Form;
