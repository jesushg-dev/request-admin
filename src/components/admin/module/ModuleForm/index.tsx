'use client';

import React, { useState, type FC } from 'react';
import { type CreateModuleInputs, type CreateModuleWithPermissionInputs } from '@/connections/module';
import { type CreatePermissionsInputs } from '@/connections/permission';
import { StepDirective, StepperComponent, StepsDirective } from '@syncfusion/ej2-react-navigations';

import rswitch from '@/lib/rswitch';
import CardForm from '@/components/common/CardForm';

import ModuleForm from './ModuleForm';
import PermissionsForm from './PermissionsForm';
import SummaryForm from './SummaryForm';

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
