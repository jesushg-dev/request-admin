'use client';

import React, { memo } from 'react';
import { ChevronDown, ChevronRight, FilePlus2, FileX2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FieldErrors, useFieldArray, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { LevelType } from '@/types/prisma/hierarchy';
import { RequirementOptionType } from '@/types/prisma/requirement';
import { getNestedValue } from '@/lib/array';
import { Button } from '@/components/ui/button';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import SubcategoryFormDialog from './subcategory-form-dialog';

const DEFAULT_SUBCATEGORY = {
  id: undefined,
  name: '',
  description: '',
  isEligibleForNewClients: false,
  isSubCategoryVisible: true,
  subcategories: [],
  requirements: [],
};

// Recursive Type for Categories
type Category = {
  id?: string;
  name: string;
  description?: string;
  subcategories: Category[];
  isEligibleForNewClients?: boolean;
  isSubCategoryVisible?: boolean;
  requirements?: string[];
};

// Form Values Type
export type CategoryFormValues = {
  categories: Category[];
};

// Validation Schema with Zod
export const subcategoryFormSchema: z.ZodType<Category> = z.object({
  id: z.string().optional(),
  name: z.string({ required_error: 'requiredName' }).min(3, 'minName'),
  description: z.string().optional(),
  subcategories: z.lazy(() => z.array(subcategoryFormSchema)),
  isEligibleForNewClients: z.boolean().optional(),
  isSubCategoryVisible: z.boolean().optional(),
  requirements: z.array(z.string()).optional(),
});

export const categoryFormSchema = z.object({
  categories: z.array(subcategoryFormSchema).nonempty('requiredCategories'),
});

interface CategoryFormProps {
  parentPath?: string;
  currentDepth?: number;
  requirements: RequirementOptionType[];
  levels: LevelType[];
}

const CategoryForm: React.FC<CategoryFormProps> = memo(({ parentPath = 'categories', currentDepth = 0, levels, requirements }) => {
  const t = useTranslations('component.categoryForm');
  const { control, setValue, watch, formState } = useFormContext<CategoryFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: parentPath as 'categories' });
  const categoryName = levels[currentDepth]?.name;

  const addCategory = () => append(DEFAULT_SUBCATEGORY);
  const toggleExpand = (currentPath: string, value: boolean) => setValue(`${currentPath}.isSubCategoryVisible` as `categories.${number}.isSubCategoryVisible`, !value);

  return (
    <div className={`flex flex-col gap-2 ${currentDepth > 0 ? 'pl-6' : ''}`}>
      {fields.map((field, index) => {
        const currentPath = `${parentPath}.${index}`;
        const isExpanded = watch(`${currentPath}.isSubCategoryVisible` as `categories.${number}.isSubCategoryVisible`) ?? true;
        const currentFormState = getNestedValue<FieldErrors<CategoryFormValues>['categories']>(formState.errors, parentPath as `categories`)?.[index];
        return (
          <div key={field.id || currentPath} className="flex flex-col gap-4 border-l-2 border-dashed pb-2 pl-2">
            <div className="flex items-end gap-2">
              <FormField
                control={control}
                name={`${currentPath}.name` as `categories.${number}.name`}
                render={({ field }) => (
                  <FormItem className="ml-1 w-full">
                    <FormLabel>{t('categoryNameLabel', { categoryName, index: index + 1 })}</FormLabel>
                    <FormControl>
                      <Input className="h-8 w-full rounded" placeholder={t('categoryNamePlaceholder', { categoryName })} {...field} value={String(field.value)} />
                    </FormControl>
                    {currentFormState?.name?.message || currentFormState?.requirements?.message ? (
                      <FormMessage>{t(currentFormState?.name?.message as 'requiredName') || t(currentFormState?.requirements?.message as 'requiredRequirements')}</FormMessage>
                    ) : (
                      <FormDescription className="hidden">{t('nameDescription', { categoryName })}</FormDescription>
                    )}
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <SubcategoryFormDialog currentPath={currentPath} requirements={requirements} categoryName={levels[currentDepth]?.name ?? ''} />

                {currentDepth < levels.length - 1 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => toggleExpand(currentPath, isExpanded)}>
                    {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                  </Button>
                )}

                <Button type="button" aria-label={t('removeCategoryButton', { categoryName, index: index + 1 })} variant="destructive" size="sm" onClick={() => remove(index)}>
                  <FileX2 className="size-4" />
                  {t('removeCategoryButton', { categoryName, index: index + 1 })}
                </Button>
              </div>
            </div>
            {currentDepth < levels.length - 1 && isExpanded && (
              <div className="block transition-all duration-300">
                <CategoryForm parentPath={`${currentPath}.subcategories`} currentDepth={currentDepth + 1} requirements={requirements} levels={levels} />
              </div>
            )}
          </div>
        );
      })}
      <Button type="button" variant="outline" role="combobox" size="sm" className="border-2 border-dashed" onClick={addCategory}>
        <FilePlus2 className="size-4" />
        {t('addCategoryButton', { categoryName })}
      </Button>
    </div>
  );
});

export default CategoryForm;
