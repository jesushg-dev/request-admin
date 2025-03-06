import React, { useEffect, useMemo } from 'react';
import { useFindManyAssignmentCategory } from '@/services/api/hooks';
import { ControllerRenderProps, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { AssignmentLevelType } from '@/types/prisma/hierarchy';
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
};

export const AssignmentCategoriesSelect: React.FC<AssignmentCategoriesSelectProps> = ({ levels, areaId }) => {
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
      {levels.map((level, index) => {
        const isLevelEnabled = !!areaId && index <= activeLevel;

        return (
          <FormField
            key={`${level.id}-${index}`}
            control={control}
            name={`assignmentCategory.${index}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{level.name}</FormLabel>
                <SingleAssignmentCategorySelect
                  field={field}
                  hierarchyLevelId={level.id}
                  hierarchyLevelName={level.name}
                  parentCategoryId={index > 0 ? watchedFields[index - 1]?.value : ''}
                  enabled={isLevelEnabled}
                  position={level.position}
                  areaId={areaId}
                  onClearNextLevels={() => handleClearLevels(index + 1)}
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
};

const SingleAssignmentCategorySelect: React.FC<SingleAssignmentCategorySelectProps> = ({
  field,
  hierarchyLevelId,
  hierarchyLevelName,
  parentCategoryId,
  enabled,
  position,
  onClearNextLevels,
  areaId,
}) => {
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
          isClearable
          isSearchable
          options={options}
          isDisabled={!enabled}
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
        />
      </FormControl>
      <FormDescription>{isLoading ? 'Loading...' : `Select the ${hierarchyLevelName.toLowerCase()}`}</FormDescription>
    </>
  );
};
