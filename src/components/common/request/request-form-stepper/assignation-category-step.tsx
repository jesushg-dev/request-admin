'use client';

import { useMemo } from 'react';
import { useFindManyArea } from '@/services/api/hooks';
import { useFormContext } from 'react-hook-form';

import { AssignmentLevelType } from '@/types/prisma/hierarchy';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Select from '@/components/select/select';

import { AssignationCategoriesSelect } from '../../category/assignation-categories-select';

type AssignationCategoryStepProps = {
  levels: AssignmentLevelType[];
};

const AssignationCategoryStep: React.FC<AssignationCategoryStepProps> = ({ levels }) => {
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

      <AssignationCategoriesSelect levels={levels} fieldPrefix="assignationCategory" />
    </div>
  );
};

export default AssignationCategoryStep;
