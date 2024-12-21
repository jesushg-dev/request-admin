'use client';

import React, { FC, useMemo } from 'react';
import { Plus, Trash } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { UserType } from '@/types/prisma/user';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
}

// Main Component
const UserRoleAssignmentForm: FC<UserRoleAssignmentFormProps> = ({ userArray, roleArray }) => {
  const { control, formState } = useFormContext<UserRoleFormValues>();
  const { fields: users, append: appendUser, remove: removeUser } = useFieldArray({ control, name: 'userRoles' });

  return (
    <div className="flex flex-1 flex-col gap-2">
      {users.map((user, index) => (
        <div key={user.id || index} className="relative flex items-end gap-2 rounded border p-4">
          {/* User Select Field */}
          <FormField
            control={control}
            name={`userRoles.${index}.userId`}
            render={({ field }) => {
              const availableUsers = useMemo(() => {
                const selectedUserIds = users.map((user) => user.userId);
                return userArray.filter((user) => user.id === field.value || !selectedUserIds.includes(user.id));
              }, [users, userArray, field.value]);

              return (
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
                  <FormMessage>{formState.errors.userRoles?.[index]?.userId?.message}</FormMessage>
                </FormItem>
              );
            }}
          />

          {/* Role Select Field */}
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
                  <FormDescription>Allow the user to have access to this area.</FormDescription>
                </div>
                <FormMessage />
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
      <Button type="button" variant="outline" role="combobox" size="sm" className="border-2 border-dashed" onClick={() => appendUser({ ...DEFAULT_USER })}>
        <Plus className="mr-2 size-4" />
        Add User
      </Button>
    </div>
  );
};

export default UserRoleAssignmentForm;
