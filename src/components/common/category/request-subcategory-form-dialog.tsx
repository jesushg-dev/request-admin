'use client';

import React, { memo } from 'react';
import { FileCogIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import ConditionalDialogWrapper from '@/components/conditional-dialog-wrapper';
import Select, { OptionType } from '@/components/custom-ui/select';

import { RequestCategoryFormValues } from './request-category-form';

interface RequestSubcategoryFormDialogProps {
  currentPath: string;
  categoryName: string;
  requirements: OptionType[];
  forms: OptionType[];
  isBatch?: boolean;
}

const RequestSubcategoryFormDialog: React.FC<RequestSubcategoryFormDialogProps> = ({ isBatch = false, currentPath, requirements, forms, categoryName }) => {
  const t = useTranslations('component.categoryForm');
  const { control } = useFormContext<RequestCategoryFormValues>();

  return (
    <ConditionalDialogWrapper
      isDialog={isBatch}
      trigger={
        <Button type="button" className="relative" title={t('editSubcategoryButton', { categoryName })} aria-label={t('editSubcategoryButton', { categoryName })} variant="outline" size="sm">
          <FileCogIcon className="size-4" />
        </Button>
      }
      title={t('editSubcategoryTitle', { categoryName })}>
      <div className="flex flex-col flex-1 overflow-hidden relative max-h-[calc(100vh-12rem)]">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="sla">SLA</TabsTrigger>
            <TabsTrigger value="guide-documents">Guide Documents</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <ScrollArea className="h-[calc(100vh-15rem)]">
              <div className="flex flex-col gap-4 w-full px-1">
                <FormField
                  control={control}
                  name={`${currentPath}.description` as `categories.${number}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('subcategoryDescriptionLabel', { categoryName })}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('subcategoryDescriptionPlaceholder', { categoryName })} rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
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
                        <Select menuPortalTarget={null} value={field.value} defaultValue={field.value} isMulti onChange={field.onChange} options={requirements} />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>{t('requirementsDescription', { categoryName })}</FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`${currentPath}.forms` as `categories.${number}.forms`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('formsLabel')}</FormLabel>
                      <FormControl>
                        <Select menuPortalTarget={null} value={field.value} defaultValue={field.value} isMulti onChange={field.onChange} options={forms} />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>{t('requirementsDescription', { categoryName })}</FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`${currentPath}.isEligibleForNewClients` as `categories.${number}.isEligibleForNewClients`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{t('eligibleForNewClientsLabel')}</FormLabel>
                        <FormMessage />
                        <FormDescription>{t('eligibleForNewClientsDescription', { categoryName })}</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`${currentPath}.isActive` as `categories.${number}.isActive`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{t('isActiveLabel')}</FormLabel>
                        <FormMessage />
                        <FormDescription>{t('isActiveDescription', { categoryName })}</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="sla">
            <ScrollArea className="h-[calc(100vh-15rem)]">
              <div className="flex flex-col gap-4 w-full px-1">
                <FormField
                  control={control}
                  defaultValue={0}
                  name={`${currentPath}.sla.resolutionTime` as `categories.${number}.sla.resolutionTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resolution Time (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>The time in hours to resolve the request ( 0 means no SLA )</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  defaultValue={0}
                  name={`${currentPath}.sla.escalationTime` as `categories.${number}.sla.escalationTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Escalation Time (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>The time in hours before escalation ( 0 means no escalation )</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="guide-documents">
            <ScrollArea className="h-[calc(100vh-15rem)]">
              <div className="flex flex-col gap-4 w-full px-1"></div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </ConditionalDialogWrapper>
  );
};

export default memo(RequestSubcategoryFormDialog);
