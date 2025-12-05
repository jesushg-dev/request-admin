'use client';

import React, { FC, useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useFindManyArea, useFindManyAssignmentCategory, useFindManyRequestCategory } from '@/services/api/hooks';
import { Rotate3DIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsBoolean, useQueryState } from 'nuqs';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { AssignmentHierarchyDefaultArgs, AssignmentLevelType, RequestHierarchyDefaultArgs, RequestLevelType } from '@/types/zenstackhq/hierarchy';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertBanner } from '@/components/custom-ui/alert-banner';
import Select from '@/components/custom-ui/select';
import { FormItem } from '@/components/shared/form-root';

import { AssignmentCategoriesSelect, assignmentCategorySelectSchema } from '../../category/assignment-categories-select';
import { CategoryLoadingProvider } from '../../category/category-loading-context';
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

interface CategoryFieldsProps {
  menuPortalTarget?: HTMLElement;
}

export const RequestCategoryFields: FC<CategoryFieldsProps> = ({ menuPortalTarget }) => {
  const t = useTranslations('admin.request.form.classificationStep');
  const { control, watch, getValues, setValue, resetField, unregister } = useFormContext<CombinedCategoriesValues>();
  const [requestLevelTypes, setRequestLevelTypes] = useState<RequestLevelType[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isHierarchyLoading, setIsHierarchyLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const firstRequestCategory = watch('requestCategory.0');

  const { data: requestCategories = [], isLoading: isRequestCategoriesLoading } = useFindManyRequestCategory({
    select: {
      id: true,
      name: true,
      description: true,
      hierarchy: { ...RequestHierarchyDefaultArgs },
    },
    where: { parentCategoryId: null },
  });

  const requestCategoryOptions = useMemo(() => requestCategories.map(({ id, name }) => ({ label: name, value: id })), [requestCategories]);

  const requestSubLevels = useMemo(() => requestLevelTypes.filter((level) => level.position !== 1), [requestLevelTypes]);

  // Clean up fields that are beyond the current hierarchy levels
  useEffect(() => {
    if (isHierarchyLoading || !isInitialized) return;

    // Use setTimeout to ensure components are unmounted
    const timeoutId = setTimeout(() => {
      const currentValues = getValues('requestCategory') ?? [];
      // Calculate max allowed index based on all levels in the hierarchy
      const maxAllowedIndex = requestLevelTypes.length > 0 ? Math.max(...requestLevelTypes.map((level) => level.position - 1)) : 0;

      // Instead of leaving null values, update the array to only include valid indices
      if (currentValues.length > maxAllowedIndex + 1) {
        const validValues = currentValues.slice(0, maxAllowedIndex + 1);
        setValue('requestCategory', validValues, { shouldDirty: false, shouldTouch: false, shouldValidate: false });

        // Unregister fields beyond the valid range
        for (let index = maxAllowedIndex + 1; index < currentValues.length; index++) {
          const fieldPath = `requestCategory.${index}` as const;
          unregister(fieldPath, { keepDefaultValue: false, keepError: false, keepDirty: false, keepTouched: false, keepIsValid: false });
        }
      }
    }, 100); // Increased delay to ensure react-select cleanup

    return () => clearTimeout(timeoutId);
  }, [requestLevelTypes, isHierarchyLoading, isInitialized, getValues, setValue, unregister]);

  const clearNestedRequestCategories = useCallback(() => {
    const currentValues = getValues('requestCategory') ?? [];
    if (currentValues.length > 1) {
      // Keep only the first element (index 0) and remove all others
      const firstValue = currentValues[0] || { label: '', value: '', position: 0 };
      setValue('requestCategory', [firstValue], { shouldDirty: false, shouldTouch: false, shouldValidate: false });

      // Unregister all fields beyond index 0
      for (let index = 1; index < currentValues.length; index++) {
        const fieldPath = `requestCategory.${index}` as const;
        unregister(fieldPath, { keepDefaultValue: false, keepError: false, keepDirty: false, keepTouched: false, keepIsValid: false });
      }
    }
  }, [getValues, setValue, unregister]);

  // Initialize levels from default values on mount or when categories load
  useEffect(() => {
    if (!firstRequestCategory?.value || requestCategories.length === 0) {
      // Reset levels when first category is cleared or categories not loaded yet
      if (requestLevelTypes.length > 0 && !firstRequestCategory?.value) {
        startTransition(() => {
          setRequestLevelTypes([]);
          setIsHierarchyLoading(false);
        });
        // Clean up nested fields after unmounting
        clearNestedRequestCategories();
        setIsInitialized(false);
      }
      return;
    }

    const category = requestCategories.find((c) => c.id === firstRequestCategory.value);
    if (category?.hierarchy?.levels && category.hierarchy.levels.length > 0) {
      // Only update if levels are different to avoid unnecessary re-renders
      const currentLevelIds = requestLevelTypes.map((l) => l.id).join(',');
      const newLevelIds = category.hierarchy.levels.map((l) => l.id).join(',');
      if (currentLevelIds !== newLevelIds) {
        const wasInitialized = isInitialized;
        startTransition(() => {
          setRequestLevelTypes(category.hierarchy.levels);
          setIsHierarchyLoading(false);
        });
        setIsInitialized(true);
        // Only clean up if we're changing categories, not on initial load
        if (wasInitialized && requestLevelTypes.length > 0) {
          setTimeout(() => {
            clearNestedRequestCategories();
          }, 0);
        }
      } else if (isHierarchyLoading) {
        setIsHierarchyLoading(false);
        setIsInitialized(true);
        // Only clean up if we're changing categories, not on initial load
        if (isInitialized && requestLevelTypes.length > 0) {
          clearNestedRequestCategories();
        }
      } else if (!isInitialized) {
        setIsInitialized(true);
      }
    } else if (isHierarchyLoading) {
      setIsHierarchyLoading(false);
      if (requestLevelTypes.length > 0) {
        clearNestedRequestCategories();
      }
    }
  }, [firstRequestCategory?.value, requestCategories, isHierarchyLoading, requestLevelTypes, clearNestedRequestCategories, isInitialized]);

  return (
    <>
      <FormField
        control={control}
        name="requestCategory.0"
        render={({ field }) => (
          <FormItem
            label={requestLevelTypes[0]?.name || t('requestCategory.defaultLabel')}
            description={requestLevelTypes[0]?.name ? t('requestCategory.dynamicDescription', { category: requestLevelTypes[0].name }) : t('requestCategory.defaultDescription')}>
            <Select
              isLoading={isRequestCategoriesLoading || isPending}
              isSearchable
              isClearable
              placeholder={t('requestCategory.selectPlaceholder')}
              options={requestCategoryOptions}
              onChange={(e) => {
                startTransition(() => {
                  setIsHierarchyLoading(true);
                });
                // Clear nested fields before changing
                clearNestedRequestCategories();
                field.onChange(e ? { ...e, position: 0 } : { label: '', value: '', position: 0 });
              }}
              value={field.value}
              menuPortalTarget={menuPortalTarget}
              dataTestId={`select-${requestLevelTypes[0]?.name?.toLowerCase().replace(/\s+/g, '-')}`}
            />
          </FormItem>
        )}
      />
      {isHierarchyLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <CategoryLoadingProvider>
          <RequestCategoriesSelect levels={requestSubLevels} />
        </CategoryLoadingProvider>
      )}
    </>
  );
};

