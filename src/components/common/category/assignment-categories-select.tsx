import React, { useEffect, useMemo } from 'react';
import { useFindManyAssignmentCategory } from '@/services/api/hooks';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { AssignmentLevelType } from '@/types/prisma/hierarchy';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Select from '@/components/select/select';

// Zod schema for a single selected category
export const assignmentCategorySelectSchema = z.object({
  label: z.string(),
  value: z.string().nonempty('This field is required.'),
  position: z.number(),
});

export type AssignmentCategoryFormValues = z.infer<typeof assignmentCategorySelectSchema>;

type AssignmentCategoriesSelectProps = {
  levels: AssignmentLevelType[];
  areaId?: string; // The ID from the "Area" dropdown
};

export const AssignmentCategoriesSelect: React.FC<AssignmentCategoriesSelectProps> = ({ levels, areaId }) => {
  const { watch, setValue } = useFormContext<Record<string, AssignmentCategoryFormValues[]>>();
  const watchedFields = watch('assignmentCategory', []);
  const lastSelectedIndex = watchedFields.findLastIndex((field) => !!field?.value);
  const activeLevel = lastSelectedIndex === -1 ? 0 : lastSelectedIndex + 1;

  const handleClearLevels = (startIndex: number) => {
    for (let i = startIndex; i < levels.length; i++) {
      setValue(`assignmentCategory.${i}`, {
        label: '',
        value: '',
        position: levels[i].position,
      });
    }
  };

  return (
    <>
      {levels.map((level, index) => {
        const isLevelEnabled = !!areaId && index <= activeLevel;

        return (
          <SingleAssignmentCategorySelect
            key={`${level.id}-${index}`}
            name={`assignmentCategory.${index}`}
            hierarchyLevelId={level.id}
            hierarchyLevelName={level.name}
            parentCategoryId={index > 0 ? watchedFields[index - 1]?.value : ''}
            enabled={isLevelEnabled}
            position={level.position}
            areaId={areaId}
            onClearNextLevels={() => handleClearLevels(index + 1)}
          />
        );
      })}
    </>
  );
};

type SingleAssignmentCategorySelectProps = {
  name: string;
  hierarchyLevelId: string;
  hierarchyLevelName: string;
  parentCategoryId?: string;
  enabled: boolean;
  position: number;
  onClearNextLevels: () => void;
  areaId?: string;
};

const SingleAssignmentCategorySelect: React.FC<SingleAssignmentCategorySelectProps> = ({
  name,
  hierarchyLevelId,
  hierarchyLevelName,
  parentCategoryId,
  enabled,
  position,
  onClearNextLevels,
  areaId,
}) => {
  const { control, getValues, setValue } = useFormContext();

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
    {
      enabled: !!enabled && !!areaId,
      staleTime: 60000,
    }
  );

  const options = useMemo(() => categories.map(({ id, name }) => ({ label: name, value: id })), [categories]);

  useEffect(() => {
    if (!enabled || !getValues(name)?.value) return;

    const currentValue = getValues(name)?.value;
    const existsInData = categories.some((c) => c.id === currentValue);

    if (!existsInData) {
      setValue(name, { label: '', value: '', position });
      onClearNextLevels();
    }
  }, [categories, enabled, getValues, name, onClearNextLevels, position, setValue]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{hierarchyLevelName}</FormLabel>
          <FormControl>
            <Select
              isDisabled={!enabled}
              isLoading={isLoading}
              isSearchable
              isClearable
              options={options}
              onChange={(option) => {
                const newValue = option ? { ...option, position } : { label: '', value: '', position };

                if (newValue.value !== field.value?.value) {
                  field.onChange(newValue);
                  onClearNextLevels();
                }
              }}
              value={field.value}
            />
          </FormControl>
          <FormDescription>{categories.length === 0 && isLoading ? 'Loading' : `Select the ${hierarchyLevelName.toLowerCase()}.`}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
