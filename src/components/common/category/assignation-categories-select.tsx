import React, { useMemo } from 'react';
import { useFindManyAssignationCategory } from '@/services/api/hooks';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { AssignmentLevelType } from '@/types/prisma/hierarchy';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Select from '@/components/select/select';

// Schema for assignation categories
export const assignationCategorySelectSchema = z.object({
  label: z.string(),
  value: z.string().nonempty('This field is required.'),
  position: z.number(),
});

export type AssignationCategoryFormValues = z.infer<typeof assignationCategorySelectSchema>;

type AssignationCategoriesSelectProps = {
  fieldPrefix: string;
  levels: AssignmentLevelType[];
};

export const AssignationCategoriesSelect: React.FC<AssignationCategoriesSelectProps> = ({ levels, fieldPrefix }) => {
  const { watch, setValue } = useFormContext<Record<string, AssignationCategoryFormValues[]>>();
  const watchedFields = watch(fieldPrefix, []);
  const activeLevel = useMemo(() => watchedFields.filter((field) => !!field?.value).length, [watchedFields]);

  const handleClearLevels = (startIndex: number) => {
    for (let i = startIndex; i < levels.length; i++) {
      setValue(`${fieldPrefix}.${i}.value`, '');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {levels.map((level, index) => (
        <AssignationCategorySelect
          key={level.id}
          name={`${fieldPrefix}.${index}`}
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

type AssignationCategorySelectProps = {
  name: string;
  hierarchyLevelId: string;
  hierarchyLevelName: string;
  parentCategoryId?: string;
  enabled: boolean;
  position: number;
  onClearNextLevels: () => void;
};

const AssignationCategorySelect: React.FC<AssignationCategorySelectProps> = ({ name, hierarchyLevelId, hierarchyLevelName, parentCategoryId, enabled, position, onClearNextLevels }) => {
  const { control } = useFormContext<Record<string, AssignationCategoryFormValues[]>>();

  const where = parentCategoryId ? { parentCategoryId } : { hierarchyLevelId };
  const { data: categories = [], isLoading } = useFindManyAssignationCategory({ where }, { enabled });
  const options = useMemo(() => categories.map((category) => ({ label: category.name, value: category.id })), [categories]);

  return (
    <FormField
      control={control}
      name={name as `assignationCategory.${number}`}
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
