'use client';

import React, { useMemo } from 'react';
import { useFindManyArea } from '@/services/api/hooks';
import { Rotate3DIcon } from 'lucide-react';
import { parseAsBoolean, useQueryState } from 'nuqs';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { AssignmentLevelType, RequestLevelType } from '@/types/prisma/hierarchy';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertBanner } from '@/components/custom-ui/alert-banner';
import Select from '@/components/custom-ui/select';

import { AssignmentCategoriesSelect, assignmentCategorySelectSchema } from '../../category/assignment-categories-select';
import { RequestCategoriesSelect, requestCategorySelectSchema } from '../../category/request-categories-select';

export const combinedCategoriesSchema = z.object({
  areaId: z.object({ value: z.string(), label: z.string() }),
  requestCategory: z.array(requestCategorySelectSchema),
  assignmentCategory: z.array(assignmentCategorySelectSchema),
});

export const getDefaultCombinedCategoriesValues = (): CombinedCategoriesValues => ({
  areaId: { value: '', label: '' },
  requestCategory: [],
  assignmentCategory: [],
});

export type CombinedCategoriesValues = z.infer<typeof combinedCategoriesSchema>;

interface CategoryStepProps {
  requestLevelTypes: RequestLevelType[];
  assignmentLevelTypes: AssignmentLevelType[];
}

const CategoryStep: React.FC<CategoryStepProps> = ({ requestLevelTypes, assignmentLevelTypes }) => {
  const [isReassigning] = useQueryState('reassign', parseAsBoolean.withDefault(false));

  const { control, watch } = useFormContext<CombinedCategoriesValues>();

  const areaValue = watch('areaId');
  const areaId = areaValue?.value || '';

  const { data: areas = [], isLoading } = useFindManyArea({
    select: { id: true, name: true, description: true },
  });

  const areaOptions = useMemo(() => areas.map((a) => ({ label: a.name, value: a.id })), [areas]);

  return (
    <>
      {isReassigning && (
        <AlertBanner
          variant="warning"
          title="Cambiar de área"
          description="Al cambiar el área, se mantendra el historial de la solicitud pero puede que debas volver a completar algunos campos requeridos en la nueva asignación."
          icon={<Rotate3DIcon className="h-5 w-5" />}
        />
      )}
      <ScrollArea className="flex-1">
        <div className="w-full flex flex-col gap-4 px-1">
          <h2 className="text-lg font-semibold">Request Category</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
            <RequestCategoriesSelect levels={requestLevelTypes} />
          </div>
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
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
            <AssignmentCategoriesSelect levels={assignmentLevelTypes} areaId={areaId} />
          </div>
        </div>
      </ScrollArea>
    </>
  );
};

export default CategoryStep;
