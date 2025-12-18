'use client';

import { Check, CreditCard, Crown, ExternalLink, Shield, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export const planSelectionSchema = z.object({
  planId: z.string().min(1, 'Plan selection is required'),
});

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  durationInDays: number | null;
  icon?: 'zap' | 'crown' | 'shield' | 'creditCard';
  popular?: boolean;
}

export type PlanSelectionData = z.infer<typeof planSelectionSchema>;

interface PlanSelectionFormProps {
  plans: Plan[];
  isGlobalAdmin?: boolean;
}

const PlanIcon = ({ icon }: { icon?: string }) => {
  switch (icon) {
    case 'zap':
      return <Zap className="h-5 w-5" />;
    case 'crown':
      return <Crown className="h-5 w-5" />;
    case 'shield':
      return <Shield className="h-5 w-5" />;
    case 'creditCard':
      return <CreditCard className="h-5 w-5" />;
    default:
      return null;
  }
};

export function PlanSelectionStep({ plans, isGlobalAdmin = false }: PlanSelectionFormProps) {
  const t = useTranslations('tenants.form.planSelectionStep');
  const { control } = useFormContext<PlanSelectionData>();

  const handleCreateNewPlan = () => {
    window.open('/admin/global/plans/new', '_blank');
  };

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex-col flex overflow-hidden gap-4">
        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <p className="text-center text-muted-foreground">{t('noPlans')}</p>
            {isGlobalAdmin && (
              <Button type="button" variant="outline" onClick={handleCreateNewPlan}>
                {t('createNewPlan')}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <FormField
            control={control}
            name="planId"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan) => (
                      <label
                        key={plan.id}
                        className={cn(
                          'relative flex cursor-pointer flex-col rounded-lg border p-4 shadow-sm transition-all hover:border-primary hover:shadow-md',
                          field.value === plan.id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border bg-card'
                        )}>
                        {plan.popular && <span className="absolute -top-2 -right-2 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">{t('popular')}</span>}

                        <FormItem className="flex items-start space-y-0 space-x-3 w-full">
                          <FormControl>
                            <RadioGroupItem value={plan.id} className="sr-only" />
                          </FormControl>

                          <div className="flex-1 space-y-3 w-full">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {plan.icon && (
                                  <div className={cn('rounded-full p-1.5 transition-colors', field.value === plan.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                                    <PlanIcon icon={plan.icon} />
                                  </div>
                                )}
                                <span className="text-base font-semibold">{plan.name}</span>
                              </div>
                              {field.value === plan.id && <Check className="h-5 w-5 text-primary" />}
                            </div>

                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                }).format(plan.price)}
                              </span>
                              {plan.durationInDays !== null && (
                                <span className="ml-1 text-sm text-muted-foreground">
                                  / {plan.durationInDays} {t('days')}
                                </span>
                              )}
                              {plan.price === 0 && <span className="ml-2 text-xs text-muted-foreground">({t('free')})</span>}
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>
                          </div>
                        </FormItem>
                      </label>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormDescription>{t('planHelp')}</FormDescription>
                <FormMessage />
                {isGlobalAdmin && (
                  <div className="pt-2">
                    <Button type="button" variant="outline" onClick={handleCreateNewPlan} className="w-full">
                      {t('createNewPlan')}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
}
