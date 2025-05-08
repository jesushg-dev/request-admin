'use client';

import { FC, useEffect, useMemo, useState } from 'react';
import { useFindManyRequirement } from '@/services/api/hooks';
import { Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import Select, { OptionType } from '@/components/custom-ui/select';
import EmptyState from '@/components/shared/empty-state';

export const requirementComplianceSchema = z.object({
  requirementCompliances: z.record(z.boolean().default(false)),
});

export type RequirementComplianceValues = z.infer<typeof requirementComplianceSchema>;

export const getDefaultComplianceValues = (): RequirementComplianceValues => ({
  requirementCompliances: {},
});

const filterOptions = [
  { value: 'all', label: 'filterOptions.all' },
  { value: 'selected', label: 'filterOptions.selected' },
  { value: 'unselected', label: 'filterOptions.unselected' },
] as const;

interface RequirementComplianceStepProps {
  requestCategoryIds: string[];
}

const RequirementComplianceStep: FC<RequirementComplianceStepProps> = ({ requestCategoryIds }) => {
  const t = useTranslations('admin.request.form.requirementsStep');
  const { control, setValue, watch } = useFormContext<RequirementComplianceValues>();
  const [filter, setFilter] = useState<OptionType>(filterOptions[0]);
  const filterLocalizedOptions = useMemo(() => {
    const localized = filterOptions.map((option) => ({ ...option, label: t(option.label) }));
    setFilter(localized[0]);
    return localized;
  }, [t]);

  const { data: requirements, isLoading } = useFindManyRequirement({
    select: { id: true, name: true, description: true },
    where: {
      requestCategoryRequirements: {
        some: { categoryId: { in: requestCategoryIds } },
      },
    },
  });

  const currentRequirements = watch('requirementCompliances', {});
  const requirementIds = requirements?.map((req) => req.id) || [];

  // Calculate completion stats
  const completionStats = Object.values(currentRequirements).reduce(
    (acc, val) => {
      if (val) {
        acc.completed++;
      } else {
        acc.pending++;
      }
      return acc;
    },
    { completed: 0, pending: 0 }
  );
  const progress = requirementIds.length > 0 ? (completionStats.completed / requirementIds.length) * 100 : 0;

  // Initialize form values
  useEffect(() => {
    if (requirements?.length && Object.keys(currentRequirements).length === 0) {
      const initialValues = requirements.reduce(
        (acc, req) => {
          acc[req.id] = false;
          return acc;
        },
        {} as Record<string, boolean>
      );
      setValue('requirementCompliances', initialValues);
    }
  }, [requirements, currentRequirements, setValue]);

  const handleSelectAll = () => {
    const allSelected = Object.values(currentRequirements).every(Boolean);
    const newValues = requirementIds.reduce(
      (acc, id) => {
        acc[id] = !allSelected;
        return acc;
      },
      {} as Record<string, boolean>
    );
    setValue('requirementCompliances', newValues);
  };

  const filteredRequirements = requirements?.filter((req) => {
    if (filter.value === 'selected') return currentRequirements[req.id];
    if (filter.value === 'unselected') return !currentRequirements[req.id];
    return true;
  });

  if (isLoading) return <RequirementCompliancePlaceholder />;
  if (!requirements?.length) return <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />;

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div className="space-y-1">
            <CardTitle>
              {t('title', {
                completed: completionStats.completed,
                total: requirementIds.length,
              })}
            </CardTitle>
            <CardDescription className="flex gap-2 items-center">
              <span>{t('total', { total: requirementIds.length })}</span>
              <span className="text-primary">·</span>
              <span className="text-emerald-600">{t('completed', { completed: completionStats.completed })}</span>
              <span className="text-primary">·</span>
              <span className="text-amber-600">{t('pending', { pending: completionStats.pending })}</span>
            </CardDescription>
          </div>

          <div className="flex gap-2 items-center flex-shrink-0">
            <div className="w-40">
              <Select
                value={filter}
                isSearchable={false}
                options={filterLocalizedOptions}
                onChange={(newValue) => setFilter(newValue as (typeof filterOptions)[number])}
                components={{ DropdownIndicator: () => <Filter className="w-4 h-4" /> }}
              />
            </div>

            <Button type="button" onClick={handleSelectAll} variant="outline" size="sm">
              {Object.values(currentRequirements).every(Boolean) ? t('deselectAll') : t('selectAll')}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex-col flex overflow-hidden">
        <div className="mb-4 space-y-2">
          <Progress value={progress} />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('progress', { progress: progress.toFixed(1) })}</span>
            <span>{t('remaining', { pending: completionStats.pending })}</span>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-2 pr-2">
            {filteredRequirements?.map((req) => (
              <FormField
                key={req.id}
                control={control}
                name={`requirementCompliances.${req.id}`}
                render={({ field }) => (
                  <div className="group flex items-start space-x-3 p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow">
                    <Checkbox id={`requirement-${req.id}`} checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                    <div className="space-y-1 leading-none flex-1">
                      <label htmlFor={`requirement-${req.id}`} className="text-sm cursor-pointer flex flex-col">
                        <span className="font-semibold">{req.name}</span>
                        <span className="text-xs text-muted-foreground mt-1">{req.description}</span>
                      </label>
                    </div>
                  </div>
                )}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const RequirementCompliancePlaceholder = () => (
  <Card className="flex-1 flex flex-col">
    <CardHeader>
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-3/4 mt-2" />
    </CardHeader>
    <CardContent className="flex-1 flex flex-col">
      <Skeleton className="h-2 mb-4 w-full" />
      <div className="w-full grid grid-cols-1 gap-2">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="flex items-center space-x-2 p-4 border rounded-md">
            <Skeleton className="h-5 w-5 rounded-md" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default RequirementComplianceStep;
