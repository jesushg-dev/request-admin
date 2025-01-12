'use client';

import { RequestLevelType } from '@/types/prisma/hierarchy';
import { StepScrollArea } from '@/components/stepper/step-scrollarea';

import { RequestCategoriesSelect } from '../../category/request-categories-select';

type RequestCategoryStepProps = {
  levels: RequestLevelType[];
};

const RequestCategoryStep: React.FC<RequestCategoryStepProps> = ({ levels }) => {
  return (
    <StepScrollArea>
      <div className="m-1 flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Request Category</h2>
        <RequestCategoriesSelect levels={levels} fieldPrefix="requestCategory" />
      </div>
    </StepScrollArea>
  );
};

export default RequestCategoryStep;