export const AssignmentCategoryFields: FC<CategoryFieldsProps> = ({ menuPortalTarget }) => {
  const t = useTranslations('admin.request.form.classificationStep');
  const { control, watch, getValues, setValue, resetField, unregister } = useFormContext<CombinedCategoriesValues>();
  const [assignmentLevelTypes, setAssignmentLevelTypes] = useState<AssignmentLevelType[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isHierarchyLoading, setIsHierarchyLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const areaId = watch('areaId.value');
  const firstAssignmentCategory = watch('assignmentCategory.0');

  const { data: areas = [], isLoading } = useFindManyArea({
    select: { id: true, name: true, description: true },
  });

  const areaOptions = useMemo(() => areas.map((a) => ({ label: a.name, value: a.id })), [areas]);

  const { data: assignmentCategories = [], isLoading: isAssignmentCategoriesLoading } = useFindManyAssignmentCategory(
    {
      select: {
        id: true,
        name: true,
        description: true,
        hierarchy: { ...AssignmentHierarchyDefaultArgs },
      },
      where: { parentCategoryId: null, areaId },
    },
    { enabled: !!areaId }
  );

  const assignmentCategoryOptions = useMemo(() => assignmentCategories.map(({ id, name }) => ({ label: name, value: id })), [assignmentCategories]);
  const assignmentSubLevels = useMemo(() => assignmentLevelTypes.filter((level) => level.position !== 1), [assignmentLevelTypes]);

  // Clean up fields that are beyond the current hierarchy levels
  useEffect(() => {
    if (isHierarchyLoading || !isInitialized) return;

    // Use setTimeout to ensure components are unmounted
    const timeoutId = setTimeout(() => {
      const currentValues = getValues('assignmentCategory') ?? [];
      // Calculate max allowed index based on all levels in the hierarchy
      const maxAllowedIndex = assignmentLevelTypes.length > 0 ? Math.max(...assignmentLevelTypes.map((level) => level.position - 1)) : 0;

      // Instead of leaving null values, update the array to only include valid indices
      if (currentValues.length > maxAllowedIndex + 1) {
        const validValues = currentValues.slice(0, maxAllowedIndex + 1);
        setValue('assignmentCategory', validValues, { shouldDirty: false, shouldTouch: false, shouldValidate: false });

        // Unregister fields beyond the valid range
        for (let index = maxAllowedIndex + 1; index < currentValues.length; index++) {
          const fieldPath = `assignmentCategory.${index}` as const;
          unregister(fieldPath, { keepDefaultValue: false, keepError: false, keepDirty: false, keepTouched: false, keepIsValid: false });
        }
      }
    }, 100); // Increased delay to ensure react-select cleanup

    return () => clearTimeout(timeoutId);
  }, [assignmentLevelTypes, isHierarchyLoading, isInitialized, getValues, setValue, unregister]);

  const clearNestedAssignmentCategories = useCallback(() => {
    const currentValues = getValues('assignmentCategory') ?? [];
    if (currentValues.length > 1) {
      // Keep only the first element (index 0) and remove all others
      const firstValue = currentValues[0] || { label: '', value: '', position: 0 };
      setValue('assignmentCategory', [firstValue], { shouldDirty: false, shouldTouch: false, shouldValidate: false });

      // Unregister all fields beyond index 0
      for (let index = 1; index < currentValues.length; index++) {
        const fieldPath = `assignmentCategory.${index}` as const;
        unregister(fieldPath, { keepDefaultValue: false, keepError: false, keepDirty: false, keepTouched: false, keepIsValid: false });
      }
    }
  }, [getValues, setValue, unregister]);

  // Initialize levels from default values or reset when cleared/changed
  useEffect(() => {
    // Reset levels when area changes or first category is cleared
    if (!areaId || !firstAssignmentCategory?.value || assignmentCategories.length === 0) {
      if (assignmentLevelTypes.length > 0 && (!areaId || !firstAssignmentCategory?.value)) {
        startTransition(() => {
          setAssignmentLevelTypes([]);
          setIsHierarchyLoading(false);
        });
        // Clean up nested fields after unmounting
        clearNestedAssignmentCategories();
        setIsInitialized(false);
      }
      return;
    }

    const category = assignmentCategories.find((c) => c.id === firstAssignmentCategory.value);
    if (category?.hierarchy?.levels && category.hierarchy.levels.length > 0) {
      // Only update if levels are different to avoid unnecessary re-renders
      const currentLevelIds = assignmentLevelTypes.map((l) => l.id).join(',');
      const newLevelIds = category.hierarchy.levels.map((l) => l.id).join(',');
      if (currentLevelIds !== newLevelIds) {
        const wasInitialized = isInitialized;
        startTransition(() => {
          setAssignmentLevelTypes(category.hierarchy.levels);
          setIsHierarchyLoading(false);
        });
        setIsInitialized(true);
        // Only clean up if we're changing categories, not on initial load
        if (wasInitialized && assignmentLevelTypes.length > 0) {
          setTimeout(() => {
            clearNestedAssignmentCategories();
          }, 0);
        }
      } else if (isHierarchyLoading) {
        setIsHierarchyLoading(false);
        setIsInitialized(true);
        // Only clean up if we're changing categories, not on initial load
        if (isInitialized && assignmentLevelTypes.length > 0) {
          clearNestedAssignmentCategories();
        }
      } else if (!isInitialized) {
        setIsInitialized(true);
      }
    } else {
      // Category not found in current area, reset levels
      if (assignmentLevelTypes.length > 0) {
        startTransition(() => {
          setAssignmentLevelTypes([]);
          setIsHierarchyLoading(false);
        });
        clearNestedAssignmentCategories();
      } else if (isHierarchyLoading) {
        setIsHierarchyLoading(false);
      }
    }
  }, [firstAssignmentCategory?.value, assignmentCategories, areaId, assignmentLevelTypes, isHierarchyLoading, clearNestedAssignmentCategories, isInitialized]);

  return (
    <>
      <FormField
        control={control}
        name="areaId"
        render={({ field }) => (
          <FormItem label={t('assignmentCategory.areaLabel')} description={t('assignmentCategory.areaDescription')}>
            <Select
              isLoading={isLoading}
              placeholder={t('assignmentCategory.areaPlaceholder')}
              isSearchable
              isClearable
              options={areaOptions}
              onChange={(option) => {
                startTransition(() => {
                  setAssignmentLevelTypes([]);
                  setIsHierarchyLoading(!!option);
                });
                // Clear nested fields before changing
                clearNestedAssignmentCategories();
                field.onChange(option ?? { label: '', value: '' });
              }}
              value={field.value}
              menuPortalTarget={menuPortalTarget}
              dataTestId="select-area"
            />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="assignmentCategory.0"
        render={({ field }) => (
          <FormItem
            label={assignmentLevelTypes[0]?.name || t('assignmentCategory.defaultLabel')}
            description={assignmentLevelTypes[0]?.name ? t('assignmentCategory.dynamicDescription', { category: assignmentLevelTypes[0].name }) : t('assignmentCategory.defaultDescription')}>
            <Select
              isLoading={isAssignmentCategoriesLoading || isPending}
              isSearchable
              isClearable
              options={assignmentCategoryOptions}
              onChange={(e) => {
                startTransition(() => {
                  setIsHierarchyLoading(true);
                });
                // Clear nested fields before changing
                clearNestedAssignmentCategories();
                field.onChange(e ? { ...e, position: 0 } : { label: '', value: '', position: 0 });
              }}
              value={field.value}
              isDisabled={!areaId}
              placeholder={areaId ? t('assignmentCategory.selectPlaceholder') : t('assignmentCategory.areaFirstPlaceholder')}
              menuPortalTarget={menuPortalTarget}
              dataTestId="select-assignment-category"
            />
          </FormItem>
        )}
      />
      {isHierarchyLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <CategoryLoadingProvider>
          <AssignmentCategoriesSelect levels={assignmentSubLevels} areaId={areaId} menuPortalTarget={menuPortalTarget} />
        </CategoryLoadingProvider>
      )}
    </>
  );
};

const ClassificationStep: FC = ({}) => {
  const t = useTranslations('admin.request.form.classificationStep');
  const [isReassigning] = useQueryState('reassign', parseAsBoolean.withDefault(false));

  return (
    <>
      {isReassigning && <AlertBanner variant="warning" title={t('reassign.alertTitle')} description={t('reassign.alertDescription')} icon={<Rotate3DIcon className="h-5 w-5" />} />}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 flex-1 pr-2">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{t('requestCategory.title')}</CardTitle>
              <CardDescription>{t('requestCategory.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                <RequestCategoryFields />
              </div>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>{t('assignmentCategory.title')}</CardTitle>
              <CardDescription>{t('assignmentCategory.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                <AssignmentCategoryFields />
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </>
  );
};

export default ClassificationStep;
