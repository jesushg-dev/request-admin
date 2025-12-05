import { type TLevelsSchema } from '@/services/schemas/hierarchy';
import { DragHandleDots2Icon, TrashIcon } from '@radix-ui/react-icons';
import { AlertTriangleIcon, FileCogIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { generateUuid } from '@/lib/id';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sortable, SortableDragHandle, SortableItem } from '@/components/ui/sortable';
import { Textarea } from '@/components/ui/textarea';

export type LevelsFormValues = TLevelsSchema;

export function LevelsStep({ isInUse = false }: { isInUse?: boolean }) {
  const t = useTranslations('admin.hierarchy.stepsForm');
  const { control, getValues } = useFormContext<LevelsFormValues>();
  const { fields, append, move, remove } = useFieldArray({
    control,
    name: 'levels',
  });

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex-col flex overflow-hidden gap-4">
        {isInUse && (
          <Alert variant="destructive">
            <AlertTriangleIcon className="size-5" />
            <AlertTitle>{t('inUseTitle')}</AlertTitle>
            <AlertDescription>{t('inUseDescription')}</AlertDescription>
          </Alert>
        )}

        <ScrollArea className="w-full flex-1 overflow-y-hidden">
          <Sortable
            value={fields}
            onMove={({ activeIndex, overIndex }) => !isInUse && move(activeIndex, overIndex)}
            overlay={
              <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 pl-8">
                <div className="bg-primary/10 h-10 w-10 rounded-md" />
                <div className="bg-primary/10 h-10 w-full rounded-md" />
                <div className="bg-primary/10 h-10 w-10 rounded-md" />
                <div className="bg-primary/10 h-10 w-10 rounded-md" />
              </div>
            }>
            <div className="flex flex-col gap-4">
              {fields.map((field, index) => (
                <SortableItem key={field.id} value={field.id} asChild>
                  <div className="mx-1 group relative flex items-center gap-3 border-l-4 border-primary/20 pl-4 pb-1 transition-all hover:border-primary/40 hover:bg-accent/50">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      {index > 0 && <span className="text-2xl">├</span>}
                    </div>

                    <SortableDragHandle variant="ghost" size="sm" className={`opacity-60 hover:opacity-100 ${isInUse ? 'cursor-not-allowed opacity-30' : ''}`} disabled={isInUse}>
                      <DragHandleDots2Icon className="size-5" />
                    </SortableDragHandle>

                    <FormField
                      control={control}
                      name={`levels.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-xs font-medium text-muted-foreground">{t('levelLabel', { number: index + 1 })}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('levelPlaceholder')} {...field} className="font-medium" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="ghost" size="sm" className="opacity-60 hover:opacity-100">
                          <FileCogIcon className="size-5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <FormField
                          control={control}
                          name={`levels.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('levelDescriptionLabel', { number: index + 1 })}</FormLabel>
                              <FormControl>
                                <Textarea placeholder={t('levelDescriptionPlaceholder', { name: getValues().levels[index].name || t('thisLevel') })} {...field} />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </PopoverContent>
                    </Popover>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className={`opacity-60 hover:opacity-100 hover:text-destructive ${isInUse ? 'cursor-not-allowed opacity-30' : ''}`}
                      disabled={isInUse}>
                      <TrashIcon className="size-5" />
                    </Button>
                  </div>
                </SortableItem>
              ))}
            </div>
          </Sortable>
        </ScrollArea>

        <Button
          type="button"
          variant="outline"
          role="combobox"
          size="sm"
          className={`border-2 border-dashed ${isInUse ? 'cursor-not-allowed opacity-50' : ''}`}
          disabled={isInUse}
          onClick={() => !isInUse && append({ id: generateUuid(), name: '', description: '', isActive: true })}>
          {isInUse ? t('addDisabled') : t('add')}
        </Button>
      </CardContent>
    </Card>
  );
}
