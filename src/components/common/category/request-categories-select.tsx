import { useEffect, useMemo, useTransition, type FC } from 'react';
import { useFindManyRequestCategory } from '@/services/api/hooks';
import { useTranslations } from 'next-intl';
import { ControllerRenderProps, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { RequestLevelType } from '@/types/zenstackhq/hierarchy';
import { FormControl, FormField, FormMessage } from '@/components/ui/form';
import { FormItem } from '@/components/shared/form-root';
import Select from '@/components/custom-ui/select';
import { CombinedCategoriesValues } from '@/components/common/request/request-form-stepper/classification-step';
import { useCategoryLoading } from './category-loading-context';

export const requestCategorySelectSchema = z.object({
  label: z.string(),
  value: z.string().nonempty('This field is required.'),
  position: z.number(),
});

export type RequestCategorySelectFormValues = z.infer<typeof requestCategorySelectSchema>;

export const requestCategorySelectArraySchema = z.object({
  requestCategory: z.array(requestCategorySelectSchema),
});

export type RequestCategorySelectArrayValues = z.infer<typeof requestCategorySelectArraySchema>;

type RequestCategoriesSelectProps = {
  levels: RequestLevelType[];
  menuPortalTarget?: HTMLElement;
};

export const RequestCategoriesSelect: FC<RequestCategoriesSelectProps> = ({ levels, menuPortalTarget }) => {
  const t = useTranslations('admin.request.form.classificationStep');
  const { control, watch, setValue } = useFormContext<CombinedCategoriesValues>();
  const watchedFields = watch('requestCategory', []) || [];
  const [isPending, startTransition] = useTransition();
  const { reset: resetLoading } = useCategoryLoading();
  
  // Reset loading state when levels change
  useEffect(() => {
    resetLoading();
  }, [levels, resetLoading]);
  
  // Calculate which levels should be enabled
  // Enable all levels up to the last one that has a value, plus the next one
  const lastSelectedPosition = levels.length > 0
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
        setValue(`requestCategory.${i}`, { label: '', value: '', position: i });
      }
    }
  }, [levels, watchedFields.length, setValue]);

  const handleClearLevels = (startIndex: number) => {
    startTransition(() => {
      for (let i = startIndex; i < watchedFields.length; i++) {
        setValue(`requestCategory.${i}`, { label: '', value: '', position: i });
      }
    });
  };

  return (
    <>
      {levels.map((level, levelIndex) => {
        const currentPosition = level.position - 1;
        // Enable the level if it's within the active levels OR if it has a default value
        // Also check if previous level is ready
        const hasDefaultValue = !!watchedFields[currentPosition]?.value;
        const isLevelEnabled = (levelIndex <= activeLevelIndex || hasDefaultValue);
        return (
          <FormField
            key={`${level.id}-${currentPosition}`}
            control={control}
            name={`requestCategory.${currentPosition}`}
            render={({ field }) => (
              <>
                <FormItem 
                  label={level.name}
                  description={t('requestCategory.selectDescription', { level: level.name.toLowerCase() })}
                >
                  <SingleRequestCategorySelect
                    field={field}
                    position={currentPosition}
                    enabled={isLevelEnabled}
                    onClearNextLevels={() => handleClearLevels(currentPosition + 1)}
                    parentCategoryId={currentPosition > 0 ? watchedFields[currentPosition - 1]?.value : ''}
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

type SingleRequestCategorySelectProps = {
  enabled: boolean;
  position: number;
  parentCategoryId?: string;
  onClearNextLevels: () => void;
  menuPortalTarget?: HTMLElement;
  field: ControllerRenderProps<CombinedCategoriesValues, `requestCategory.${number}`>;
  isTransitioning?: boolean;
};

const SingleRequestCategorySelect: React.FC<SingleRequestCategorySelectProps> = ({ field, parentCategoryId, enabled, position, menuPortalTarget, onClearNextLevels, isTransitioning }) => {
  const t = useTranslations('admin.request.form.classificationStep');
  const { setLevelLoading, isPreviousLevelReady } = useCategoryLoading();
  
  const hasValue = !!field.value?.value;
  // Always wait for previous level to finish loading, even with default values
  // This ensures parentCategoryId is available and correct
  const previousReady = isPreviousLevelReady(position);
  const shouldFetchData = (enabled || hasValue) && previousReady;
  
  const { data: categories = [], isLoading } = useFindManyRequestCategory(
    {
      select: { id: true, name: true, description: true },
      where: { 
        parentCategoryId: parentCategoryId ?? null,
        isActive: true,
      },
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
    const currentValue = field.value.value;
    const exists = categories.some((c) => c.id === currentValue);
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
        placeholder={t('requestCategory.selectPlaceholder')}
        isDisabled={!enabled}
        menuPortalTarget={menuPortalTarget}
      />
    </FormControl>
  );
};
