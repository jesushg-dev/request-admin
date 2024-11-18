import React, { type FC } from 'react';

// Type imports
import type { CreateRequestAssigneeInputs } from '@/connections/request';

// Relative imports from external to more internal or specific components
import { ErrorList } from '@/components/Form';
import BackAndContinue from '@/components/common/BackAndContinue';
import { useCreateAssigneeForm } from '@/connections/request';

import AreaSelect from './AreaSelect';
import RequestTypeSelect from './RequestTypeSelect';
import CategorySelect from './CategorySelect';
import SubCategorySelect from './SubCategorySelect';

interface ISaleChannelSelectorProps {
  defaultValue?: CreateRequestAssigneeInputs | null;
  onChange: (value: CreateRequestAssigneeInputs) => void;
  goBack: () => void;
}

const AssigneeForm: FC<ISaleChannelSelectorProps> = ({ defaultValue, onChange, goBack }) => {
  const { control, handleSubmit, formState, resetField } = useCreateAssigneeForm(defaultValue);

  return (
    <form onSubmit={handleSubmit(onChange)} className="flex flex-1 flex-col justify-between gap-5 p-6">
      <h1 className="text-2xl font-semibold">Assignee Information</h1>
      <div className="grid grid-cols-1 gap-4 gap-y-2 text-sm md:grid-cols-2">
        <AreaSelect control={control} formState={formState} />
        <RequestTypeSelect control={control} formState={formState} resetField={resetField} />
        <CategorySelect control={control} formState={formState} resetField={resetField} />
        <SubCategorySelect control={control} formState={formState} resetField={resetField} />
      </div>
      <ErrorList formState={formState} />
      <BackAndContinue goBack={goBack} type="submit" />
    </form>
  );
};

export default AssigneeForm;
