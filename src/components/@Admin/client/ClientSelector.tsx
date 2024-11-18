'use client';

import React from 'react';
import type { FC } from 'react';

import Skeleton from 'react-loading-skeleton';
import { Inject, Search, Toolbar, Page } from '@syncfusion/ej2-react-grids';
import { ColumnDirective, ColumnsDirective, GridComponent } from '@syncfusion/ej2-react-grids';

import BackAndContinue from '@/components/common/BackAndContinue';
import useSelection from '@/hooks/useSelection';
import { triggerError } from '@/utils/tools/message';
import type { ClientType } from '@/utils/types';
import { MdEmail, MdPhone } from 'react-icons/md';

interface IClientSelectorProps {
  loading: boolean;
  clients: ClientType[];
  defaultValue?: ClientType | null;
  onChange: (selectedService: ClientType) => void;
  goBack: () => void;
}

const pageSize = 5;

const idExtractor = (client: ClientType) => client.clientId;

const ClientSelector: FC<IClientSelectorProps> = ({ onChange, goBack, defaultValue, clients, loading }) => {
  let grid: GridComponent | null = null;

  const { isInitialised, initialRowIndex, initialPageIndex } = useSelection(clients, { defaultValue, pageSize, idExtractor });

  const onSubmit = async () => {
    const selected = grid?.getSelectedRecords();
    if (selected && selected.length > 0) {
      onChange(selected[0] as ClientType);
    } else {
      await triggerError('Please select a client type');
    }
  };

  if (loading) {
    return <Skeleton count={5} />;
  }
  if (clients.length === 0) {
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
        dataSource={clients}
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
          <ColumnDirective headerText="Select a Client" width="100%" template={gridTemplate} textAlign="Center" />
          <ColumnDirective field="name" visible={false} width="100" textAlign="Left" />
          <ColumnDirective field="email" visible={false} width="100" />
          <ColumnDirective field="identificationNumber" visible={false} width="100" />
          <ColumnDirective field="phone" visible={false} width="100" />
          <ColumnDirective field="occupation" visible={false} width="100" />
        </ColumnsDirective>
        <Inject services={[Search, Toolbar, Page]} />
      </GridComponent>
      <BackAndContinue goBack={goBack} type="submit" goContinue={onSubmit} />
    </div>
  );
};

const gridTemplate = (props: ClientType) => {
  return (
    <div className="flex w-full flex-col items-start gap-1 py-1">
      <p className="text-sm font-semibold uppercase">{props.name}</p>
      <p className="flex items-center gap-2 text-sm text-gray-500">
        <MdEmail />
        {props.email || 'No description'} | <MdPhone /> {props.phone || 'No description'}
      </p>
    </div>
  );
};

const toolbarOptions = ['Search'];
const searchOptions = {
  fields: ['name', 'email', 'identificationNumber', 'phone', 'occupation'],
  ignoreCase: true,
  operator: 'contains',
};
const selectionSettings = {
  mode: 'Both',
  allowColumnSelection: true,
  type: 'Multiple',
};

export default ClientSelector;
