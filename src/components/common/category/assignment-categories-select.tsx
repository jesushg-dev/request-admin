import React, { useEffect, useMemo, useTransition } from 'react';
import { useFindManyAssignmentCategory } from '@/services/api/hooks';
import { useTranslations } from 'next-intl';
import { ControllerRenderProps, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { AssignmentLevelType } from '@/types/zenstackhq/hierarchy';
import { FormControl, FormField, FormMessage } from '@/components/ui/form';
import { CombinedCategoriesValues } from '@/components/common/request/request-form-stepper/classification-step';
import Select from '@/components/custom-ui/select';
import { FormItem } from '@/components/shared/form-root';

import { useCategoryLoading } from './category-loading-context';

// Zod schemas
export const assignmentCategorySelectSchema = z.object({
  label: z.string(),
  value: z.string().nonempty('This field is required.'),
  position: z.number(),
});

export const assignmentCategorySelectArraySchema = z.object({
  assignmentCategory: z.array(assignmentCategorySelectSchema),
});

export type AssignmentCategorySelectArrayValues = z.infer<typeof assignmentCategorySelectArraySchema>;

type AssignmentCategoriesSelectProps = {
  levels: AssignmentLevelType[];
  areaId?: string;
  isDisabled?: boolean;
  menuPortalTarget?: HTMLElement;
};

export const AssignmentCategoriesSelect: React.FC<AssignmentCategoriesSelectProps> = ({ levels, areaId, isDisabled, menuPortalTarget }) => {
  const t = useTranslations('admin.request.form.classificationStep');
  const { control, watch, setValue } = useFormContext<CombinedCategoriesValues>();
  const watchedFields = watch('assignmentCategory', []) || [];
  const [isPending, startTransition] = useTransition();
  const { reset: resetLoading } = useCategoryLoading();

  // Reset loading state when levels or areaId change
  useEffect(() => {
    resetLoading();
  }, [levels, areaId, resetLoading]);

  // Calculate which levels should be enabled
  // Enable all levels up to the last one that has a value, plus the next one
  const lastSelectedPosition =
    levels.length > 0
      ? levels.findLastIndex((level) => {
          const arrayIndex = level.position - 1;
          return !!watchedFields[arrayIndex]?.value;
        })
      : -1;
  const activeLevelIndex = lastSelectedPosition === -1 ? 0 : lastSelectedPosition + 1;

  // Clear fields that are no longer represented by the available levels
  useEffect(() => {
    if (levels.length === 0) return;
    const allowedPositions = new Set<number>([0, ...levels.map((level) => level.position - 1)]);
    for (let i = 0; i < watchedFields.length; i++) {
      if (!allowedPositions.has(i)) {
        setValue(`assignmentCategory.${i}`, { label: '', value: '', position: i });
      }
    }
  }, [levels, watchedFields.length, setValue]);

  const handleClearLevels = (startIndex: number) => {
    startTransition(() => {
      for (let i = startIndex; i < watchedFields.length; i++) {
        setValue(`assignmentCategory.${i}`, { label: '', value: '', position: i });
      }
    });
  };

  return (
    <>
      {levels.map((level, levelIndex) => {
        const currentPosition = level.position - 1;
        // Enable the level if it's within the active levels OR if it has a default value
        const hasDefaultValue = !!watchedFields[currentPosition]?.value;
        const isLevelEnabled = !!areaId && (levelIndex <= activeLevelIndex || hasDefaultValue);

        return (
          <FormField
            key={`${level.id}-${currentPosition}`}
            control={control}
            name={`assignmentCategory.${currentPosition}`}
            render={({ field }) => (
              <>
                <FormItem label={level.name} description={t('assignmentCategory.selectDescription', { level: level.name.toLowerCase() })}>
                  <SingleAssignmentCategorySelect
                    field={field}
                    hierarchyLevelId={level.id}
                    parentCategoryId={currentPosition > 0 ? watchedFields[currentPosition - 1]?.value : ''}
                    enabled={isLevelEnabled && !isDisabled}
                    position={currentPosition}
                    areaId={areaId}
                    onClearNextLevels={() => handleClearLevels(currentPosition + 1)}
                    menuPortalTarget={menuPortalTarget}
                    isTransitioning={isPending}
                  />
                </FormItem>
                <FormMessage />
              </>
            )}
          />
        );
      })}
    </>
  );
};

type SingleAssignmentCategorySelectProps = {
  areaId?: string;
  enabled: boolean;
  position: number;
  hierarchyLevelId: string;
  parentCategoryId?: string;
  onClearNextLevels: () => void;
  field: ControllerRenderProps<CombinedCategoriesValues, `assignmentCategory.${number}`>;
  menuPortalTarget?: HTMLElement;
  isDisabled?: boolean;
  isTransitioning?: boolean;
};

const SingleAssignmentCategorySelect: React.FC<SingleAssignmentCategorySelectProps> = ({
  field,
  hierarchyLevelId,
  parentCategoryId,
  enabled,
  position,
  onClearNextLevels,
  menuPortalTarget,
  isDisabled,
  areaId,
  isTransitioning,
}) => {
  const t = useTranslations('admin.request.form.classificationStep');
  const { setLevelLoading, isPreviousLevelReady } = useCategoryLoading();

  const where = useMemo(() => {
    const baseFilter = parentCategoryId ? { parentCategoryId } : { hierarchyLevelId };
    return areaId ? { ...baseFilter, areaId, isActive: true } : { ...baseFilter, isActive: true };
  }, [parentCategoryId, hierarchyLevelId, areaId]);

  const hasValue = !!field.value?.value;
  // Always wait for previous level to finish loading, even with default values
  // This ensures parentCategoryId is available and correct
  const previousReady = isPreviousLevelReady(position);
  const shouldFetchData = (enabled || hasValue) && !!areaId && previousReady;

  const { data: categories = [], isLoading } = useFindManyAssignmentCategory(
    {
      select: {
        id: true,
        name: true,
        area: { select: { id: true, name: true } },
        hierarchyLevel: { select: { id: true, name: true } },
        _count: { select: { subcategories: true } },
      },
      where,
    },
    { enabled: shouldFetchData, staleTime: 60000 }
  );

  // Update loading state
  // If query is disabled, mark as not loading immediately
  // Otherwise, update based on actual loading state
  useEffect(() => {
    if (!shouldFetchData) {
      // Query is disabled, mark as ready immediately
      setLevelLoading(position, false);
    } else {
      // Query is enabled, update based on actual loading state
      setLevelLoading(position, isLoading);
    }
  }, [position, isLoading, setLevelLoading, shouldFetchData]);

  const options = useMemo(() => categories.map(({ id, name }) => ({ label: name, value: id })), [categories]);

  // Validate default value exists in options once loaded
  useEffect(() => {
    if (!hasValue || isLoading || categories.length === 0) return;

    const exists = categories.some((c) => c.id === field.value?.value);
    if (!exists) {
      field.onChange({ label: '', value: '', position });
      onClearNextLevels();
    }
  }, [categories, hasValue, onClearNextLevels, position, field, isLoading]);

  return (
    <FormControl>
      <Select
        isClearable
        isSearchable
        options={options}
        isLoading={isLoading || isTransitioning}
        onChange={(option) => {
          const newValue = option ? { ...option, position } : { label: '', value: '', position };
          if (newValue.value !== field.value?.value) {
            field.onChange(newValue);
            // Use setTimeout to defer the clear operation to avoid state updates during render
            setTimeout(() => {
              onClearNextLevels();
            }, 0);
          }
        }}
        value={field.value}
        menuShouldScrollIntoView={false}
        placeholder={t('assignmentCategory.selectPlaceholder')}
        isDisabled={!enabled || isDisabled}
        menuPortalTarget={menuPortalTarget}
      />
    </FormControl>
  );
};
