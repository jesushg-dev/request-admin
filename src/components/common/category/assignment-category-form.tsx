// File location: /components/AssignmentCategoryForm.tsx
'use client';

import React, { memo } from 'react';
import { ChevronDown, ChevronRight, FileCogIcon, FilePlus2, FileX2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { RequestLevelType } from '@/types/zenstackhq/hierarchy';
import { generateUuid } from '@/lib/id';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Hint } from '@/components/hint';

const getDefaultSubcategory = (hierarchyLevelId: string): AssignmentCategory => ({
  id: generateUuid(),
  name: '',
  description: '',
  isActive: true,
  isSubCategoryVisible: true,
  hierarchyLevelId,
  subcategories: [],
});

export type AssignmentCategory = {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  hierarchyLevelId: string;
  isSubCategoryVisible?: boolean;
  subcategories: AssignmentCategory[];
};

export const assignmentCategoryFormSchema: z.ZodType<AssignmentCategory> = z.object({
  id: z.string(),
  name: z.string({ error: 'requiredName' }).min(2, 'minName'),
  description: z.string().optional(),
  isSubCategoryVisible: z.boolean().optional(),
  hierarchyLevelId: z.string(),
  isActive: z.boolean(),
  subcategories: z
    .lazy(() => z.array(assignmentCategoryFormSchema))
    .superRefine((categories, ctx) => {
      const seen = new Set<string>();
      categories.forEach((category, index) => {
        if (seen.has(category.name)) {
          ctx.addIssue({
            path: [index, 'name'],
            code: z.ZodIssueCode.custom,
            message: 'duplicateName',
          });
        } else {
          seen.add(category.name);
        }
      });
    }),
});

export const categoriesSchema = z.object({
  categories: z.array(assignmentCategoryFormSchema).superRefine((categories, ctx) => {
    const seen = new Set<string>();
    categories.forEach((category, index) => {
      if (seen.has(category.name)) {
        ctx.addIssue({
          path: [index, 'name'],
          code: z.ZodIssueCode.custom,
          message: 'duplicateName',
        });
      } else {
        seen.add(category.name);
      }
    });
  }),
});

export type AssignmentCategoryFormValues = z.infer<typeof categoriesSchema>;

interface AssignmentCategoryFormProps {
  parentPath?: string;
  currentDepth?: number;
  levels: RequestLevelType[];
  mode?: 'single' | 'multiple';
}

const AssignmentCategoryForm: React.FC<AssignmentCategoryFormProps> = ({ parentPath = 'categories', currentDepth = 0, levels, mode = 'multiple' }) => {
  const t = useTranslations('component.categoryForm');
  const { control, setValue, watch } = useFormContext<AssignmentCategoryFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: parentPath as 'categories' });
  const categoryName = levels[currentDepth]?.name;

  const addCategory = (hierarchyLevelId: string) => {
    append(getDefaultSubcategory(hierarchyLevelId));
  };
  const toggleExpand = (currentPath: string, value: boolean) => setValue(`${currentPath}.isSubCategoryVisible` as `categories.${number}.isSubCategoryVisible`, !value);

  return (
    <div className={`flex flex-col gap-2 ${currentDepth > 0 ? 'pl-6' : ''}`}>
      {fields.map((field, index) => {
        const currentPath = `${parentPath}.${index}`;
        const isExpanded = watch(`${currentPath}.isSubCategoryVisible` as `categories.${number}.isSubCategoryVisible`) ?? true;

        return (
          <div key={field.id || currentPath} className={`flex flex-col gap-2 ${currentDepth > 0 ? 'border-l-2 border-dashed pl-2' : ''}`}>
            <div className="flex gap-2 items-center">
              <FormField
                control={control}
                name={`${currentPath}.name` as `categories.${number}.name`}
                render={({ field }) => (
                  <FormItem className="ml-1 w-full">
                    <FormLabel className="text-xs">{t('categoryNameLabel', { categoryName, index: index + 1 })}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('categoryNamePlaceholder', { categoryName })} {...field} />
                    </FormControl>
                    <div className="flex w-full justify-between gap-4 items-center">
                      <FormDescription className="text-xs">{t('nameDescription', { categoryName, index: index + 1 })}</FormDescription>
                      <AssignmentCategoryBadges currentPath={currentPath} />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" size="sm" aria-label={t('editSubcategoryButton', { categoryName })} title={t('editSubcategoryButton', { categoryName })}>
                    <FileCogIcon className="size-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-140">
                  <FormField
                    control={control}
                    name={`${currentPath}.description` as `categories.${number}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('subcategoryDescriptionLabel', { categoryName })}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('subcategoryDescriptionPlaceholder', { categoryName })} {...field} />
                        </FormControl>
                        <FormDescription>{t('descriptionDescription', { categoryName })}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </PopoverContent>
              </Popover>

              {currentDepth < levels.length - 1 && (
                <Button type="button" variant="outline" size="sm" onClick={() => toggleExpand(currentPath, isExpanded)}>
                  {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                </Button>
              )}

              <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                <FileX2 className="size-4" />
                {t('removeCategoryButton', { categoryName, index: index + 1 })}
              </Button>
            </div>
            {currentDepth < levels.length - 1 && isExpanded && (
              <div className="block transition-all duration-300">
                <AssignmentCategoryForm parentPath={`${currentPath}.subcategories`} currentDepth={currentDepth + 1} levels={levels} />
              </div>
            )}
          </div>
        );
      })}
      {(mode === 'multiple' || (fields.length === 0 && mode === 'single')) && (
        <Button type="button" variant="outline" role="combobox" size="sm" className="border-2 border-dashed" onClick={() => addCategory(levels[currentDepth].id)}>
          <FilePlus2 className="size-4" />
          {t('addCategoryButton', { categoryName })}
        </Button>
      )}
    </div>
  );
};

const AssignmentCategoryBadges: React.FC<{ currentPath: string }> = ({ currentPath }) => {
  const { watch } = useFormContext<AssignmentCategoryFormValues>();
  const subcategoriesCount = watch(`${currentPath}.subcategories` as `categories.${number}.subcategories`)?.length ?? 0;

  return (
    <div className="flex gap-2">
      <Hint label={`Total subcategories: ${subcategoriesCount}`}>
        <Badge className="flex gap-1" variant="outline">
          <ChevronRight className="size-3" />
          {subcategoriesCount}
        </Badge>
      </Hint>
    </div>
  );
};

export default memo(AssignmentCategoryForm);
