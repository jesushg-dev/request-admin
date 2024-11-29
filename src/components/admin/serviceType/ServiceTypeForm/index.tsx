'use client';

import React, { useState, type FC } from 'react';
import type { UpdateRequirementInputs as RequirementInputs } from '@/connections/requirement';
import type { CreateServiceTypeInputs, CreateServiceTypeWithRequirementInputs } from '@/connections/service-type';
import { StepDirective, StepperComponent, StepsDirective } from '@syncfusion/ej2-react-navigations';

import rswitch from '@/lib/rswitch';
import { api } from '@/components/hoc/tanstack-query-provider';

import RequerimentSelector from './RequerimentSelector';
import ServiceTypeDetailForm from './ServiceTypeDetailForm';
import SummaryForm from './SummaryForm';

interface ServiceTypeFormProps {
  defaultValues?: CreateServiceTypeWithRequirementInputs | null;
  onSubmit: (data: CreateServiceTypeWithRequirementInputs) => void;
}

const ServiceTypeForm: FC<ServiceTypeFormProps> = ({ defaultValues, onSubmit }) => {
  const { data: salesChannel } = api.salesChannel.getAll.useQuery();
  const { data: requirementsData } = api.requirement.getAll.useQuery();

  const [step, setStep] = useState(0);
  const [requirements, setRequirements] = useState<RequirementInputs[]>(defaultValues?.requirements || []);
  const [serviceType, setServiceType] = useState<CreateServiceTypeInputs | null>(defaultValues || null);

  const onSubmitServiceType = (data: CreateServiceTypeInputs) => {
    setServiceType(data);
    setStep(1);
  };

  const onSubmitRequirements = (data: RequirementInputs[]) => {
    setRequirements(data);
    setStep(2);
  };

  return (
    <div className="border-stroke shadow-default dark:border-strokedark dark:bg-boxdark flex flex-1 flex-col rounded-sm border bg-white">
      <div className="border-stroke dark:border-strokedark border-b px-6 py-4">
        <StepperComponent
          activeStep={step}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          stepChanged={(e) => setStep(e.activeStep)}>
          <StepsDirective>
            <StepDirective label="Service Type" />
            <StepDirective label="Requirements" />
            <StepDirective label="Review" />
          </StepsDirective>
        </StepperComponent>
      </div>

      {rswitch(step, {
        0: <ServiceTypeDetailForm defaultValues={serviceType} options={salesChannel || []} onSubmit={onSubmitServiceType} />,
        1: (
          <>{step === 1 && requirementsData && <RequerimentSelector goBack={() => setStep(0)} defaultValues={requirements} requirementsData={requirementsData} submitForm={onSubmitRequirements} />}</>
        ),
        2: <>{serviceType && requirements && <SummaryForm serviceType={serviceType} requirements={requirements} goBack={() => setStep(1)} onSubmit={onSubmit} />}</>,
      })}
    </div>
  );
};

export default ServiceTypeForm;
