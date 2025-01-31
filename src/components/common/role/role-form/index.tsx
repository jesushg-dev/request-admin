'use client';

import React, { FC } from 'react';
import { Plus, Trash } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { ModuleWithFeaturesType } from '@/types/prisma/module';
import { Button } from '@/components/ui/button';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { FeatureRoleFormDialog } from './feature-role-form-dialog';

// Default role structure
export const DEFAULT_ROLE = {
  id: undefined,
  name: '',
  description: '',
  features: [],
};

// Validation Schema
export const rolesFormSchema = z.object({
  roles: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(3, 'Role Name must be at least 3 characters').max(100, 'Role Name must not exceed 100 characters'),
        description: z.string().max(255, 'Description must not exceed 255 characters').optional(),
        isActive: z.boolean().optional(),
        features: z.array(
          z.object({
            id: z.string().optional(),
            moduleId: z.string(),
            moduleName: z.string(),
            moduleDescription: z.string().nullable(),
            featureId: z.string(),
            featureName: z.string(),
            featureDescription: z.string().nullable(),
            isActive: z.boolean().optional(),
          })
        ),
      })
    )
    .nonempty('At least one role is required'),
});

// Types
export type RoleFormBatchValues = z.infer<typeof rolesFormSchema>;

interface RolesFormProps {
  isBatch?: boolean;
  moduleWithFeatures: ModuleWithFeaturesType[];
}

const RolesForm: FC<RolesFormProps> = ({ moduleWithFeatures, isBatch }) => {
  const { control } = useFormContext<RoleFormBatchValues>();
  const { fields: roles, append: appendRole, remove: removeRole } = useFieldArray({ control, name: 'roles' });

  const addRole = () => appendRole({ ...DEFAULT_ROLE });

  return (
    <div className="mx-1 mr-4 flex flex-col gap-2">
      {roles.map((role, roleIndex) => (
        <div key={role.id || roleIndex} className={`relative flex ${isBatch ? 'items-end rounded border p-4' : 'flex-col'} gap-2`}>
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
                <FormDescription>Role Name must be at least 3 characters and not exceed 100 characters</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FeatureRoleFormDialog roleIndex={roleIndex} modules={moduleWithFeatures} isBatch={isBatch} />

          {isBatch && (
            <Button type="button" className="relative" variant="destructive" size="sm" onClick={() => removeRole(roleIndex)}>
              <Trash className="size-4" />
            </Button>
          )}
        </div>
      ))}
      {isBatch && (
        <Button type="button" variant="outline" role="combobox" size="sm" className="border-2 border-dashed" onClick={addRole}>
          <Plus className="mr-2 size-4" />
          Add Role
        </Button>
      )}
    </div>
  );
};

export default RolesForm;
