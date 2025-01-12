'use client';

import React, { memo } from 'react';
import { ChevronDown, ChevronRight, FilePlus2, FileX2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const DEFAULT_SUBCATEGORY = {
  id: undefined,
  name: '',
  description: '',
  isEligibleForNewClients: false,
  isSubCategoryVisible: true,
  subcategories: [],
};

type AssignmentCategory = {
  id?: string;
  name: string;
  description?: string;
  subcategories: AssignmentCategory[];
  isEligibleForNewClients?: boolean;
  isSubCategoryVisible?: boolean;
};

export type AssignmentCategoryFormValues = {
  categories: AssignmentCategory[];
};

export const assignmentCategoryFormSchema: z.ZodType<AssignmentCategory> = z.object({
  id: z.string().optional(),
  name: z.string({ required_error: 'requiredName' }).min(3, 'minName'),
  description: z.string().optional(),
  subcategories: z.lazy(() => z.array(assignmentCategoryFormSchema)),
  isEligibleForNewClients: z.boolean().optional(),
  isSubCategoryVisible: z.boolean().optional(),
});

interface AssignmentCategoryFormProps {
  parentPath?: string;
  currentDepth?: number;
  levels: { name: string }[];
  mode?: 'single' | 'multiple';
}

const AssignmentCategoryForm: React.FC<AssignmentCategoryFormProps> = ({ parentPath = 'categories', currentDepth = 0, levels, mode = 'multiple' }) => {
  const t = useTranslations('component.categoryForm');
  const { control, setValue, watch, formState } = useFormContext<AssignmentCategoryFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: parentPath as 'categories' });
  const categoryName = levels[currentDepth]?.name;

  const addCategory = () => append(DEFAULT_SUBCATEGORY);
  const toggleExpand = (currentPath: string, value: boolean) => setValue(`${currentPath}.isSubCategoryVisible` as `categories.${number}.isSubCategoryVisible`, !value);

  return (
    <div className={`flex flex-col gap-2 ${currentDepth > 0 ? 'pl-6' : ''}`}>
      {fields.map((field, index) => {
        const currentPath = `${parentPath}.${index}`;
        const isExpanded = watch(`${currentPath}.isSubCategoryVisible` as `categories.${number}.isSubCategoryVisible`) ?? true;
        const currentFormState = formState.errors?.categories?.[index];

        return (
          <div key={field.id || currentPath} className={`flex flex-col gap-2 ${currentDepth > 0 ? 'border-l-2 border-dashed pl-2' : ''}`}>
            <div className="flex items-end gap-2">
              <FormField
                control={control}
                name={`${currentPath}.name` as `categories.${number}.name`}
                render={({ field }) => (
                  <FormItem className="ml-1 w-full">
                    <FormLabel className="text-xs">{t('categoryNameLabel', { categoryName, index: index + 1 })}</FormLabel>
                    <FormControl>
                      <Input className="h-8 w-full rounded text-xs" placeholder={t('categoryNamePlaceholder', { categoryName })} {...field} />
                    </FormControl>
                    {currentFormState?.name?.message ? (
                      <FormMessage className="text-xs">{t(currentFormState?.name?.message as 'requiredName')}</FormMessage>
                    ) : (
                      <FormDescription className="hidden text-xs">{t('nameDescription', { categoryName })}</FormDescription>
                    )}
                  </FormItem>
                )}
              />

              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    {t('editSubcategoryButton', { categoryName })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72">
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
        <Button type="button" variant="outline" role="combobox" size="sm" className="border-2 border-dashed" onClick={addCategory}>
          <FilePlus2 className="size-4" />
          {t('addCategoryButton', { categoryName })}
        </Button>
      )}
    </div>
  );
};

export default memo(AssignmentCategoryForm);
