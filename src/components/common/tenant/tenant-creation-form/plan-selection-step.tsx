'use client';

import { Check, CreditCard, Crown, Shield, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export const planSelectionSchema = z.object({
  planId: z.string().min(1, 'Plan selection is required'),
});

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  durationInDays?: number;
  icon?: 'zap' | 'crown' | 'shield' | 'creditCard';
  popular?: boolean;
}

export type PlanSelectionData = z.infer<typeof planSelectionSchema>;

interface PlanSelectionFormProps {
  plans: Plan[];
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

export function PlanSelectionStep({ plans }: PlanSelectionFormProps) {
  const t = useTranslations('tenants.form.planSelectionStep');
  const { control } = useFormContext<PlanSelectionData>();

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex-col flex overflow-hidden gap-4">
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
                        'relative flex cursor-pointer flex-col rounded-lg border p-4 shadow-sm transition-all hover:border-primary',
                        field.value === plan.id ? 'border-primary bg-primary/5' : 'border-border'
                      )}>
                      {plan.popular && <span className="absolute -top-2 -right-2 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">{t('popular')}</span>}

                      <FormItem className="flex items-start space-y-0 space-x-3">
                        <FormControl>
                          <RadioGroupItem value={plan.id} className="sr-only" />
                        </FormControl>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center">
                            {plan.icon && (
                              <div className={cn('mr-2 rounded-full p-1.5', field.value === plan.id ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                <PlanIcon icon={plan.icon} />
                              </div>
                            )}
                            <span className="text-base font-medium">{plan.name}</span>
                            {field.value === plan.id && <Check className="ml-auto h-5 w-5 text-primary" />}
                          </div>

                          <div className="flex items-baseline">
                            <span className="text-xl font-bold">${plan.price}</span>
                            {plan.durationInDays && (
                              <span className="ml-1 text-sm text-muted-foreground">
                                / {plan.durationInDays} {t('days')}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </div>
                      </FormItem>
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
