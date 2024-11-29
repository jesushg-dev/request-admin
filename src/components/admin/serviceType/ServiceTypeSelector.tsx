'use client';

import React from 'react';
import type { FC } from 'react';
import type { RouterOutputs } from '@/server/server';
import { triggerError } from '@/utils/tools/message';
import { ColumnDirective, ColumnsDirective, GridComponent, Inject, Page, Search, Toolbar } from '@syncfusion/ej2-react-grids';
import { MdBusiness } from 'react-icons/md';
import Skeleton from 'react-loading-skeleton';

import useSelection from '@/hooks/useSelection';
import BackAndContinue from '@/components/common/back-and-continue';

type ServiceTypeType = RouterOutputs['serviceType']['getBySalesChannelId'][number];

interface IServiceTypeSelectorProps {
  loading: boolean;
  services: ServiceTypeType[];
  defaultValue?: ServiceTypeType;
  onChange: (selectedService: ServiceTypeType) => void;
  goBack: () => void;
}

const pageSize = 5;

const idExtractor = (service: ServiceTypeType) => service.serviceTypeId;

const ServiceTypeSelector: FC<IServiceTypeSelectorProps> = ({ onChange, goBack, defaultValue, services, loading }) => {
  let grid: GridComponent | null = null;

  const { isInitialised, initialRowIndex, initialPageIndex } = useSelection(services, { defaultValue, pageSize, idExtractor });

  const onSubmit = async () => {
    const selected = grid?.getSelectedRecords();
    if (selected && selected.length > 0) {
      onChange(selected[0] as ServiceTypeType);
    } else {
      await triggerError('Please select a service type');
    }
  };

  if (loading) {
    return <Skeleton count={5} />;
  }

  if (services.length === 0) {
    return (
      <div className="flex flex-1 flex-col justify-between gap-5 p-6">
        <p>No services found</p>
        <BackAndContinue goBack={goBack} type="submit" />
      </div>
    );
  }

  if (!isInitialised) {
    return (
      <div className="flex flex-1 flex-col justify-between gap-5 p-6">
        <p>Checking some adjustments</p>
        <BackAndContinue goBack={goBack} type="submit" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col justify-between gap-5 p-6">
      <GridComponent
        dataSource={services}
        ref={(g) => {
          grid = g;
        }}
        allowPaging={true}
        toolbar={toolbarOptions}
        searchSettings={searchOptions}
        selectedRowIndex={initialRowIndex}
        pageSettings={{ currentPage: initialPageIndex, pageSize }}
        selectionSettings={selectionSettings as any}>
        <ColumnsDirective>
          <ColumnDirective headerText="Select a Service Type" width="100%" template={gridTemplate} textAlign="Center" />
          <ColumnDirective field="name" visible={false} width="100" textAlign="Left" />
          <ColumnDirective field="description" visible={false} width="100" />
        </ColumnsDirective>
        <Inject services={[Search, Toolbar, Page]} />
      </GridComponent>
      <BackAndContinue goBack={goBack} type="submit" goContinue={onSubmit} />
    </div>
  );
};

const gridTemplate = (props: ServiceTypeType) => {
  return (
    <div className="flex w-full flex-col items-start gap-1 py-1">
      <p className="text-sm font-semibold uppercase">{props.name}</p>
      <p className="flex items-center gap-2 text-sm text-gray-500">
        <MdBusiness />
        {props.description || 'No description'}
      </p>
    </div>
  );
};

const toolbarOptions = ['Search'];
const searchOptions = {
  fields: ['name', 'description'],
  ignoreRequest: true,
  operator: 'contains',
};
const selectionSettings = {
  mode: 'Both',
  allowColumnSelection: true,
  type: 'Multiple',
};

export default ServiceTypeSelector;
