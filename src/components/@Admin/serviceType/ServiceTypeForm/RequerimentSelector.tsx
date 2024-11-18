'use client';

import React, { type FC, useEffect, useState } from 'react';

import { clone } from 'remeda';
import { GridComponent, ColumnsDirective, ColumnDirective, Page, RowDD, Inject, type RowDragEventArgs } from '@syncfusion/ej2-react-grids';

import BackAndContinue from '@/components/common/BackAndContinue';
import type { UpdateRequirementInputs as RequirementInputs } from '@/connections/requirement';

const rowDropSettings = { targetID: 'DestGrid' };
const rowDropSettings2 = { targetID: 'Grid' };

interface CreateRequerimentSelectorProps {
  goBack: () => void;
  defaultValues?: RequirementInputs[];
  submitForm: (data: RequirementInputs[]) => void;
  requirementsData: RequirementInputs[] | undefined;
}

const RequerimentSelector: FC<CreateRequerimentSelectorProps> = ({ goBack, submitForm, defaultValues, requirementsData }) => {
  let sourceData: RequirementInputs[] =
    clone(requirementsData?.filter((requirement) => !defaultValues?.some((defVal) => defVal.requirementId === requirement.requirementId))) || [];
  let destinationData: RequirementInputs[] = clone(defaultValues) || [];

  const handleGoBack = () => {
    sourceData = clone(requirementsData?.filter((requirement) => !defaultValues?.some((defVal) => defVal.requirementId === requirement.requirementId))) || [];
    destinationData = clone(defaultValues) || [];
    goBack();
  };

  const handleSubmitForm = () => {
    submitForm(destinationData);
  };

  return (
    <div className="flex flex-1 flex-col gap-2 p-6">
      <div className="grid flex-1 grid-cols-2 gap-6">
        <div className="h-full w-full">
          <GridComponent
            id="Grid"
            allowPaging={true}
            dataSource={sourceData}
            pageSettings={{ pageCount: 1 }}
            allowRowDragAndDrop={true}
            rowDropSettings={rowDropSettings}
            selectionSettings={{ type: 'Multiple' }}
            height="100%">
            <ColumnsDirective>
              <ColumnDirective field="name" headerText="Name (Source)" width="100%" textAlign="Left" />
            </ColumnsDirective>
            <Inject services={[Page, RowDD]} />
          </GridComponent>
        </div>
        <div className="h-full w-full">
          <GridComponent
            id="DestGrid"
            allowPaging={true}
            allowRowDragAndDrop={true}
            pageSettings={{ pageCount: 2 }}
            dataSource={destinationData}
            selectionSettings={{ type: 'Multiple' }}
            rowDropSettings={rowDropSettings2}
            height="100%">
            <ColumnsDirective>
              <ColumnDirective field="name" headerText="Name (Destination)" width="100%" textAlign="Left" />
            </ColumnsDirective>
            <Inject services={[Page, RowDD]} />
          </GridComponent>
        </div>
      </div>
      <BackAndContinue goBack={handleGoBack} type="button" goContinue={handleSubmitForm} />
    </div>
  );
};

export default RequerimentSelector;
