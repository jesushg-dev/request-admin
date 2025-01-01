'use client';

import { CategoriesSelect, HierarchyWithRelations } from '../../category/categories-select';

type RequestCategoryStepProps = {
  requestCategoryLevels: HierarchyWithRelations['levels'];
};

const RequestCategoryStep: React.FC<RequestCategoryStepProps> = ({ requestCategoryLevels }) => {
  return (
    <div className="m-1 flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Request Category</h2>
      <CategoriesSelect hierarchyLevels={requestCategoryLevels} fieldPrefix="categories.requestCategory" />
    </div>
  );
};

export default RequestCategoryStep;
