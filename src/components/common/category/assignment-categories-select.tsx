import React, { useMemo } from 'react';
import { useFindManyAssignmentCategory } from '@/services/api/hooks';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { AssignmentLevelType } from '@/types/prisma/hierarchy';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Select from '@/components/select/select';

// Schema for assignment categories
export const assignmentCategorySelectSchema = z.object({
  label: z.string(),
  value: z.string().nonempty('This field is required.'),
  position: z.number(),
});

export type AssignmentCategoryFormValues = z.infer<typeof assignmentCategorySelectSchema>;

type AssignmentCategoriesSelectProps = {
  levels: AssignmentLevelType[];
  prefix: 'categories.assignmentCategory' | 'assignmentCategory';
};

export const AssignmentCategoriesSelect: React.FC<AssignmentCategoriesSelectProps> = ({ levels, prefix }) => {
  const { watch, setValue } = useFormContext<Record<string, AssignmentCategoryFormValues[]>>();
  const watchedFields = watch(prefix, []);
  const activeLevel = useMemo(() => watchedFields.filter((field) => !!field?.value).length, [watchedFields]);

  const handleClearLevels = (startIndex: number) => {
    for (let i = startIndex; i < levels.length; i++) {
      setValue(`${prefix}.${i}.value`, '');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {levels.map((level, index) => (
        <AssignmentCategorySelect
          key={level.id}
          name={`${prefix}.${index}`}
          hierarchyLevelId={level.id}
          hierarchyLevelName={level.name}
          parentCategoryId={index > 0 ? (watchedFields[index - 1]?.value ?? '') : ''}
          enabled={index <= activeLevel}
          position={level.position}
          onClearNextLevels={() => handleClearLevels(index + 1)}
        />
      ))}
    </div>
  );
};

type AssignmentCategorySelectProps = {
  name: string;
  hierarchyLevelId: string;
  hierarchyLevelName: string;
  parentCategoryId?: string;
  enabled: boolean;
  position: number;
  onClearNextLevels: () => void;
};

const AssignmentCategorySelect: React.FC<AssignmentCategorySelectProps> = ({ name, hierarchyLevelId, hierarchyLevelName, parentCategoryId, enabled, position, onClearNextLevels }) => {
  const { control } = useFormContext<Record<string, AssignmentCategoryFormValues[]>>();

  const where = parentCategoryId ? { parentCategoryId } : { hierarchyLevelId };
  const { data: categories = [], isLoading } = useFindManyAssignmentCategory({ where }, { enabled });
  const options = useMemo(() => categories.map((category) => ({ label: category.name, value: category.id })), [categories]);

  return (
    <FormField
      control={control}
      name={name as `assignmentCategory.${number}`}
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
                if (option?.value !== field.value?.value) {
                  field.onChange({ ...option, position });
                  onClearNextLevels();
                }
              }}
              value={field.value}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
