'use client';

import React, { FC, useMemo } from 'react';
import { Plus, Trash } from 'lucide-react';
import { Control, FieldErrors, useController, useFieldArray, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Select, { OptionType } from '@/components/select/select';

export const userRoleFormSchema = z.object({
  userRoles: z
    .array(
      z.object({
        id: z.string().optional(),
        userId: z.object({
          value: z.string().min(1, 'User is required'),
          label: z.string().min(1),
        }),
        roleId: z.object({
          value: z.string().min(1, 'Role is required'),
          label: z.string().min(1),
        }),
        isActive: z.boolean().default(true),
      })
    )
    .nonempty('At least one user role must be added'),
});

export type UserRoleFormValues = z.infer<typeof userRoleFormSchema>;

export const DEFAULT_USER = {
  id: undefined,
  userId: { value: '', label: '' },
  roleId: { value: 'Predefined', label: 'Predefined' },
  isActive: true,
};

interface UserRoleAssignmentFormProps {
  userOptions: OptionType[];
  roleArray: { id: string; name: string }[];
  predefinedRole?: string | null;
}

const UserRoleAssignmentForm: FC<UserRoleAssignmentFormProps> = ({ userOptions, roleArray, predefinedRole }) => {
  const { control, formState } = useFormContext<UserRoleFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'userRoles', keyName: '_id' });

  const roleOptions: OptionType[] = useMemo(() => roleArray.map((r) => ({ value: r.id, label: r.name })), [roleArray]);

  const onAppendUser = () => {
    const newUser = { ...DEFAULT_USER };
    append(newUser);
  };

  return (
    <div className="flex flex-col gap-2">
      {fields.map((row, index) => (
        <div key={row._id || index} className="flex w-full items-center gap-4 border rounded-md p-4">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4 flex-1 items-center">
            <UserSelectField index={index} userArray={userOptions} selectedUsers={fields.map((u) => u.userId.value)} control={control} errors={formState.errors} />
            {predefinedRole ? (
              <input type="hidden" value={predefinedRole} {...control.register(`userRoles.${index}.roleId.value`)} />
            ) : (
              <RoleSelectField index={index} roleArray={roleOptions} control={control} errors={formState.errors} />
            )}
            <FormField
              control={control}
              name={`userRoles.${index}.isActive`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} id={`userRoles.${index}.isActive`} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel htmlFor={`userRoles.${index}.isActive`}>Active</FormLabel>
                    <FormDescription>{field.value ? 'User will have access to the system with the selected role' : 'User will not have access to the system'}</FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>
          {!row.id && (
            <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
              <Trash className="size-4" />
            </Button>
          )}
        </div>
      ))}
      <Button type="button" variant="outline" role="combobox" size="sm" className="border-2 border-dashed" onClick={onAppendUser}>
        <Plus className="mr-2 size-4" />
        Add User
      </Button>
    </div>
  );
};

interface UserSelectFieldProps {
  index: number;
  userArray: OptionType[];
  selectedUsers: string[];
  control: Control<UserRoleFormValues>;
  errors: FieldErrors<UserRoleFormValues>;
}

const UserSelectField: FC<UserSelectFieldProps> = ({ index, userArray, selectedUsers, control, errors }) => {
  const { field } = useController({ name: `userRoles.${index}.userId`, control });
  const currentValue = field.value?.value;
  const filteredUsers = useMemo(() => userArray.filter((opt) => opt.value === currentValue || !selectedUsers.includes(opt.value as string)), [userArray, selectedUsers, currentValue]);
  return (
    <FormItem className="flex-1">
      <FormLabel>User</FormLabel>
      <FormControl>
        <Select
          value={filteredUsers.find((opt) => opt.value === currentValue) || null}
          options={filteredUsers}
          onChange={(selected) => field.onChange(selected ? { value: selected.value, label: selected.label } : { value: '', label: '' })}
          className="w-full"
        />
      </FormControl>
      <FormDescription>{filteredUsers.length === 0 ? 'No users available' : 'Select a user for the role'}</FormDescription>
      <FormMessage>{errors.userRoles?.[index]?.userId?.value?.message || errors.userRoles?.[index]?.userId?.label?.message || errors.userRoles?.[index]?.userId?.message}</FormMessage>
    </FormItem>
  );
};

interface RoleSelectFieldProps {
  index: number;
  roleArray: OptionType[];
  control: Control<UserRoleFormValues>;
  errors: FieldErrors<UserRoleFormValues>;
}

const RoleSelectField: FC<RoleSelectFieldProps> = ({ index, roleArray, control, errors }) => {
  const { field } = useController({ name: `userRoles.${index}.roleId`, control });
  const currentValue = field.value?.value;
  return (
    <FormItem className="flex-1">
      <FormLabel>Role</FormLabel>
      <FormControl>
        <Select
          value={roleArray.find((r) => r.value === currentValue) || null}
          options={roleArray}
          onChange={(selected) => field.onChange(selected ? { value: selected.value, label: selected.label } : { value: '', label: '' })}
          className="w-full"
        />
      </FormControl>
      <FormMessage>{errors.userRoles?.[index]?.roleId?.value?.message || errors.userRoles?.[index]?.roleId?.label?.message || errors.userRoles?.[index]?.roleId?.message}</FormMessage>
      <FormMessage />
    </FormItem>
  );
};

export default UserRoleAssignmentForm;
