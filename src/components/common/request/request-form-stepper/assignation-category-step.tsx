'use client';

import { CategoriesSelect, HierarchyWithRelations } from '../../category/categories-select';

type AssignationCategoryStepProps = {
  assignationCategoryLevels: HierarchyWithRelations['levels'];
};
const AssignationCategoryStep: React.FC<AssignationCategoryStepProps> = ({ assignationCategoryLevels }) => {
  return (
    <div className="m-1 flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Assignation Category</h2>
      <CategoriesSelect hierarchyLevels={assignationCategoryLevels} fieldPrefix="categories.assignationCategory" />
    </div>
  );
};

export default AssignationCategoryStep;
