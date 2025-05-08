'use client';

import React, { FC, useMemo, useState } from 'react';
import { useFindManyArea, useFindManyAssignmentCategory, useFindManyRequestCategory } from '@/services/api/hooks';
import { Rotate3DIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsBoolean, useQueryState } from 'nuqs';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { AssignmentHierarchyDefaultArgs, AssignmentLevelType, RequestHierarchyDefaultArgs, RequestLevelType } from '@/types/prisma/hierarchy';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertBanner } from '@/components/custom-ui/alert-banner';
import Select from '@/components/custom-ui/select';
import { FormItem } from '@/components/shared/form-root';

import { AssignmentCategoriesSelect, assignmentCategorySelectSchema } from '../../category/assignment-categories-select';
import { RequestCategoriesSelect, requestCategorySelectSchema } from '../../category/request-categories-select';

export const combinedCategoriesSchema = z.object({
  areaId: z.object({ value: z.string(), label: z.string() }),
  requestCategory: z.array(requestCategorySelectSchema),
  assignmentCategory: z.array(assignmentCategorySelectSchema),
});

export const getDefaultCombinedCategoriesValues = (): CombinedCategoriesValues => ({
  areaId: { value: '', label: '' },
  requestCategory: [],
  assignmentCategory: [],
});

export type CombinedCategoriesValues = z.infer<typeof combinedCategoriesSchema>;

const ClassificationStep: FC = ({}) => {
  const t = useTranslations('admin.request.form.classificationStep');
  const [isReassigning] = useQueryState('reassign', parseAsBoolean.withDefault(false));

  const { control, watch } = useFormContext<CombinedCategoriesValues>();

  const [requestLevelTypes, setRequestLevelTypes] = useState<RequestLevelType[]>([]);
  const [assignmentLevelTypes, setAssignmentLevelTypes] = useState<AssignmentLevelType[]>([]);
  const areaValue = watch('areaId');
  const areaId = areaValue?.value || '';

  const { data: areas = [], isLoading } = useFindManyArea({
    select: { id: true, name: true, description: true },
  });

  const areaOptions = useMemo(() => areas.map((a) => ({ label: a.name, value: a.id })), [areas]);

  const { data: requestCategories = [], isLoading: isRequestCategoriesLoading } = useFindManyRequestCategory({
    select: {
      id: true,
      name: true,
      description: true,
      hierarchy: { ...RequestHierarchyDefaultArgs },
    },
    where: { parentCategoryId: null },
  });

  const requestCategoryOptions = useMemo(() => requestCategories.map(({ id, name }) => ({ label: name, value: id })), [requestCategories]);

  const { data: assignmentCategories = [], isLoading: isAssignmentCategoriesLoading } = useFindManyAssignmentCategory(
    {
      select: {
        id: true,
        name: true,
        description: true,
        hierarchy: { ...AssignmentHierarchyDefaultArgs },
      },
      where: { parentCategoryId: null, areaId },
    },
    {
      enabled: !!areaId,
    }
  );

  const assignmentCategoryOptions = useMemo(() => assignmentCategories.map(({ id, name }) => ({ label: name, value: id })), [assignmentCategories]);

  return (
    <>
      {isReassigning && <AlertBanner variant="warning" title={t('reassign.alertTitle')} description={t('reassign.alertDescription')} icon={<Rotate3DIcon className="h-5 w-5" />} />}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 flex-1 pr-2">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{t('requestCategory.title')}</CardTitle>
              <CardDescription>{t('requestCategory.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                <FormField
                  control={control}
                  name="requestCategory.0"
                  render={({ field }) => (
                    <FormItem
                      label={requestLevelTypes.length > 0 ? requestLevelTypes[0].name : t('requestCategory.defaultLabel')}
                      description={requestLevelTypes.length > 0 ? t('requestCategory.dynamicDescription', { category: requestLevelTypes[0].name }) : t('requestCategory.defaultDescription')}>
                      <Select
                        isLoading={isRequestCategoriesLoading}
                        isSearchable
                        isClearable
                        placeholder={t('requestCategory.selectPlaceholder')}
                        options={requestCategoryOptions}
                        onChange={(e) => {
                          field.onChange({ ...e, position: 0 });
                          const levelTypes = requestCategories.find((c) => c.id === e?.value)?.hierarchy.levels || [];
                          setRequestLevelTypes(levelTypes);
                        }}
                        value={field.value}
                      />
                    </FormItem>
                  )}
                />
                <RequestCategoriesSelect levels={requestLevelTypes.filter((l) => l.position !== 1)} />
              </div>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>{t('assignmentCategory.title')}</CardTitle>
              <CardDescription>{t('assignmentCategory.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                <FormField
                  control={control}
                  name="areaId"
                  render={({ field }) => (
                    <FormItem label={t('assignmentCategory.areaLabel')} description={t('assignmentCategory.areaDescription')}>
                      <Select
                        isLoading={isLoading}
                        placeholder={t('assignmentCategory.areaPlaceholder')}
                        isSearchable
                        isClearable
                        options={areaOptions}
                        onChange={field.onChange}
                        value={field.value}
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="assignmentCategory.0"
                  render={({ field }) => (
                    <FormItem
                      label={assignmentLevelTypes.length > 0 ? assignmentLevelTypes[0].name : t('assignmentCategory.defaultLabel')}
                      description={
                        assignmentLevelTypes.length > 0 ? t('assignmentCategory.dynamicDescription', { category: assignmentLevelTypes[0].name }) : t('assignmentCategory.defaultDescription')
                      }>
                      <Select
                        isLoading={isAssignmentCategoriesLoading}
                        isSearchable
                        isClearable
                        options={assignmentCategoryOptions}
                        onChange={(e) => {
                          field.onChange({ ...e, position: 0 });
                          const levelTypes = assignmentCategories.find((c) => c.id === e?.value)?.hierarchy.levels || [];
                          setAssignmentLevelTypes(levelTypes);
                        }}
                        value={field.value}
                        isDisabled={!areaId}
                        placeholder={areaId ? t('assignmentCategory.selectPlaceholder') : t('assignmentCategory.areaFirstPlaceholder')}
                      />
                    </FormItem>
                  )}
                />
                <AssignmentCategoriesSelect levels={assignmentLevelTypes.filter((l) => l.position !== 1)} areaId={areaId} />
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </>
  );
};

export default ClassificationStep;
