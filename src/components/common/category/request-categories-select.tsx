import React, { useEffect, useMemo } from 'react';
import { useFindManyRequestCategory } from '@/services/api/hooks';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { RequestLevelType } from '@/types/prisma/hierarchy';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Select from '@/components/select/select';

export const requestCategorySelectSchema = z.object({
  label: z.string(),
  value: z.string().nonempty('This field is required.'),
  position: z.number(),
});

export type RequestCategorySelectFormValues = z.infer<typeof requestCategorySelectSchema>;

type RequestCategoriesSelectProps = {
  levels: RequestLevelType[];
};

export const RequestCategoriesSelect: React.FC<RequestCategoriesSelectProps> = ({ levels }) => {
  const { watch, setValue } = useFormContext<Record<string, RequestCategorySelectFormValues[]>>();
  const watchedFields = watch('requestCategory', []);
  const lastSelectedIndex = watchedFields.findLastIndex((field) => !!field?.value);
  const activeLevel = lastSelectedIndex === -1 ? 0 : lastSelectedIndex + 1;

  const handleClearLevels = (startIndex: number) => {
    for (let i = startIndex; i < levels.length; i++) {
      setValue(`requestCategory.${i}`, {
        label: '',
        value: '',
        position: levels[i].position,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {levels.map((level, index) => (
        <SingleRequestCategorySelect
          key={`${level.id}-${index}`}
          name={`requestCategory.${index}`}
          hierarchyLevelId={level.id}
          hierarchyLevelName={level.name}
          parentCategoryId={index > 0 ? watchedFields[index - 1]?.value : ''}
          enabled={index <= activeLevel}
          position={level.position}
          onClearNextLevels={() => handleClearLevels(index + 1)}
        />
      ))}
    </div>
  );
};

type SingleRequestCategorySelectProps = {
  name: string;
  hierarchyLevelId: string;
  hierarchyLevelName: string;
  parentCategoryId?: string;
  enabled: boolean;
  position: number;
  onClearNextLevels: () => void;
};

const SingleRequestCategorySelect: React.FC<SingleRequestCategorySelectProps> = ({ name, hierarchyLevelId, hierarchyLevelName, parentCategoryId, enabled, position, onClearNextLevels }) => {
  const { control, setValue, getValues } = useFormContext();

  const where = useMemo(() => (parentCategoryId ? { parentCategoryId } : { hierarchyLevelId }), [parentCategoryId, hierarchyLevelId]);

  const { data: categories = [], isLoading } = useFindManyRequestCategory({ where }, { enabled, staleTime: 60000 });

  const options = useMemo(() => categories.map(({ id, name }) => ({ label: name, value: id })), [categories]);

  useEffect(() => {
    if (!enabled || !getValues(name)?.value) return;
    const currentValue = getValues(name)?.value;
    const exists = categories.some((c) => c.id === currentValue);
    if (!exists) {
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
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
