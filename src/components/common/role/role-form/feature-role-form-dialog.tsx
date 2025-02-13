'use client';

import React from 'react';
import { FileCogIcon, HelpCircle } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';

import { ModuleWithFeaturesType } from '@/types/prisma/module';
import { generateUuid } from '@/lib/id';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import ConditionalDialogWrapper from '@/components/conditional-dialog-wrapper';
import { Hint } from '@/components/hint';

import { RoleFormBatchValues } from '.';

interface FeatureRoleFormDialogProps {
  roleIndex: number;
  modules: ModuleWithFeaturesType[];
  isBatch?: boolean;
}

export function FeatureRoleFormDialog({ roleIndex, modules, isBatch }: FeatureRoleFormDialogProps) {
  const { control, setValue } = useFormContext<RoleFormBatchValues>();
  const features = useWatch({ control, name: `roles.${roleIndex}.features`, defaultValue: [] });

  const toggleFeature = (feature: RoleFormBatchValues['roles'][0]['features'][0]) => {
    let found = false;

    const updatedFeatures = features.reduce(
      (acc, perm) => {
        if (perm.featureId === feature.featureId) {
          found = true;
          return [...acc, { ...perm, isActive: feature.isActive }];
        }
        return [...acc, perm];
      },
      [] as typeof features
    );

    if (!found) updatedFeatures.push(feature);

    setValue(`roles.${roleIndex}.features`, updatedFeatures);
  };

  return (
    <ConditionalDialogWrapper
      exitText="Close"
      isDialog={isBatch}
      title={`Role Features: #${roleIndex + 1}`}
      trigger={
        <Button type="button" className="relative" variant="outline" size="sm">
          <FileCogIcon className="size-4" />
        </Button>
      }>
      {/* Role Description */}
      <FormField
        control={control}
        name={`roles.${roleIndex}.description` as const}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Role Description" className="resize-none" {...field} />
            </FormControl>
            <FormDescription>Provide a description for the role</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <span className="text-sm">Role Features</span>
      <div className="flex-1 overflow-hidden rounded-lg border">
        <ScrollArea className="overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[200px]">Module</TableHead>
                <TableHead>Features</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((module) => (
                <TableRow key={module.id} className="hover:bg-transparent">
                  <TableCell className="align-top font-medium">
                    <div className="flex items-center gap-2">
                      {module.name}
                      {module.description && (
                        <Hint label={module.description}>
                          <HelpCircle className="text-muted-foreground h-4 w-4" />
                        </Hint>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="grid grid-cols-2 gap-4 py-1.5 md:grid-cols-3 lg:grid-cols-4">
                      {module.feature.map((feature) => {
                        const founded = features.find((perm) => perm.featureId === feature.id);
                        return (
                          <div key={feature.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${module.id}-${feature.id}`}
                              checked={founded?.isActive}
                              onCheckedChange={(checked) =>
                                toggleFeature({
                                  id: founded?.id ?? generateUuid(),
                                  moduleId: module.id,
                                  moduleName: module.name,
                                  moduleDescription: module.description,
                                  featureId: feature.id,
                                  featureName: feature.name,
                                  featureDescription: feature.description,
                                  isActive: checked === 'indeterminate' ? false : checked,
                                })
                              }
                            />
                            <Hint label={feature.description ?? ''}>
                              <label htmlFor={`${module.id}-${feature.id}`} className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {feature.name}
                              </label>
                            </Hint>
                          </div>
                        );
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
      <FormDescription>Select the features that users with this role should have access to. If a feature is not selected, users with this role will not have access to it.</FormDescription>

      <FormField
        control={control}
        name={`roles.${roleIndex}.isActive` as const}
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Active</FormLabel>
              <FormDescription>If the role is active, users assigned to this role will have access to the selected features.</FormDescription>
            </div>
          </FormItem>
        )}
      />
    </ConditionalDialogWrapper>
  );
}
