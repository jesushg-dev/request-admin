import React, { useMemo } from 'react';
import { useFindManyRequestCategory } from '@/services/api/hooks';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { RequestLevelType } from '@/types/prisma/hierarchy';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Select from '@/components/select/select';

// Schema for request categories
export const requestCategorySelectSchema = z.object({
  label: z.string(),
  value: z.string().nonempty('This field is required.'),
  position: z.number(),
});

export type RequestCategorySelectFormValues = z.infer<typeof requestCategorySelectSchema>;

type RequestCategoriesSelectProps = {
  fieldPrefix: string;
  levels: RequestLevelType[];
};

export const RequestCategoriesSelect: React.FC<RequestCategoriesSelectProps> = ({ levels, fieldPrefix }) => {
  const { watch, setValue } = useFormContext<Record<string, RequestCategorySelectFormValues[]>>();
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
        <RequestCategorySelect
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

type RequestCategorySelectProps = {
  name: string;
  hierarchyLevelId: string;
  hierarchyLevelName: string;
  parentCategoryId?: string;
  enabled: boolean;
  position: number;
  onClearNextLevels: () => void;
};

const RequestCategorySelect: React.FC<RequestCategorySelectProps> = ({ name, hierarchyLevelId, hierarchyLevelName, parentCategoryId, enabled, position, onClearNextLevels }) => {
  const { control } = useFormContext<Record<string, RequestCategorySelectFormValues[]>>();

  const where = parentCategoryId ? { parentCategoryId } : { hierarchyLevelId };
  const { data: categories = [], isLoading } = useFindManyRequestCategory({ where }, { enabled });
  const options = useMemo(() => categories.map((category) => ({ label: category.name, value: category.id })), [categories]);

  return (
    <FormField
      control={control}
      name={name as `requestCategory.${number}`}
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
