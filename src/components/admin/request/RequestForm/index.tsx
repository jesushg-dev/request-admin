'use client';

import React, { type FC, useState } from 'react';
import { StepperComponent, StepsDirective, StepDirective } from '@syncfusion/ej2-react-navigations';

import ClientForm from './ClientForm';
import SummaryForm from './SummaryForm';
import AssigneeForm from './AssigneeForm';
import RequestDetailForm from './RequestDetailForm';
import RequirementsForm from './RequirementsForm';
import SalesChannelSelector from './SalesChannelSelector';
import ServiceTypeSelector from '../../serviceType/ServiceTypeSelector';

import rswitch from '@/services/lib/rswitch';
import { api } from '@/hoc/tanstack-query-provider';
import { CreateClientInputs } from '@/connections/client';
import type { ClientType } from '@/utils/types';
import type { RouterOutputs } from '@/server/server';
import type { CreateRequestInputs, CreateRequestDetailInputs, CreateRequestAssigneeInputs } from '@/connections/request';
import DocumentForm from './DocumentForm';

type ServiceTypeType = RouterOutputs['serviceType']['infinite']['items'][number];
type ClientInputType = {
  newClientData: CreateClientInputs | null;
  clientData: ClientType | null;
};
type CheckedType = Record<string, boolean>;

interface RequestFormProps {
  defaultValues?: CreateRequestDetailInputs | null;
  onSubmit: (data: CreateRequestDetailInputs) => void;
}

const RequestForm: FC<RequestFormProps> = ({ defaultValues, onSubmit }) => {
  // State
  const [caseData, setRequestData] = useState<CreateRequestInputs>();
  const [serviceType, setServiceType] = useState<ServiceTypeType>();
  const [clientDetail, setClientDetail] = useState<ClientInputType>();
  const [selectedChannelId, setSelectedChannelId] = useState<string>();
  const [checkedRequirements, setCheckedRequirements] = useState<CheckedType>();
  const [assigneeData, setAssigneeData] = useState<CreateRequestAssigneeInputs>();

  // Data fetching
  const { data: clients, isLoading: loadingClients } = api.client.getAll.useQuery();
  const { data: salesChannel, isLoading: loadingSales } = api.salesChannel.getAll.useQuery();

  // Data fetching with parameters and dependencies
  const { data: requirementsData, isLoading: loadingRequirements } = api.requirement.getByServiceTypeId.useQuery(
    { serviceTypeId: serviceType?.serviceTypeId as unknown as string },
    { enabled: !!serviceType }
  );

  const {
    data: serviceTypeData,
    isLoading: loadingServices,
    refetch,
  } = api.serviceType.getBySalesChannelId.useQuery({ salesChannelId: selectedChannelId! }, { enabled: selectedChannelId !== undefined });

  const [step, setStep] = useState(0);

  const onSaleChannelSubmit = async (selectedChannelId: string) => {
    setSelectedChannelId(selectedChannelId);
    const results = await refetch();
    const step = results.data?.length === 0 ? 3 : 1;
    setStep(step);
  };

  const onServiceTypeSubmit = (serviceType: ServiceTypeType) => {
    setServiceType(serviceType);
    setStep(2);
  };

  const onRequirementsSubmit = (checkedRequirements: Record<string, boolean>) => {
    setCheckedRequirements(checkedRequirements);
    setStep(3);
  };

  const onAssigneeSubmit = (data: CreateRequestAssigneeInputs) => {
    setAssigneeData(data);
    setStep(4);
  };

  const onRequestSubmit = (data: CreateRequestInputs) => {
    setRequestData(data);
    setStep(5);
  };

  const onClientSubmit = (data: ClientInputType) => {
    setClientDetail(data);
    setStep(6);
  };

  return (
    <div className="border-stroke shadow-default dark:border-strokedark dark:bg-boxdark flex flex-1 flex-col rounded-sm border bg-white">
      <div className="border-stroke dark:border-strokedark border-b px-6 py-4">
        <StepperComponent
          activeStep={step}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          stepChanged={(e) => setStep(e.activeStep)}
          //stepChanging={(e) => (e.cancel = e.activeStep !== step)}
          linear={true}>
          <StepsDirective>
            <StepDirective label="Sale Channel" />
            <StepDirective label="Service Type" />
            <StepDirective label="Requirements" />
            <StepDirective label="Assignee" />
            <StepDirective label="Request" />
            <StepDirective label="Client" />
            <StepDirective label="Documents" />
            <StepDirective label="Review" />
          </StepsDirective>
        </StepperComponent>
      </div>

      {rswitch(step, {
        0: <SalesChannelSelector loading={loadingSales} channels={salesChannel || []} defaultValue={selectedChannelId} onChange={onSaleChannelSubmit} goBack={() => setStep(0)} />,
        1: <ServiceTypeSelector loading={loadingServices} services={serviceTypeData || []} defaultValue={serviceType} onChange={onServiceTypeSubmit} goBack={() => setStep(0)} />,
        2: (
          <RequirementsForm
            loading={loadingRequirements}
            requirements={requirementsData || []}
            defaultValues={checkedRequirements}
            onChange={onRequirementsSubmit}
            goBack={() => setStep(1)}
          />
        ),
        3: <AssigneeForm defaultValue={assigneeData} onChange={onAssigneeSubmit} goBack={() => setStep(2)} />,
        4: <RequestDetailForm defaultValues={caseData} onSubmit={onRequestSubmit} goBack={() => setStep(3)} subCategoryId={assigneeData?.subCategory.subCategoryId} />,
        5: <ClientForm loading={loadingClients} clients={clients || []} defaultValues={clientDetail} onChange={onClientSubmit} goBack={() => setStep(4)} />,
        6: <DocumentForm goBack={() => setStep(5)} handleSubmit={console.log} />,
      })}
    </div>
  );
};

export default RequestForm;
