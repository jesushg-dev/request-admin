'use client';

import { useEffect, useState } from 'react';
import { getAllFeaturesForPlans } from '@/actions/plan';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { planFeatureSchema, planInfoSchema } from './schemas';

type PlanInfoFormValues = z.infer<typeof planInfoSchema>;
type PlanFeatureFormValues = z.infer<typeof planFeatureSchema>;

type SummaryStepProps = {
  planData: PlanInfoFormValues & PlanFeatureFormValues;
};

type Feature = {
  id: string;
  name: string;
  module: {
    id: string;
    name: string;
  };
};

export function SummaryStep({ planData }: SummaryStepProps) {
  const t = useTranslations('plans.form.summaryStep');
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllFeaturesForPlans()
      .then((data) => {
        setFeatures(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error loading features:', error);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-hidden">
      <Card>
        <CardHeader>
          <CardTitle>{t('header.title')}</CardTitle>
          <CardDescription>{t('header.description')}</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('header.basicInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('name')}</p>
              <p className="text-base">{planData.name}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('description')}</p>
              <p className="text-base">{planData.description}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('price')}</p>
              <p className="text-base">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(planData.price)}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('duration')}</p>
              <p className="text-base">
                {planData.durationInDays ? `${planData.durationInDays} ${t('days')}` : t('unlimited')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('header.features')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">{t('loading')}</p>
            ) : planData.features.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noFeatures')}</p>
            ) : (
              <div className="space-y-2">
                {planData.features.map((feature, index) => {
                  const featureData = features.find((f) => f.id === feature.featureId);
                  return (
                    <div key={index} className="rounded-lg border p-3">
                      <p className="font-medium">
                        {featureData ? `${featureData.module.name} - ${featureData.name}` : t('unknownFeature')}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {feature.dailyLimit && <span>{t('dailyLimit')}: {feature.dailyLimit}</span>}
                        {feature.totalLimit && <span>{t('totalLimit')}: {feature.totalLimit}</span>}
                        {feature.resetInterval && <span>{t('reset')}: {feature.resetInterval}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
