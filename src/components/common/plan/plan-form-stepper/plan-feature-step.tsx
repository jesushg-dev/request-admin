'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Settings2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

import { planFeatureSchema } from './schemas';

type PlanFeatureFormValues = z.infer<typeof planFeatureSchema>;

type Feature = {
  id: string;
  name: string;
  module: {
    id: string;
    name: string;
  };
};

interface PlanFeaturesStepProps {
  features: Feature[];
}

export function PlanFeaturesStep({ features }: PlanFeaturesStepProps) {
  const t = useTranslations('plans.form.featuresStep');
  const { control, watch } = useFormContext<PlanFeatureFormValues>();
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'features',
  });

  const selectedFeatures = watch('features') || [];
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());

  // Group features by module
  const featuresByModule = useMemo(() => {
    const grouped: Record<string, Feature[]> = {};
    features.forEach((feature) => {
      const moduleId = feature.module.id;
      if (!grouped[moduleId]) {
        grouped[moduleId] = [];
      }
      grouped[moduleId].push(feature);
    });
    return grouped;
  }, [features]);

  // Get module names
  const moduleMap = useMemo(() => {
    const map: Record<string, string> = {};
    features.forEach((feature) => {
      map[feature.module.id] = feature.module.name;
    });
    return map;
  }, [features]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const toggleFeature = (moduleId: string) => {
    setExpandedFeatures((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const isFeatureSelected = (featureId: string) => {
    return selectedFeatures.some((f) => f.featureId === featureId);
  };

  const getFeatureIndex = (featureId: string) => {
    return selectedFeatures.findIndex((f) => f.featureId === featureId);
  };

  const handleFeatureToggle = (featureId: string, checked: boolean) => {
    if (checked) {
      // Add feature
      append({
        featureId,
        dailyLimit: undefined,
        totalLimit: undefined,
        resetInterval: 'daily',
      });
      // Expand the feature configuration
      setExpandedFeatures((prev) => new Set(prev).add(featureId));
    } else {
      // Remove feature
      const index = getFeatureIndex(featureId);
      if (index !== -1) {
        remove(index);
      }
      setExpandedFeatures((prev) => {
        const next = new Set(prev);
        next.delete(featureId);
        return next;
      });
    }
  };

  const getSelectedCountForModule = (moduleId: string) => {
    const moduleFeatures = featuresByModule[moduleId] || [];
    return moduleFeatures.filter((f) => isFeatureSelected(f.id)).length;
  };

  const totalSelected = selectedFeatures.length;

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('header.title')}</CardTitle>
            <CardDescription>{t('header.description')}</CardDescription>
          </div>
          {totalSelected > 0 && (
            <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {totalSelected} {totalSelected === 1 ? t('featureSelected') : t('featuresSelected')}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex-col flex overflow-hidden gap-4">
        {Object.keys(featuresByModule).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">{t('noFeatures')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 overflow-y-auto">
            {Object.entries(featuresByModule).map(([moduleId, moduleFeatures]) => {
              const moduleName = moduleMap[moduleId];
              const isModuleExpanded = expandedModules.has(moduleId);
              const selectedCount = getSelectedCountForModule(moduleId);

              return (
                <Collapsible
                  key={moduleId}
                  open={isModuleExpanded}
                  onOpenChange={() => toggleModule(moduleId)}
                  className="border rounded-lg"
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        {isModuleExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{moduleName}</h3>
                            {selectedCount > 0 && (
                              <span className="text-xs text-muted-foreground">
                                ({selectedCount}/{moduleFeatures.length})
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {moduleFeatures.length} {moduleFeatures.length === 1 ? t('feature') : t('features')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-2">
                      {moduleFeatures.map((feature) => {
                        const isSelected = isFeatureSelected(feature.id);
                        const featureIndex = getFeatureIndex(feature.id);
                        const isFeatureExpanded = expandedFeatures.has(feature.id);

                        return (
                          <div
                            key={feature.id}
                            className={cn(
                              'border rounded-lg transition-all',
                              isSelected
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-border bg-card'
                            )}
                          >
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                  <FormField
                                    control={control}
                                    name={`features.${featureIndex}.featureId`}
                                    render={() => (
                                      <FormItem className="flex items-center space-x-2 space-y-0 mt-1">
                                        <FormControl>
                                          <Switch
                                            checked={isSelected}
                                            onCheckedChange={(checked) => handleFeatureToggle(feature.id, checked)}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium">{feature.name}</h4>
                                      {isSelected && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                          {t('enabled')}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {t('configureLimits')}
                                    </p>
                                  </div>
                                </div>
                                {isSelected && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleFeature(feature.id)}
                                    className="shrink-0"
                                  >
                                    <Settings2 className={cn('h-4 w-4 transition-transform', isFeatureExpanded && 'rotate-90')} />
                                  </Button>
                                )}
                              </div>

                              {isSelected && isFeatureExpanded && featureIndex !== -1 && (
                                <div className="mt-4 pt-4 border-t space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                      control={control}
                                      name={`features.${featureIndex}.dailyLimit`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>{t('dailyLimit')}</FormLabel>
                                          <FormControl>
                                            <Input
                                              type="number"
                                              placeholder={t('dailyLimitPlaceholder')}
                                              {...field}
                                              value={field.value ?? ''}
                                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                            />
                                          </FormControl>
                                          <FormDescription>{t('dailyLimitDescription')}</FormDescription>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={control}
                                      name={`features.${featureIndex}.totalLimit`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>{t('totalLimit')}</FormLabel>
                                          <FormControl>
                                            <Input
                                              type="number"
                                              placeholder={t('totalLimitPlaceholder')}
                                              {...field}
                                              value={field.value ?? ''}
                                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                            />
                                          </FormControl>
                                          <FormDescription>{t('totalLimitDescription')}</FormDescription>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>

                                  <FormField
                                    control={control}
                                    name={`features.${featureIndex}.resetInterval`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>{t('resetInterval')}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder={t('selectResetInterval')} />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="daily">{t('resetIntervals.daily')}</SelectItem>
                                            <SelectItem value="weekly">{t('resetIntervals.weekly')}</SelectItem>
                                            <SelectItem value="monthly">{t('resetIntervals.monthly')}</SelectItem>
                                            <SelectItem value="yearly">{t('resetIntervals.yearly')}</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormDescription>{t('resetIntervalDescription')}</FormDescription>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
