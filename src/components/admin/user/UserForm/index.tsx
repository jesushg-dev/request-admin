'use client';

import React, { type FC, useState } from 'react';
import { StepperComponent, StepsDirective, StepDirective } from '@syncfusion/ej2-react-navigations';

import SummaryForm from './SummaryForm';
import UserDataForm from './UserDataForm';
import HierarchyTree from './HierarchyTree';

import rswitch from '@/services/lib/rswitch';
import { extractRelations } from '@/utils/tools/hierarchy';
import type { CreateHierarchyInputs, CreateUserInputs } from '@/connections/user';
import type { AreaUserHierarchy } from '@/server/api/routers/userRouter';

interface UserFormProps {
  userId?: string;
  defaultValues?: Partial<CreateUserInputs> | null;
  onSubmit: (data: CreateUserInputs, hierarchies: CreateHierarchyInputs) => void;
}

const UserForm: FC<UserFormProps> = ({ userId, defaultValues, onSubmit }) => {
  const [step, setStep] = useState(0);
  const [hierarchies, setHierarchies] = useState<AreaUserHierarchy[]>([]);
  const [areaId, setAreaId] = useState<string | null>(defaultValues?.area?.areaId || null);
  const [user, setUser] = useState<Partial<CreateUserInputs> | null>(defaultValues || null);

  const onSubmitUser = (data: CreateUserInputs) => {
    setUser(data);
    setStep(1);
  };

  const onSubmitHierarchy = (data: AreaUserHierarchy[]) => {
    setHierarchies(data);
    setStep(2);
  };

  const onSubmitSummary = () => {
    const userData = user as CreateUserInputs;
    const relation = extractRelations(hierarchies);
    onSubmit(userData, relation);
  };

  return (
    <div className="border-stroke shadow-default dark:border-strokedark dark:bg-boxdark flex flex-1 flex-col rounded-sm border bg-white">
      <div className="border-stroke dark:border-strokedark border-b px-6 py-4">
        <StepperComponent
          activeStep={step}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          stepChanged={(e) => setStep(e.activeStep)}>
          <StepsDirective>
            <StepDirective label="User" />
            <StepDirective label="Hierarchy" />
            <StepDirective label="Review" />
          </StepsDirective>
        </StepperComponent>
      </div>

      {rswitch(step, {
        0: <UserDataForm defaultValues={user} onSubmit={onSubmitUser} onAreaChange={setAreaId} />,
        1: (
          <div className="p-8">
            {!!areaId ? (
              <HierarchyTree goBack={() => setStep(0)} defaultValues={hierarchies} submitForm={onSubmitHierarchy} userId={userId} areaId={areaId} />
            ) : (
              <p>Seleccione un área para interactuar con su jerarquía</p>
            )}
          </div>
        ),
        2: (
          <>
            {!!user && !!hierarchies.length ? (
              <SummaryForm goBack={() => setStep(1)} user={user} hierarchies={hierarchies} onSubmit={onSubmitSummary} />
            ) : (
              <p>Complete los pasos anteriores</p>
            )}
          </>
        ),
      })}
    </div>
  );
};

export default UserForm;
