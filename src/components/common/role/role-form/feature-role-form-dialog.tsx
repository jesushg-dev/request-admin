'use client';

import React from 'react';
import { HelpCircle, Settings } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';

import { ModuleWithFeaturesType } from '@/types/prisma/module';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ConditionalDialogWrapper from '@/components/conditional-dialog-wrapper';

interface FeatureRoleFormDialogProps {
  roleIndex: number;
  modules: ModuleWithFeaturesType[];
  isBatch?: boolean;
}

export function FeatureRoleFormDialog({ roleIndex, modules, isBatch }: FeatureRoleFormDialogProps) {
  const { control, setValue } = useFormContext();
  const features = useWatch({ control, name: `roles.${roleIndex}.features`, defaultValue: [] });

  const toggleFeature = (moduleId: string, featureId: string, featureName: string, isChecked: boolean) => {
    if (isChecked) {
      setValue(`roles.${roleIndex}.features`, [...features, { id: featureId, moduleId, name: featureName }]);
    } else {
      setValue(
        `roles.${roleIndex}.features`,
        features.filter((perm: { id: string }) => perm.id !== featureId)
      );
    }
  };

  return (
    <ConditionalDialogWrapper
      isDialog={isBatch}
      trigger={
        <Button type="button" className="relative" variant="outline" size="sm">
          <Settings className="size-4" />
          {/*requirementsCount && (
            <Badge className="absolute -right-2 -top-2 px-1 py-0 text-[10px]">
              <span>{requirementsCount > 9 ? '9+' : requirementsCount}</span>
            </Badge>
          )*/}
        </Button>
      }
      title="Role Features">
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
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="text-muted-foreground h-4 w-4" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{module.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="grid grid-cols-2 gap-4 py-1.5 md:grid-cols-3 lg:grid-cols-4">
                      {module.feature.map((feature) => (
                        <div key={feature.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${module.id}-${feature.id}`}
                            checked={features.some((perm: { id: string; moduleId: string; name: string }) => perm.id === feature.id)}
                            onCheckedChange={(checked) => toggleFeature(module.id, feature.id, feature.name, checked as boolean)}
                          />
                          <label htmlFor={`${module.id}-${feature.id}`} className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {feature.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </ConditionalDialogWrapper>
  );
}
