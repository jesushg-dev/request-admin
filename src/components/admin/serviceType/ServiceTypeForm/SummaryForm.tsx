import React from 'react';
import type { FC } from 'react';

import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { ListViewComponent } from '@syncfusion/ej2-react-lists';
import { FiCheckCircle, FiBookOpen, FiUserPlus, FiList, FiTag } from 'react-icons/fi';

import Scrollable from '@/components/Scrollable';
import BackAndContinue from '@/components/common/back-and-continue';
import type { UpdateRequirementInputs as RequirementInputs } from '@/connections/requirement';
import type { CreateServiceTypeInputs, CreateServiceTypeWithRequirementInputs } from '@/connections/service-type';

interface ISummaryFormProps {
  requirements: RequirementInputs[];
  serviceType: CreateServiceTypeInputs;
  onSubmit: (data: CreateServiceTypeWithRequirementInputs) => void;
  goBack: () => void;
}

const fields = { text: 'Name' };

const SummaryForm: FC<ISummaryFormProps> = ({ serviceType, requirements, goBack, onSubmit }) => {
  const handleSubmit = () => {
    const data = { ...serviceType, requirements };
    onSubmit(data);
  };

  const listTemplate = (data: RequirementInputs) => {
    const firstLetter = data.name.charAt(0).toUpperCase();
    return (
      <div className="e-list-wrapper e-list-multi-line e-list-avatar e-info" title={data.description}>
        <span className="e-avatar e-avatar-circle">{firstLetter}</span>
        <span className="e-list-item-header">{data.name}</span>
        <span className="e-list-content">{data.description}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="grid w-full flex-1 grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <h2 className="flex items-center gap-2 pb-6 text-xl font-bold">
            <FiBookOpen className="text-primary" /> Service Type Details
          </h2>
          <ul className="flex w-full flex-col gap-4">
            <li className="flex items-center gap-2">
              <FiTag className="text-gray-500" />
              <span>Name: {serviceType.name || 'N/A'}</span>
            </li>
            <li className="flex items-center gap-2">
              <FiList className="text-gray-500" />
              <span>Description: {serviceType.description || 'N/A'}</span>
            </li>
            <li className="flex items-center gap-2">
              <FiCheckCircle className="text-gray-500" />
              <span>Accepts New Clients: {serviceType.acceptsNewClients ? 'Yes' : 'No'}</span>
            </li>
            <li className="flex items-center gap-2">
              <FiUserPlus className="text-gray-500" />
              <span>Sales Channel: {serviceType.salesChannelId?.name || 'N/A'}</span>
            </li>
          </ul>
        </div>
        <div className="col-span-1 flex w-full flex-1 flex-col md:col-span-1 lg:col-span-2">
          <h2 className="flex items-center gap-2 pb-6 text-xl font-bold">
            <FiList className="text-primary" /> Requirements
          </h2>
          <Scrollable>
            {requirements.length > 0 ? (
              <TooltipComponent id="details" target=".e-info" position="RightCenter">
                <ListViewComponent
                  id="list"
                  dataSource={requirements}
                  sortOrder="Ascending"
                  width="100%"
                  height="100%"
                  template={listTemplate}
                  fields={fields}
                  cssClass="e-list-template"
                />
              </TooltipComponent>
            ) : (
              <p>No requirements specified.</p>
            )}
          </Scrollable>
        </div>
      </div>
      <BackAndContinue goBack={goBack} type="button" goContinue={handleSubmit} />
    </div>
  );
};

export default SummaryForm;
