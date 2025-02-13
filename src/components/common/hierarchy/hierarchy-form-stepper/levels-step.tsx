import { DragHandleDots2Icon, TrashIcon } from '@radix-ui/react-icons';
import { AlertTriangleIcon, FileCogIcon } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { generateUuid } from '@/lib/id';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sortable, SortableDragHandle, SortableItem } from '@/components/ui/sortable';
import { Textarea } from '@/components/ui/textarea';

export const levelsSchema = z.object({
  levels: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(1, 'Level name is required').max(100, 'Level name must be 100 characters or less'),
        description: z.string().max(255, 'Description must be 255 characters or less').optional(),
        isActive: z.boolean().default(true),
      })
    )
    .min(1, 'At least one hierarchy level is required'),
});

export type LevelsFormValues = z.infer<typeof levelsSchema>;

export function LevelsStep({ isInUse = false }: { isInUse?: boolean }) {
  const { control, getValues } = useFormContext<LevelsFormValues>();
  const { fields, append, move, remove } = useFieldArray({
    control,
    name: 'levels',
  });

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Niveles de Jerarquía</h3>
        <p className="text-sm text-muted-foreground">La jerarquía es fija. No se pueden eliminar ni reordenar niveles cuando está en uso.</p>
      </div>

      {isInUse && (
        <Alert variant="destructive">
          <AlertTriangleIcon className="size-5" />
          <AlertTitle>Jerarquía en Uso</AlertTitle>
          <AlertDescription>No puedes modificar la estructura, pero puedes editar los nombres y descripciones.</AlertDescription>
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
                        <FormLabel className="text-xs font-medium text-muted-foreground">Nivel {index + 1}</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Canal de Venta" {...field} className="font-medium" />
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
                            <FormLabel>Descripción del Nivel {index + 1}</FormLabel>
                            <FormControl>
                              <Textarea placeholder={`Ej: Especificaciones para ${getValues().levels[index].name || 'este nivel'}`} {...field} />
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
        {isInUse ? 'No se pueden agregar nuevos niveles' : 'Agregar nuevo nivel'}
      </Button>
    </div>
  );
}
