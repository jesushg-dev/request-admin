'use client';

import React, { memo } from 'react';
import { Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { RequirementOptionType } from '@/types/prisma/requirement';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect } from '@/components/multi-select';

import { CategoryFormValues } from '.';

interface SubcategoryFormDialogProps {
  currentPath: string;
  categoryName: string;
  requirements: RequirementOptionType[];
}

const SubcategoryFormDialog: React.FC<SubcategoryFormDialogProps> = ({ currentPath, requirements, categoryName }) => {
  const t = useTranslations('component.categoryForm');
  const { control, watch } = useFormContext<CategoryFormValues>();
  const requirementsCount = watch(`${currentPath}.requirements` as `categories.${number}.requirements`)?.length ?? 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" className="relative" aria-label={t('editSubcategoryButton', { categoryName })} variant="outline" size="sm">
          <Settings className="size-4" />
          {requirementsCount && requirementsCount > 0 && (
            <Badge className="absolute -right-2 -top-2 px-1 py-0 text-[10px]">
              <span>{requirementsCount > 9 ? '9+' : requirementsCount}</span>
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>{t('editSubcategoryTitle', { categoryName })}</DialogTitle>
        </DialogHeader>
        <FormField
          control={control}
          name={`${currentPath}.description` as `categories.${number}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('subcategoryDescriptionLabel', { categoryName })}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('subcategoryDescriptionPlaceholder', { categoryName })} rows={5} {...field} />
              </FormControl>
              <FormDescription>{t('descriptionDescription', { categoryName })}</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`${currentPath}.requirements` as `categories.${number}.requirements`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('requirementsLabel')}</FormLabel>
              <FormControl>
                <MultiSelect value={field.value} defaultValue={field.value} onValueChange={field.onChange} options={requirements} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`${currentPath}.isEligibleForNewClients` as `categories.${number}.isEligibleForNewClients`}
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel>{t('eligibleForNewClientsLabel')}</FormLabel>
            </FormItem>
          )}
        />
      </DialogContent>
    </Dialog>
  );
};

export default memo(SubcategoryFormDialog);
