'use client';

import React, { useMemo } from 'react';
import { useFindManyArea } from '@/services/api/hooks';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { AssignmentLevelType, RequestLevelType } from '@/types/prisma/hierarchy';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import Select from '@/components/select/select';

import { AssignmentCategoriesSelect, assignmentCategorySelectSchema } from '../../category/assignment-categories-select';
import { RequestCategoriesSelect, requestCategorySelectSchema } from '../../category/request-categories-select';

export const combinedCategoriesSchema = z.object({
  areaId: z.object({ value: z.string(), label: z.string() }),
  requestCategory: z.array(requestCategorySelectSchema),
  assignmentCategory: z.array(assignmentCategorySelectSchema),
});

export type CombinedCategoriesValues = z.infer<typeof combinedCategoriesSchema>;

interface CategoryStepProps {
  requestLevelTypes: RequestLevelType[];
  assignmentLevelTypes: AssignmentLevelType[];
}

const CategoryStep: React.FC<CategoryStepProps> = ({ requestLevelTypes, assignmentLevelTypes }) => {
  const { control, watch } = useFormContext<CombinedCategoriesValues>();

  const areaValue = watch('areaId');
  const areaId = areaValue?.value || '';

  const { data: areas = [], isLoading } = useFindManyArea({
    select: { id: true, name: true, description: true },
  });

  const areaOptions = useMemo(() => areas.map((a) => ({ label: a.name, value: a.id })), [areas]);

  return (
    <ScrollArea>
      <div className="w-full flex flex-col gap-4 px-1">
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
              <FormDescription>Select the area where the request is assigned.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <AssignmentCategoriesSelect levels={assignmentLevelTypes} areaId={areaId} />
      </div>
    </ScrollArea>
  );
};

export default CategoryStep;
