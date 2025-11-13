'use client';

import { useMemo, type FC } from 'react';
import { Link } from '@/i18n/routing';
import { Plus, Trash } from 'lucide-react';
import { Control, FieldErrors, useController, useFieldArray, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { generateUuid } from '@/lib/id';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Select, { OptionType } from '@/components/custom-ui/select';

import { type TUserRoleSchema } from '@/services/schemas/user';

// Base schema for defineStepper (without internationalization)
// This is used only for the stepper definition
export const roleSchema = z.object({
  id: z.string().uuid().default(generateUuid),
  roleId: z.object({ value: z.string().min(1), label: z.string() }),
  isActive: z.boolean().default(true),
});

export const userRoleFormSchema = z.object({
  roles: z.array(roleSchema).optional(),
});

export const getDefaultUserRole = (): UserRoleFormValues => ({
  roles: [{ id: generateUuid(), roleId: { value: '', label: '' }, isActive: true }],
});

export type UserRoleFormValues = TUserRoleSchema;

interface UserRoleFormProps {
  tenantId: string;
  roleOptions: OptionType[];
}

const UserRoleForm: FC<UserRoleFormProps> = ({ tenantId, roleOptions }) => {
  const { control, formState } = useFormContext<UserRoleFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'roles' });

  const onAppendRole = () => {
    append({ id: generateUuid(), roleId: { value: '', label: '' }, isActive: true });
  };

  return (
    <div className="m-1 flex flex-col gap-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex w-full items-center gap-4 border rounded-md p-4">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4 flex-1 items-center">
            <RoleSelectField
              index={index}
              control={control}
              tenantId={tenantId}
              errors={formState.errors}
              roleOptions={roleOptions}
              selectedRoles={fields.map((role) => role.roleId?.value as string)}
            />
            <FormField
              control={control}
              name={`roles.${index}.isActive`}
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

      <Button type="button" variant="outline" role="combobox" size="sm" className="border-2 border-dashed" onClick={onAppendRole}>
        <Plus className="mr-2 size-4" />
        Add Role
      </Button>
    </div>
  );
};

interface RoleSelectFieldProps {
  index: number;
  roleOptions: OptionType[];
  control: Control<UserRoleFormValues>;
  selectedRoles: string[];
  errors: FieldErrors<UserRoleFormValues>;
  tenantId: string;
}

const RoleSelectField: FC<RoleSelectFieldProps> = ({ index, roleOptions, tenantId, control, selectedRoles, errors }) => {
  const { field } = useController({
    control,
    name: `roles.${index}.roleId`,
    rules: { required: 'Role is required' },
  });

  const filteredOptions = useMemo(() => {
    const currentValue = field.value?.value;
    return roleOptions.filter((option) => option.value === currentValue || !selectedRoles.includes(option.value as string));
  }, [roleOptions, selectedRoles, field.value]);

  return (
    <FormItem>
      <FormLabel>Select Role</FormLabel>
      <FormControl>
        <Select
          value={field.value}
          options={filteredOptions}
          onChange={(selected) => field.onChange(selected ? { value: selected.value, label: selected.label } : { value: '', label: '' })}
          placeholder="Select a role..."
        />
      </FormControl>
      <FormDescription>
        {field.value?.value ? (
          <Link
            target="_blank"
            href={{
              pathname: '/admin/[tenantId]/security/roles/[slug]',
              params: { tenantId, slug: field.value?.value },
            }}>
            See role details
          </Link>
        ) : (
          'No role selected'
        )}
      </FormDescription>
      <FormMessage>{errors.roles?.[index]?.roleId?.value?.message || errors.roles?.[index]?.roleId?.label?.message || errors.roles?.[index]?.roleId?.message}</FormMessage>
    </FormItem>
  );
};

export default UserRoleForm;
