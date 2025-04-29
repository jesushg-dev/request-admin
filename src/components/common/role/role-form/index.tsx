'use client';

import React, { FC } from 'react';
import { CombineIcon, Plus, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { ModuleWithFeaturesType } from '@/types/prisma/module';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Hint } from '@/components/hint';

import { generateUuid } from '../../../../../prisma/util';
import { FeatureRoleFormDialog } from './feature-role-form-dialog';

// Default role structure
export const getDefaultRole = () => ({
  id: generateUuid(),
  name: '',
  description: '',
  features: [],
  isActive: true,
});

// Validation Schema
export const rolesFormSchema = z.object({
  roles: z
    .array(
      z.object({
        id: z.string().uuid().default(generateUuid),
        name: z.string().min(3, 'Role Name must be at least 3 characters').max(100, 'Role Name must not exceed 100 characters'),
        description: z.string().max(255, 'Description must not exceed 255 characters').optional(),
        isActive: z.boolean(),
        features: z.array(
          z.object({
            id: z.string().uuid().default(generateUuid),
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
    .superRefine((roles, ctx) => {
      const seen = new Set<string>();
      roles.forEach((role, index) => {
        if (seen.has(role.name)) {
          ctx.addIssue({
            path: [`${index}.name`],
            code: z.ZodIssueCode.custom,
            message: `The role name "${role.name}" is duplicated.`,
          });
        } else {
          seen.add(role.name);
        }
      });
    }),
});

// Types
export type RoleFormBatchValues = z.infer<typeof rolesFormSchema>;

interface RolesFormProps {
  isBatch?: boolean;
  moduleWithFeatures: ModuleWithFeaturesType[];
}

// todo: Add Role Template to allow for pre-defined roles to be added to the form in a batch or individually

const RolesForm: FC<RolesFormProps> = ({ moduleWithFeatures, isBatch }) => {
  const t = useTranslations('component.rolesForm');
  const { control } = useFormContext<RoleFormBatchValues>();
  const { fields: roles, append: appendRole, remove: removeRole } = useFieldArray({ control, name: 'roles' });

  const addRole = () => appendRole(getDefaultRole());

  return (
    <div className="mx-1 mr-4 flex flex-col gap-2">
      {roles.map((role, roleIndex) => (
        <div key={role.id || roleIndex} className={`relative flex ${isBatch ? 'items-center rounded border p-4' : 'flex-col'} gap-2`}>
          {/* Role Name */}
          <FormField
            control={control}
            name={`roles.${roleIndex}.name` as const}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t('roleName')}</FormLabel>
                <FormControl>
                  <Input className="h-8 w-full rounded" placeholder={t('roleNamePlaceholder')} {...field} />
                </FormControl>
                <div className="flex w-full justify-between gap-4 items-center">
                  <div>
                    <FormMessage />
                    <FormDescription>{t('roleNameDescription')}</FormDescription>
                  </div>
                  <RoleCategoryBadges roleIndex={roleIndex} />
                </div>
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
          {t('addRole')}
        </Button>
      )}
    </div>
  );
};

const RoleCategoryBadges: FC<{ roleIndex: number }> = ({ roleIndex }) => {
  const t = useTranslations('component.rolesForm');
  const { watch } = useFormContext<RoleFormBatchValues>();
  const forms = watch(`roles.${roleIndex}.features`);
  const formsActiveCount = forms.filter((form) => form.isActive).length;
  const isActive = watch(`roles.${roleIndex}.isActive`);

  return (
    <div className="flex gap-2">
      <Hint label={t('featureCountTooltip', { count: forms.length })}>
        <Badge className="flex gap-1" variant="outline">
          <CombineIcon className="size-3" />
          {formsActiveCount}
        </Badge>
      </Hint>
      <Hint label={t('roleStatusTooltip')}>
        <Badge className="flex gap-1" variant={isActive ? 'outline' : 'destructive'}>
          {isActive ? t('active') : t('inactive')}
        </Badge>
      </Hint>
    </div>
  );
};

export default RolesForm;
