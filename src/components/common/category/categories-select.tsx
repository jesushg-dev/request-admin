import React, { useMemo } from 'react';
import { useFindManyCategory } from '@/services/api/hooks';
import { Prisma } from '@prisma/client';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Select from '@/components/select/select';

export const HierarchyDefaultArgs = Prisma.validator<Prisma.HierarchyDefaultArgs>()({
  select: {
    id: true,
    levels: {
      select: { id: true, name: true, position: true },
      orderBy: { position: 'asc' },
    },
  },
});

export type HierarchyWithRelations = Prisma.HierarchyGetPayload<typeof HierarchyDefaultArgs>;

type CategoriesSelectProps = {
  fieldPrefix: string;
  hierarchyLevels: HierarchyWithRelations['levels'];
};

export const categorySchema = z.object({
  label: z.string(),
  value: z.string().nonempty('This field is required.'),
  position: z.number(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const CategoriesSelect: React.FC<CategoriesSelectProps> = ({ hierarchyLevels, fieldPrefix }) => {
  const { watch, setValue, formState } = useFormContext<Record<string, CategoryFormValues[]>>();
  console.log('🚀 ~ formState:', formState.errors);
  const watchedAllFields = watch() || [];
  console.log('🚀 ~ watchedAllFields:', watchedAllFields);
  const watchedFields = watch(fieldPrefix) || [];
  console.log('🚀 ~ watchedFields:', watchedFields);
  const activeLevel = useMemo(() => watchedFields.filter((field) => !!field?.value).length, [watchedFields]);
  console.log('🚀 ~ activeLevel:', activeLevel);

  const handleClearLevels = (startIndex: number) => {
    for (let i = startIndex; i < hierarchyLevels.length; i++) {
      setValue(`${fieldPrefix}.${i}.value`, ''); // Deselecciona el nivel
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {hierarchyLevels.map((level, index) => (
        <CategorySelect
          key={level.id}
          position={level.position}
          hierarchyLevelId={level.id}
          hierarchyLevelName={level.name}
          enabled={index <= activeLevel}
          parentCategoryId={index > 0 ? (watchedFields[index - 1]?.value ?? '') : ''}
          name={`${fieldPrefix}.${index}`}
          onClearNextLevels={() => handleClearLevels(index + 1)} // Limpiar niveles posteriores
        />
      ))}
    </div>
  );
};

type CategorySelectProps = {
  name: string;
  hierarchyLevelId: string;
  hierarchyLevelName: string;
  parentCategoryId?: string;
  enabled: boolean;
  position: number;
  onClearNextLevels: () => void; // Prop para limpiar niveles posteriores
};

const CategorySelect: React.FC<CategorySelectProps> = ({ position, name, hierarchyLevelId, hierarchyLevelName, parentCategoryId, enabled, onClearNextLevels }) => {
  const { control, register } = useFormContext<Record<string, CategoryFormValues[]>>();

  const where = parentCategoryId ? { parentCategoryId } : { hierarchyLevelId };
  const { data: categories = [], isLoading } = useFindManyCategory({ where }, { enabled });
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
                console.log('🚀 ~ option:', option, field.value);
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
