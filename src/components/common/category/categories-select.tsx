import React, { useState } from 'react';
import { useFindManyCategory } from '@/services/api/hooks';
import { Prisma } from '@prisma/client';
import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  id: z.string(),
  value: z.string().nonempty('This field is required.'),
  position: z.number(),
});

export const CategoriesSelect: React.FC<CategoriesSelectProps> = ({ hierarchyLevels, fieldPrefix }) => {
  const { control, setValue, watch } = useFormContext<{
    [key: string]: { id: string; value: string; position: number }[];
  }>();
  const watchedFields = watch(fieldPrefix) || []; // Watch the specific field prefix
  const [activeLevel, setActiveLevel] = useState(0);

  const handleCategorySelect = (levelId: string, categoryId: string) => {
    const index = hierarchyLevels.findIndex((level) => level.id === levelId);
    setValue(`${fieldPrefix}.${index}.value`, categoryId); // Dynamically resolve the field path
    const selectedCount = watchedFields.filter((field) => !!field?.value).length;

    if (selectedCount < hierarchyLevels.length) {
      setActiveLevel(selectedCount);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {hierarchyLevels.map((level, index) => (
        <Controller
          key={level.id}
          name={`${fieldPrefix}.${index}.value`} // Use the fieldPrefix here
          control={control}
          render={({ field }) => (
            <CategorySelect
              hierarchyLevelId={level.id}
              hierarchyLevelName={level.name}
              enabled={index <= activeLevel}
              selectedCategoryId={field.value}
              parentCategoryId={index > 0 ? (watchedFields[index - 1]?.value ?? '') : ''}
              onCategorySelect={(categoryId) => handleCategorySelect(level.id, categoryId)}
            />
          )}
        />
      ))}
    </div>
  );
};

type CategorySelectProps = {
  hierarchyLevelId: string;
  hierarchyLevelName: string;
  parentCategoryId?: string;
  selectedCategoryId?: string;
  onCategorySelect: (categoryId: string) => void;
  enabled: boolean;
};

const CategorySelect: React.FC<CategorySelectProps> = ({ hierarchyLevelId, hierarchyLevelName, parentCategoryId, selectedCategoryId, onCategorySelect, enabled }) => {
  const where = parentCategoryId ? { parentCategoryId } : { hierarchyLevelId };
  const { data: categories = [], isLoading } = useFindManyCategory({ where }, { enabled });

  return (
    <FormItem>
      <FormLabel>{hierarchyLevelName}</FormLabel>
      <FormControl>
        <Select onValueChange={onCategorySelect} defaultValue={selectedCategoryId} disabled={!enabled || isLoading}>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${hierarchyLevelName}`} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex flex-col items-start justify-between">
                  <span className="text-sm">{category.name}</span>
                  {category.description && <span className="block text-xs text-muted-foreground">{category.description}</span>}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
