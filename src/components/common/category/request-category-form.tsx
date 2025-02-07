'use client';

import { memo, type FC } from 'react';
import { BookCopy, ChevronDown, ChevronRight, FilePlus2, FileX2, ListTodoIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { RequestLevelType } from '@/types/prisma/hierarchy';
import { generateUuid } from '@/lib/id';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Hint } from '@/components/hint';
import { OptionType } from '@/components/select/select';

import RequestSubcategoryFormDialog from './request-subcategory-form-dialog';

export const getDefaultSubcategory = (hierarchyLevelId: string): RequestCategory => ({
  id: generateUuid(),
  name: '',
  description: '',
  isActive: true,
  hierarchyLevelId,
  isEligibleForNewClients: false,
  isSubCategoryVisible: true,
  subcategories: [],
  requirements: [],
  forms: [],
  sla: {
    id: generateUuid(),
    resolutionTime: 0,
    escalationTime: 0,
  },
});

export type RequestCategory = {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  hierarchyLevelId: string;
  subcategories: RequestCategory[];
  isEligibleForNewClients?: boolean;
  isSubCategoryVisible?: boolean;
  requirements?: OptionType[];
  forms?: OptionType[];
  sla: {
    id: string;
    resolutionTime: number;
    escalationTime: number;
  };
  guides?: File[];
};

export const requestCategoryFormSchema: z.ZodType<RequestCategory> = z.object({
  id: z.string().uuid(),
  name: z.string({ required_error: 'requiredName' }).min(2, 'minName'),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  hierarchyLevelId: z.string(),
  isEligibleForNewClients: z.boolean().optional(),
  isSubCategoryVisible: z.boolean().optional(),
  requirements: z.array(z.object({ value: z.string(), label: z.string() })),
  forms: z.array(z.object({ value: z.string(), label: z.string() })),
  sla: z.object({
    id: z.string().uuid(),
    resolutionTime: z.coerce.number().min(0),
    escalationTime: z.coerce.number().min(0),
  }),
  additionalDocuments: z.array(z.instanceof(File)).optional(),
  subcategories: z.lazy(() => z.array(requestCategoryFormSchema)),
});

export const categoriesSchema = z.object({
  categories: z.array(requestCategoryFormSchema),
});

export type RequestCategoryFormValues = z.infer<typeof categoriesSchema>;

interface RequestCategoryFormProps {
  parentPath?: string;
  currentDepth?: number;
  levels: RequestLevelType[];
  mode?: 'single' | 'multiple';
  requirements: OptionType[];
  forms: OptionType[];
}

const RequestCategoryForm: FC<RequestCategoryFormProps> = ({ parentPath = 'categories', currentDepth = 0, levels, forms, requirements, mode = 'multiple' }) => {
  const t = useTranslations('component.categoryForm');
  const { control, setValue, watch, formState } = useFormContext<RequestCategoryFormValues>();
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
        const currentFormState = formState.errors?.categories?.[index];

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
                      <Input className="h-8 w-full rounded text-xs" placeholder={t('categoryNamePlaceholder', { categoryName })} {...field} />
                    </FormControl>
                    <div className="flex w-full justify-between gap-4 items-center">
                      {currentFormState?.name?.message ? (
                        <FormMessage className="text-xs">{t(currentFormState?.name?.message as 'requiredName') || t(currentFormState?.requirements?.message as 'requiredRequirements')}</FormMessage>
                      ) : (
                        <FormDescription className="text-xs">{t('nameDescription', { categoryName, index: index + 1 })}</FormDescription>
                      )}
                      <RequestCategoryBadges currentPath={currentPath} />
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <RequestSubcategoryFormDialog currentPath={currentPath} forms={forms} requirements={requirements} categoryName={levels[currentDepth]?.name ?? ''} />

                {currentDepth < levels.length - 1 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => toggleExpand(currentPath, isExpanded)}>
                    {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                  </Button>
                )}

                {currentDepth === levels.length - 1 && (
                  <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                    <FileX2 className="size-4" />
                    {t('removeCategoryButton', { categoryName, index: index + 1 })}
                  </Button>
                )}
              </div>
            </div>
            {currentDepth < levels.length - 1 && isExpanded && (
              <div className="block transition-all duration-300">
                <RequestCategoryForm parentPath={`${currentPath}.subcategories`} currentDepth={currentDepth + 1} forms={forms} requirements={requirements} levels={levels} />
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

const RequestCategoryBadges: FC<{ currentPath: string }> = ({ currentPath }) => {
  const { watch } = useFormContext<RequestCategoryFormValues>();
  const formsCount = watch(`${currentPath}.forms` as `categories.${number}.forms`)?.length ?? 0;
  const requirementsCount = watch(`${currentPath}.requirements` as `categories.${number}.requirements`)?.length ?? 0;

  return (
    <div className="flex gap-2">
      <Hint label={`Total number of requirements: ${requirementsCount}`}>
        <Badge className="flex gap-1" variant="outline">
          <ListTodoIcon className="size-3" />
          {requirementsCount}
        </Badge>
      </Hint>
      <Hint label={`Total number of forms: ${formsCount}`}>
        <Badge className="flex gap-1" variant="outline">
          <BookCopy className="size-3" />
          {formsCount}
        </Badge>
      </Hint>
    </div>
  );
};

export default memo(RequestCategoryForm);
