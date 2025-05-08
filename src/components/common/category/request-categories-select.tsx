import { useEffect, useMemo, type FC } from 'react';
import { useFindManyRequestCategory } from '@/services/api/hooks';
import { useTranslations } from 'next-intl';
import { ControllerRenderProps, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { RequestLevelType } from '@/types/prisma/hierarchy';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Select from '@/components/custom-ui/select';

export const requestCategorySelectSchema = z.object({
  label: z.string(),
  value: z.string().nonempty('This field is required.'),
  position: z.number(),
});

export type RequestCategorySelectFormValues = z.infer<typeof requestCategorySelectSchema>;

export const requestCategorySelectArraySchema = z.object({
  requestCategory: z.array(requestCategorySelectSchema),
});

export type RequestCategorySelectArrayValues = z.infer<typeof requestCategorySelectArraySchema>;

type RequestCategoriesSelectProps = {
  levels: RequestLevelType[];
};

export const RequestCategoriesSelect: FC<RequestCategoriesSelectProps> = ({ levels }) => {
  const { control, watch, setValue } = useFormContext<RequestCategorySelectArrayValues>();
  const watchedFields = watch('requestCategory', []);
  const lastSelectedIndex = watchedFields.findLastIndex((field) => !!field?.value);
  const activeLevel = lastSelectedIndex === -1 ? 0 : lastSelectedIndex + 1;

  const handleClearLevels = (startIndex: number) => {
    for (let i = startIndex; i < levels.length; i++) {
      setValue(`requestCategory.${i}`, { label: '', value: '', position: levels[i].position });
    }
  };

  return (
    <>
      {levels.map((level) => {
        const currentPosition = level.position - 1;
        return (
          <FormField
            key={`${level.id}-${currentPosition}`}
            control={control}
            name={`requestCategory.${currentPosition}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{level.name}</FormLabel>
                <SingleRequestCategorySelect
                  field={field}
                  position={currentPosition}
                  hierarchyLevelName={level.name}
                  enabled={currentPosition <= activeLevel}
                  onClearNextLevels={() => handleClearLevels(currentPosition + 1)}
                  parentCategoryId={currentPosition > 0 ? watchedFields[currentPosition - 1]?.value : ''}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        );
      })}
    </>
  );
};

type SingleRequestCategorySelectProps = {
  enabled: boolean;
  position: number;
  hierarchyLevelName: string;
  parentCategoryId?: string;
  onClearNextLevels: () => void;
  field: ControllerRenderProps<RequestCategorySelectArrayValues, `requestCategory.${number}`>;
};

const SingleRequestCategorySelect: React.FC<SingleRequestCategorySelectProps> = ({ field, parentCategoryId, hierarchyLevelName, enabled, position, onClearNextLevels }) => {
  const t = useTranslations('admin.request.form.classificationStep');
  const { data: categories = [], isLoading } = useFindManyRequestCategory(
    {
      select: { id: true, name: true, description: true },
      where: { parentCategoryId: parentCategoryId ?? null },
    },
    { enabled, staleTime: 60000 }
  );

  const options = useMemo(() => categories.map(({ id, name }) => ({ label: name, value: id })), [categories]);

  useEffect(() => {
    if (!enabled || !field.value?.value || isLoading) return;
    const currentValue = field.value.value;
    const exists = categories.some((c) => c.id === currentValue);
    if (!exists) {
      field.onChange({ label: '', value: '', position });
      onClearNextLevels();
    }
  }, [categories, enabled, onClearNextLevels, position, field, isLoading]);

  return (
    <>
      <FormControl>
        <Select
          isClearable
          isSearchable
          options={options}
          isLoading={isLoading}
          onChange={(option) => {
            const newValue = option ? { ...option, position } : { label: '', value: '', position };
            if (newValue.value !== field.value?.value) {
              field.onChange(newValue);
              onClearNextLevels();
            }
          }}
          value={field.value}
          menuShouldScrollIntoView={false}
          placeholder={t('requestCategory.selectPlaceholder')}
        />
      </FormControl>
      <FormDescription>{isLoading ? t('common.loading') : t('assignmentCategory.selectDescription', { level: hierarchyLevelName.toLowerCase() })}</FormDescription>{' '}
    </>
  );
};
