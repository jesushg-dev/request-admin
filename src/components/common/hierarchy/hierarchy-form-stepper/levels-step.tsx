import { DragHandleDots2Icon, TrashIcon } from '@radix-ui/react-icons';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Sortable, SortableDragHandle, SortableItem } from '@/components/ui/sortable';

import { HierarchyFormValues } from './schemas';

export function LevelsStep() {
  const { control } = useFormContext<HierarchyFormValues>();
  const { fields, append, move, remove } = useFieldArray({
    control,
    name: 'levels',
  });

  return (
    <div className="m-1 flex flex-col gap-2">
      <Sortable
        value={fields}
        onMove={({ activeIndex, overIndex }) => move(activeIndex, overIndex)}
        overlay={
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
            <div className="h-10 w-full rounded-md bg-primary/10" />
            <div className="h-10 w-10 shrink-0 rounded-md bg-primary/10" />
            <div className="h-10 w-10 shrink-0 rounded-md bg-primary/10" />
          </div>
        }>
        <div className="flex w-full flex-col gap-2">
          {fields.map((field, index) => (
            <SortableItem key={field.id} value={field.id} asChild>
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                <FormField
                  control={control}
                  name={`levels.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder={`Level ${index + 1} name`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SortableDragHandle variant="outline" size="icon" className="h-10 w-10 shrink-0">
                  <DragHandleDots2Icon className="h-4 w-4" aria-hidden="true" />
                </SortableDragHandle>
                <Button type="button" variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={() => remove(index)} disabled={fields.length === 1}>
                  <TrashIcon className="h-4 w-4 text-destructive" aria-hidden="true" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            </SortableItem>
          ))}
        </div>
      </Sortable>
      <Button type="button" variant="outline" role="combobox" size="sm" className="border-2 border-dashed" onClick={() => append({ name: '' })}>
        Add Level
      </Button>
    </div>
  );
}
