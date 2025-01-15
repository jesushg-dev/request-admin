'use client';

import React, { FC, useMemo } from 'react';
import { Plus, Trash } from 'lucide-react';
import { Control, FieldErrors, useFieldArray, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { UserType } from '@/types/prisma/user';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Default User Object
const DEFAULT_USER = {
  id: undefined,
  userId: '',
  roleId: '',
  isActive: true,
};

// Zod Schema
export const userRoleFormSchema = z.object({
  userRoles: z
    .array(
      z.object({
        id: z.string().optional(),
        userId: z.string().min(1, 'User is required'),
        roleId: z.string().min(1, 'Role is required'),
        isActive: z.boolean().default(true),
      })
    )
    .nonempty('At least one user role must be added'),
});

// Types inferred from Zod schema
export type UserRoleFormValues = z.infer<typeof userRoleFormSchema>;

interface UserRoleAssignmentFormProps {
  userArray: UserType[];
  roleArray: { id: string; name: string }[];
  predefinedRole?: string | null;
}

// Main Component
const UserRoleAssignmentForm: FC<UserRoleAssignmentFormProps> = ({ userArray, roleArray, predefinedRole }) => {
  const { control, formState } = useFormContext<UserRoleFormValues>();
  const { fields: users, append: appendUser, remove: removeUser } = useFieldArray({ control, name: 'userRoles' });

  const onAppendUser = () => {
    appendUser(predefinedRole ? { ...DEFAULT_USER, roleId: predefinedRole } : DEFAULT_USER);
  };

  return (
    <div className="flex flex-1 flex-col gap-2">
      {users.map((user, index) => (
        <div key={user.id || index} className="relative flex items-end gap-2 rounded border p-4">
          {/* User Select Field */}
          <UserSelectField index={index} userArray={userArray} selectedUsers={users.map((u) => u.userId)} control={control} errors={formState.errors} />

          {/* If roles are predefined, use a hidden input field to store the role ID */}
          {predefinedRole ? (
            <FormField control={control} name={`userRoles.${index}.roleId`} render={() => <input type="hidden" value={predefinedRole} />} />
          ) : (
            <FormField
              control={control}
              name={`userRoles.${index}.roleId`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleArray.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage>{formState.errors.userRoles?.[index]?.roleId?.message}</FormMessage>
                </FormItem>
              )}
            />
          )}

          {/* Active Checkbox */}

          {/* Active Checkbox */}
          <FormField
            control={control}
            name={`userRoles.${index}.isActive`}
            render={({ field }) => (
              <FormItem className="flex flex-1 items-center space-x-3">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} id={`userRoles.${index}.isActive`} />
                </FormControl>
                <div>
                  <FormLabel htmlFor={`userRoles.${index}.isActive`}>Active</FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {/* Remove User Button */}
          <Button type="button" variant="destructive" size="sm" onClick={() => removeUser(index)}>
            <Trash className="size-4" />
          </Button>
        </div>
      ))}

      {/* Add User Button */}
      <Button type="button" variant="outline" role="combobox" size="sm" className="border-2 border-dashed" onClick={onAppendUser}>
        <Plus className="mr-2 size-4" />
        Add User
      </Button>
    </div>
  );
};

// User Select Field (Internal Function Component)

interface UserSelectFieldProps {
  index: number;
  userArray: UserType[];
  selectedUsers: string[];
  control: Control<UserRoleFormValues>;
  errors: FieldErrors<UserRoleFormValues>;
}

const UserSelectField: FC<UserSelectFieldProps> = ({ index, userArray, selectedUsers, control, errors }) => {
  const availableUsers = useMemo(() => {
    return userArray.filter((user) => !selectedUsers.includes(user.id));
  }, [userArray, selectedUsers]);

  return (
    <FormField
      control={control}
      name={`userRoles.${index}.userId`}
      render={({ field }) => (
        <FormItem className="flex-1">
          <FormLabel>User</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage>{errors.userRoles?.[index]?.userId?.message}</FormMessage>
        </FormItem>
      )}
    />
  );
};

export default UserRoleAssignmentForm;
