'use client';

import { useMemo } from 'react';
import { useFindManyArea } from '@/services/api/hooks';
import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Select from '@/components/select/select';

import { CategoriesSelect, HierarchyWithRelations } from '../../category/categories-select';

type AssignationCategoryStepProps = {
  assignationCategoryLevels: HierarchyWithRelations['levels'];
};
const AssignationCategoryStep: React.FC<AssignationCategoryStepProps> = ({ assignationCategoryLevels }) => {
  const { control } = useFormContext();

  const { data: categories = [], isLoading } = useFindManyArea({
    select: { id: true, name: true, description: true },
  });

  const options = useMemo(() => categories.map((category) => ({ label: category.name, value: category.id })), [categories]);

  return (
    <div className="m-1 flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Assignation Category</h2>
      <FormField
        control={control}
        name={'area'}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Area</FormLabel>
            <FormControl>
              <Select isLoading={isLoading} isSearchable isClearable options={options} onChange={field.onChange} value={field.value} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <CategoriesSelect hierarchyLevels={assignationCategoryLevels} fieldPrefix="assignationCategory" />
    </div>
  );
};

export default AssignationCategoryStep;
