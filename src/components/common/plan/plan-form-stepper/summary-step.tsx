import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { planFeatureSchema, planInfoSchema } from './schemas';

type PlanInfoFormValues = z.infer<typeof planInfoSchema>;
type PlanFeatureFormValues = z.infer<typeof planFeatureSchema>;

type SummaryStepProps = {
  planData: PlanInfoFormValues & PlanFeatureFormValues;
};

// Mock data for features (replace with actual data fetching logic)
const features = [
  { id: '1', name: 'Feature 1' },
  { id: '2', name: 'Feature 2' },
  { id: '3', name: 'Feature 3' },
];

export function SummaryStep({ planData }: SummaryStepProps) {
  const t = useTranslations('plans.form.summaryStep');

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>{t('header.title')}</CardTitle>
        <CardDescription>{t('header.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex-col flex overflow-hidden gap-4">
        <div className="space-y-4">
          <div>
            <p>
              <strong>{t('name')}:</strong> {planData.name}
            </p>
            <p>
              <strong>{t('description')}:</strong> {planData.description}
            </p>
            <p>
              <strong>{t('price')}:</strong> ${planData.price}
            </p>
            <p>
              <strong>{t('duration')}:</strong> {planData.durationInDays ? `${planData.durationInDays} ${t('days')}` : t('unlimited')}
            </p>
          </div>
          <div>
            <h4 className="text-md font-medium">{t('features')}:</h4>
            <ul className="list-inside list-disc">
              {planData.features.map((feature, index) => (
                <li key={index}>
                  {features.find((f) => f.id === feature.featureId)?.name || t('unknownFeature')}
                  {feature.dailyLimit && ` - ${t('dailyLimit')}: ${feature.dailyLimit}`}
                  {feature.totalLimit && ` - ${t('totalLimit')}: ${feature.totalLimit}`}
                  {feature.resetInterval && ` - ${t('reset')}: ${feature.resetInterval}`}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
