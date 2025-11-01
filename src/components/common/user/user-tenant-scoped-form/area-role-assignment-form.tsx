// File: AreaRoleAssignmentForm.tsx
'use client';

import React, { FC, useMemo } from 'react';
import { Plus, Trash } from 'lucide-react';
import { Control, FieldErrors, useController, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { AreaRoleOptionType } from '@/types/zenstackhq/user';
import { generateUuid } from '@/lib/id';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Select from '@/components/custom-ui/select';

// Schema for the area-role assignment form
export const areaRoleAssignmentFormSchema = z.object({
  areaRoles: z
    .array(
      z.object({
        id: z.string().uuid().default(generateUuid),
        areaId: z.object({
          value: z.string().min(1, 'Area is required'),
          label: z.string().min(1),
        }),
        roleId: z.object({
          value: z.string().min(1, 'Role is required'),
          label: z.string().min(1),
        }),
        isActive: z.boolean().default(true),
      })
    )
    .optional()
    .superRefine((areaRoles, ctx) => {
      const seen = new Set();
      if (!areaRoles) return;

      areaRoles.forEach((item, index) => {
        if (seen.has(item.areaId.value)) {
          ctx.addIssue({
            path: [`${index}.areaId`],
            code: z.ZodIssueCode.custom,
            message: `The area "${item.areaId.label}" was selected multiple times. Only one role per area is allowed.`,
          });
        } else {
          seen.add(item.areaId.value);
        }
      });
    }),
});

export const getDefaultAreaRoleAssignment = (): AreaRoleAssignmentFormValues => ({
  areaRoles: [],
});

export type AreaRoleAssignmentFormValues = z.infer<typeof areaRoleAssignmentFormSchema>;

export interface AreaRoleAssignmentFormProps {
  areaOptions: AreaRoleOptionType[];
}

// Helper to create a default area-role entry.
// If there is a default area provided with role options, it will preselect the first role.
export const getDefaultAreaRole = (area: AreaRoleOptionType) => ({
  id: generateUuid(),
  isActive: true,
  areaId: { value: String(area.value) || '', label: area.label || '' },
  roleId: area.roleOptions && area.roleOptions.length > 0 ? { value: String(area.roleOptions[0].value), label: area.roleOptions[0].label } : { value: '', label: '' },
});

const AreaRoleAssignmentForm: FC<AreaRoleAssignmentFormProps> = ({ areaOptions }) => {
  const { control, formState } = useFormContext<AreaRoleAssignmentFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'areaRoles', keyName: '_id' });

  // Function to append a new area-role assignment
  const onAppendArea = () => {
    if (areaOptions.length === 0) {
      toast.warning('No areas available');
      return;
    }
    // If exactly one area exists, use it as default; otherwise start with empty selection.
    const defaultArea = areaOptions.length === 1 ? areaOptions[0] : { value: '', label: '', roleOptions: [] };
    append(getDefaultAreaRole(defaultArea));
  };

  return (
    <div className="flex flex-col gap-2">
      {fields.map((row, index) => (
        <div key={row._id || index} className="flex w-full items-center gap-4 border rounded-md p-4">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4 flex-1 items-center">
            <AreaSelectField index={index} areaOptions={areaOptions} control={control} errors={formState.errors} />
            <RoleSelectField index={index} areaOptions={areaOptions} control={control} errors={formState.errors} />
            <FormField
              control={control}
              name={`areaRoles.${index}.isActive`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>{field.value ? 'Role is active' : 'Role is inactive'}</FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>
          <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
            <Trash className="size-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" role="combobox" size="sm" className="border-2 border-dashed" onClick={onAppendArea}>
        <Plus className="mr-2 size-4" />
        Add Area
      </Button>
    </div>
  );
};

interface AreaSelectFieldProps {
  index: number;
  areaOptions: AreaRoleOptionType[];
  control: Control<AreaRoleAssignmentFormValues>;
  errors: FieldErrors<AreaRoleAssignmentFormValues>;
}

// Component for selecting an area.
const AreaSelectField: FC<AreaSelectFieldProps> = ({ index, areaOptions, control, errors }) => {
  const { field } = useController({ name: `areaRoles.${index}.areaId`, control });
  return (
    <FormItem className="flex-1">
      <FormLabel>Area</FormLabel>
      <FormControl>
        <Select
          value={field.value}
          options={areaOptions}
          onChange={(selected) => {
            // When the area changes, update the selection.
            field.onChange(selected || null);
          }}
          className="w-full"
        />
      </FormControl>
      <FormDescription>{areaOptions.length === 0 ? 'No areas available' : 'Select an area'}</FormDescription>
      <FormMessage>{errors.areaRoles?.[index]?.areaId?.value?.message || errors.areaRoles?.[index]?.areaId?.label?.message || errors.areaRoles?.[index]?.areaId?.message}</FormMessage>
    </FormItem>
  );
};

interface RoleSelectFieldProps {
  index: number;
  areaOptions: AreaRoleOptionType[];
  control: Control<AreaRoleAssignmentFormValues>;
  errors: FieldErrors<AreaRoleAssignmentFormValues>;
}

// Component for selecting a role based on the selected area.
const RoleSelectField: FC<RoleSelectFieldProps> = ({ index, areaOptions, control, errors }) => {
  const { field } = useController({ name: `areaRoles.${index}.roleId`, control });
  // Watch the area selection to derive available roles.
  const selectedArea = useWatch({ control, name: `areaRoles.${index}.areaId` });
  const roleOptions = useMemo(() => {
    const area = areaOptions.find((opt) => opt.value === selectedArea?.value);
    return area ? area.roleOptions : [];
  }, [areaOptions, selectedArea]);

  return (
    <FormItem className="flex-1">
      <FormLabel>Role</FormLabel>
      <FormControl>
        <Select
          value={roleOptions.find((r) => r.value === field.value?.value) || null}
          options={roleOptions}
          onChange={(selected) => field.onChange(selected ? { value: selected.value, label: selected.label } : { value: '', label: '' })}
          className="w-full"
        />
      </FormControl>
      <FormDescription>Select a role for the selected area</FormDescription>
      <FormMessage>{errors.areaRoles?.[index]?.roleId?.value?.message || errors.areaRoles?.[index]?.roleId?.label?.message || errors.areaRoles?.[index]?.roleId?.message}</FormMessage>
    </FormItem>
  );
};

export default AreaRoleAssignmentForm;
