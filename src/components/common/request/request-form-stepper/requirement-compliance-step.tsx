'use client';

import { FC, useEffect } from 'react';
import { useFindManyRequirement } from '@/services/api/hooks';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

export const requirementComplianceSchema = z.object({
  requirementCompliances: z.record(z.boolean().default(false)),
});

export type RequirementComplianceValues = z.infer<typeof requirementComplianceSchema>;

interface RequirementComplianceStepProps {
  requestCategoryIds: string[];
}

const RequirementComplianceStep: FC<RequirementComplianceStepProps> = ({ requestCategoryIds }) => {
  const { control, setValue, watch } = useFormContext<RequirementComplianceValues>();

  const { data, isLoading } = useFindManyRequirement({
    where: {
      requestCategoryRequirements: {
        every: { categoryId: { in: requestCategoryIds } },
      },
    },
  });

  const currentRequirements = watch('requirementCompliances', {});

  useEffect(() => {
    if (data && data.length > 0 && Object.keys(currentRequirements).length === 0) {
      const initialRequirements = data.reduce(
        (acc, req) => {
          acc[req.id] = false;
          return acc;
        },
        {} as Record<string, boolean>
      );
      setValue('requirementCompliances', initialRequirements);
    }
  }, [data, currentRequirements, setValue]);

  const handleSelectAll = () => {
    const allCompleted = Object.values(currentRequirements).every((v) => v);
    const updated = Object.keys(currentRequirements).reduce(
      (acc, key) => {
        acc[key] = !allCompleted;
        return acc;
      },
      {} as Record<string, boolean>
    );
    setValue('requirementCompliances', updated);
  };

  if (!data) return null;

  return (
    <div className="flex flex-col gap-4 flex-1 overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Requirements ({data.length})</h3>
        <Button variant="outline" size="sm" onClick={handleSelectAll} type="button" title={Object.values(currentRequirements).every((v) => v) ? 'Unselect All' : 'Select All'} disabled={isLoading}>
          {Object.values(currentRequirements).every((v) => v) ? 'Unselect All' : 'Select All'}
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2">
          {data.map((req) => (
            <FormField
              key={req.id}
              control={control}
              name={`requirementCompliances.${req.id}`}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4 border rounded-lg p-4">
                    <div className="flex-1">
                      <FormLabel htmlFor={`requirementCompliances.${req.id}`} className="font-medium">
                        {isLoading ? <Skeleton className="h-4 w-24" /> : req.name}
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">{isLoading ? <Skeleton className="h-3 w-48" /> : req.description}</p>
                    </div>
                    <FormControl>
                      <Checkbox id={`requirementCompliances.${req.id}`} checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RequirementComplianceStep;
