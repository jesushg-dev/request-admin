'use client';

import { HierarchyWithRelations } from '../../category/categories-select';
import CombinedRequestFormStepper from './combined-request-form-stepper';
import SeparateRequestFormStepper from './separate-request-form-stepper';

type RequestFormStepperProps = {
  requestCategoryLevels: HierarchyWithRelations['levels'];
  assignationCategoryLevels: HierarchyWithRelations['levels'];
};

const RequestFormStepper: React.FC<RequestFormStepperProps> = ({ requestCategoryLevels, assignationCategoryLevels }) => {
  const shouldSeparateSteps = requestCategoryLevels.length + assignationCategoryLevels.length > 4;

  return shouldSeparateSteps ? (
    <SeparateRequestFormStepper requestCategoryLevels={requestCategoryLevels} assignationCategoryLevels={assignationCategoryLevels} />
  ) : (
    <CombinedRequestFormStepper requestCategoryLevels={requestCategoryLevels} assignationCategoryLevels={assignationCategoryLevels} />
  );
};

export default RequestFormStepper;
