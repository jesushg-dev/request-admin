'use client';

import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ===================
// Zod Schemas
// ===================
// Schema for a role entry
export const roleSchema = z.object({
  roleId: z.string().nonempty({ message: 'error.roleRequired' }),
});

// Schema for the entire form
export const userRoleFormSchema = z.object({
  roles: z.array(roleSchema),
});

// Type for the form values
export type UserRoleFormValues = z.infer<typeof userRoleFormSchema>;

// ===================
// Mock Data
// ===================
// Mock data for roles (replace with actual data fetching)
const roles = [
  {
    id: '1',
    name: 'Admin',
    modules: [
      {
        name: 'Users',
        permissions: [{ name: 'Create' }, { name: 'Read' }, { name: 'Update' }, { name: 'Delete' }],
      },
    ],
  },
  {
    id: '2',
    name: 'Editor',
    modules: [
      {
        name: 'Content',
        permissions: [{ name: 'Create' }, { name: 'Read' }, { name: 'Update' }],
      },
    ],
  },
  {
    id: '3',
    name: 'Viewer',
    modules: [
      {
        name: 'Reports',
        permissions: [{ name: 'Read' }],
      },
    ],
  },
];

export function UserRoleForm() {
  const { control, setValue } = useFormContext<UserRoleFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'roles',
  });

  // State to store selected role details for each field
  const [selectedRoles, setSelectedRoles] = useState<((typeof roles)[0] | null)[]>(fields.map(() => null));

  // Handle role change by updating the form field and selectedRoles state
  const handleRoleChange = (roleId: string, index: number) => {
    setValue(`roles.${index}.roleId`, roleId);
    setSelectedRoles((prev) => {
      const newSelectedRoles = [...prev];
      newSelectedRoles[index] = roles.find((role) => role.id === roleId) || null;
      return newSelectedRoles;
    });
  };

  return (
    <div className="m-1 flex flex-col gap-2">
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-4 rounded-md border p-4">
          <h3 className="font-medium">{`Role ${index + 1}`}</h3>

          {/* Role Selection Field */}
          <FormField
            control={control}
            name={`roles.${index}.roleId`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{'role.select'}</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={(value) => handleRoleChange(value, index)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tooltip to display role details */}
          {selectedRoles[index] && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">{'role.viewDetails'}</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div>
                    <h3 className="font-bold">{selectedRoles[index]?.name} Modules:</h3>
                    <ul>
                      {selectedRoles[index]?.modules.map((module, moduleIndex) => (
                        <li key={moduleIndex}>
                          {module.name}: {module.permissions.map((p) => p.name).join(', ')}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <Button variant="destructive" onClick={() => remove(index)}>
            {'role.remove'}
          </Button>
        </div>
      ))}

      <Button type="button" onClick={() => append({ roleId: '' })}>
        {'role.add'}
      </Button>
    </div>
  );
}

/*
File Location Guide:
- Place this component in your components directory, for example: /components/UserRoleForm.tsx.
- The Zod schemas can be moved to a separate file (e.g., /app/schemas/userRoleFormSchema.ts) for reusability.
*/
