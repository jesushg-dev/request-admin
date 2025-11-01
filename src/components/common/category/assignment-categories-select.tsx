import React, { useEffect, useMemo } from 'react';
import { useFindManyAssignmentCategory } from '@/services/api/hooks';
import { useTranslations } from 'next-intl';
import { ControllerRenderProps, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { AssignmentLevelType } from '@/types/zenstackhq/hierarchy';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Select from '@/components/custom-ui/select';

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
  const { control, watch, setValue } = useFormContext<AssignmentCategorySelectArrayValues>();
  const watchedFields = watch('assignmentCategory', []);
  const lastSelectedIndex = watchedFields.findLastIndex((field) => !!field?.value);
  const activeLevel = lastSelectedIndex === -1 ? 0 : lastSelectedIndex + 1;

  const handleClearLevels = (startIndex: number) => {
    for (let i = startIndex; i < levels.length; i++) {
      setValue(`assignmentCategory.${i}`, { label: '', value: '', position: levels[i].position });
    }
  };

  return (
    <>
      {levels.map((level) => {
        const currentPosition = level.position - 1;
        const isLevelEnabled = !!areaId && currentPosition <= activeLevel;

        return (
          <FormField
            key={`${level.id}-${currentPosition}`}
            control={control}
            name={`assignmentCategory.${currentPosition}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{level.name}</FormLabel>
                <SingleAssignmentCategorySelect
                  field={field}
                  hierarchyLevelId={level.id}
                  hierarchyLevelName={level.name}
                  parentCategoryId={currentPosition > 0 ? watchedFields[currentPosition - 1]?.value : ''}
                  enabled={isLevelEnabled && !isDisabled}
                  position={currentPosition}
                  areaId={areaId}
                  onClearNextLevels={() => handleClearLevels(currentPosition + 1)}
                  menuPortalTarget={menuPortalTarget}
                />
                <FormMessage />
              </FormItem>
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
  hierarchyLevelName: string;
  parentCategoryId?: string;
  onClearNextLevels: () => void;
  field: ControllerRenderProps<AssignmentCategorySelectArrayValues, `assignmentCategory.${number}`>;
  menuPortalTarget?: HTMLElement;
  isDisabled?: boolean;
};

const SingleAssignmentCategorySelect: React.FC<SingleAssignmentCategorySelectProps> = ({
  field,
  hierarchyLevelId,
  hierarchyLevelName,
  parentCategoryId,
  enabled,
  position,
  onClearNextLevels,
  menuPortalTarget,
  isDisabled,
  areaId,
}) => {
  const t = useTranslations('admin.request.form.classificationStep');
  const where = useMemo(() => {
    const baseFilter = parentCategoryId ? { parentCategoryId } : { hierarchyLevelId };
    return areaId ? { ...baseFilter, areaId } : baseFilter;
  }, [parentCategoryId, hierarchyLevelId, areaId]);

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
    { enabled: enabled && !!areaId, staleTime: 60000 }
  );

  const options = useMemo(() => categories.map(({ id, name }) => ({ label: name, value: id })), [categories]);

  useEffect(() => {
    if (!enabled || !field.value?.value || isLoading) return;

    const exists = categories.some((c) => c.id === field.value.value);
    if (!exists) {
      field.onChange({ label: '', value: '', position });
      onClearNextLevels();
    }
  }, [categories, enabled, onClearNextLevels, position, field, isLoading]);

  return (
    <>
      <FormControl>
        <Select
          dataTestId={`select-${hierarchyLevelName.toLowerCase().replace(/\s+/g, '-')}`}
          isClearable
          isSearchable
          options={options}
          isLoading={isLoading}
          onChange={(option) => {
            const newValue = option ? { ...option, position } : { label: '', value: '', position };
            if (newValue.value !== field.value?.value) {
              field.onChange(newValue);
              onClearNextLevels();
            }
          }}
          value={field.value}
          menuShouldScrollIntoView={false}
          placeholder={t('assignmentCategory.selectPlaceholder')}
          isDisabled={!enabled || isDisabled}
          menuPortalTarget={menuPortalTarget}
        />
      </FormControl>
      <FormDescription>{isLoading ? t('common.loading') : t('assignmentCategory.selectDescription', { level: hierarchyLevelName.toLowerCase() })}</FormDescription>{' '}
    </>
  );
};
