'use client';

import React, { FC, useState } from 'react';
import { Plus, Settings, Trash } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { ModuleWithPermissionsType } from '@/types/prisma/module';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { PermissionRoleFormDialog } from './permission-role-form-dialog';

// Default role structure
const DEFAULT_ROLE = {
  id: undefined,
  name: '',
  description: '',
  permissions: [],
};

// Validation Schema
export const areaRolesFormSchema = z.object({
  roles: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(3, 'Role Name must be at least 3 characters').max(100, 'Role Name must not exceed 100 characters'),
        description: z.string().max(255, 'Description must not exceed 255 characters').optional(),
        permissions: z.array(
          z.object({
            id: z.string(),
            moduleId: z.string(),
            name: z.string(),
            description: z.string().optional(),
          })
        ),
      })
    )
    .nonempty('At least one role is required'),
});

// Types
export type RoleFormValues = z.infer<typeof areaRolesFormSchema>;

interface AreaRolesFormProps {
  moduleWithPermissions: ModuleWithPermissionsType[];
}

const AreaRolesForm: FC<AreaRolesFormProps> = ({ moduleWithPermissions }) => {
  const { control, formState } = useFormContext<RoleFormValues>();
  console.log('🚀 ~ formState:', formState.errors);
  const { fields: roles, append: appendRole, remove: removeRole } = useFieldArray({ control, name: 'roles' });

  const addRole = () => appendRole({ ...DEFAULT_ROLE });

  return (
    <div className="flex flex-col gap-2">
      {roles.map((role, roleIndex) => (
        <div key={role.id || roleIndex} className="relative flex items-end gap-2 rounded border p-4">
          {/* Role Name */}
          <FormField
            control={control}
            name={`roles.${roleIndex}.name` as const}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Role Name</FormLabel>
                <FormControl>
                  <Input className="h-8 w-full rounded" placeholder="Role Name" {...field} />
                </FormControl>
                {formState.errors.roles?.[roleIndex]?.name && <FormMessage>{formState.errors.roles[roleIndex].name?.message}</FormMessage>}
              </FormItem>
            )}
          />

          <PermissionRoleFormDialog roleIndex={roleIndex} modules={moduleWithPermissions} />

          <Button type="button" className="relative" variant="destructive" size="sm" onClick={() => removeRole(roleIndex)}>
            <Trash className="size-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" role="combobox" size="sm" className="border-2 border-dashed" onClick={addRole}>
        <Plus className="mr-2 size-4" />
        Add Role
      </Button>
    </div>
  );
};

export default AreaRolesForm;
