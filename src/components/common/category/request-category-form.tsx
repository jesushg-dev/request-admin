'use client';

import React, { memo } from 'react';
import { ChevronDown, ChevronRight, FilePlus2, FileX2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { RequirementOptionType } from '@/types/prisma/requirement';
import { Button } from '@/components/ui/button';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import RequestSubcategoryFormDialog from './request-subcategory-form-dialog';

const DEFAULT_SUBCATEGORY = {
  id: undefined,
  name: '',
  description: '',
  isEligibleForNewClients: false,
  isSubCategoryVisible: true,
  subcategories: [],
  requirements: [],
};

type RequestCategory = {
  id?: string;
  name: string;
  description?: string;
  subcategories: RequestCategory[];
  isEligibleForNewClients?: boolean;
  isSubCategoryVisible?: boolean;
  requirements?: string[];
};

export type RequestCategoryFormValues = {
  categories: RequestCategory[];
};

export const requestCategoryFormSchema: z.ZodType<RequestCategory> = z.object({
  id: z.string().optional(),
  name: z.string({ required_error: 'requiredName' }).min(3, 'minName'),
  description: z.string().optional(),
  subcategories: z.lazy(() => z.array(requestCategoryFormSchema)),
  isEligibleForNewClients: z.boolean().optional(),
  isSubCategoryVisible: z.boolean().optional(),
  requirements: z.array(z.string()).optional(),
});

export const requestCategoryFormContainerSchema = z.object({
  categories: z.array(requestCategoryFormSchema).nonempty('requiredCategories'),
});

interface RequestCategoryFormProps {
  parentPath?: string;
  currentDepth?: number;
  levels: { name: string }[];
  requirements: RequirementOptionType[];
  mode?: 'single' | 'multiple';
}

const RequestCategoryForm: React.FC<RequestCategoryFormProps> = ({ parentPath = 'categories', currentDepth = 0, levels, requirements, mode = 'multiple' }) => {
  const t = useTranslations('component.categoryForm');
  const { control, setValue, watch, formState } = useFormContext<RequestCategoryFormValues>();
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
                      <FormMessage className="text-xs">{t(currentFormState?.name?.message as 'requiredName') || t(currentFormState?.requirements?.message as 'requiredRequirements')}</FormMessage>
                    ) : (
                      <FormDescription className="hidden text-xs">{t('nameDescription', { categoryName })}</FormDescription>
                    )}
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <RequestSubcategoryFormDialog currentPath={currentPath} requirements={requirements} categoryName={levels[currentDepth]?.name ?? ''} />

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
            </div>
            {currentDepth < levels.length - 1 && isExpanded && (
              <div className="block transition-all duration-300">
                <RequestCategoryForm parentPath={`${currentPath}.subcategories`} currentDepth={currentDepth + 1} requirements={requirements} levels={levels} />
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

export default memo(RequestCategoryForm);
