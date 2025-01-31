'use client';

import React, { useMemo } from 'react';
import { useFindManyArea } from '@/services/api/hooks';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { AssignmentLevelType, RequestLevelType } from '@/types/prisma/hierarchy';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Select from '@/components/select/select';

import { AssignmentCategoriesSelect, assignmentCategorySelectSchema } from '../../category/assignment-categories-select';
import { RequestCategoriesSelect, requestCategorySelectSchema } from '../../category/request-categories-select';

export const combinedCategoriesSchema = z.object({
  areaId: z.object({ value: z.string(), label: z.string() }),
  requestCategory: z.array(requestCategorySelectSchema),
  assignmentCategory: z.array(assignmentCategorySelectSchema),
});

export type CombinedCategoriesType = z.infer<typeof combinedCategoriesSchema>;

interface AssignmentCategoryStepProps {
  requestLevelTypes: RequestLevelType[];
  assignmentLevelTypes: AssignmentLevelType[];
}

const AssignmentCategoryStep: React.FC<AssignmentCategoryStepProps> = ({ requestLevelTypes, assignmentLevelTypes }) => {
  const { control, watch } = useFormContext<CombinedCategoriesType>();

  const areaValue = watch('areaId');
  const areaId = areaValue?.value || '';

  const { data: areas = [], isLoading } = useFindManyArea({
    select: { id: true, name: true, description: true },
  });

  const areaOptions = useMemo(() => areas.map((a) => ({ label: a.name, value: a.id })), [areas]);

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Request Category</h2>
      <RequestCategoriesSelect levels={requestLevelTypes} />
      <h2 className="text-lg font-semibold">Assignment Category</h2>
      <FormField
        control={control}
        name="areaId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Area</FormLabel>
            <FormControl>
              <Select isLoading={isLoading} isSearchable isClearable options={areaOptions} onChange={field.onChange} value={field.value} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <AssignmentCategoriesSelect levels={assignmentLevelTypes} areaId={areaId} />
    </div>
  );
};

export default AssignmentCategoryStep;
