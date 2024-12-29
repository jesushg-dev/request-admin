import { z } from 'zod';

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
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Plan Summary</h3>
      <div>
        <p>
          <strong>Name:</strong> {planData.name}
        </p>
        <p>
          <strong>Description:</strong> {planData.description}
        </p>
        <p>
          <strong>Price:</strong> ${planData.price}
        </p>
        <p>
          <strong>Duration:</strong> {planData.durationInDays ? `${planData.durationInDays} days` : 'Unlimited'}
        </p>
      </div>
      <div>
        <h4 className="text-md font-medium">Features:</h4>
        <ul className="list-inside list-disc">
          {planData.features.map((feature, index) => (
            <li key={index}>
              {features.find((f) => f.id === feature.featureId)?.name || 'Unknown Feature'}
              {feature.dailyLimit && ` - Daily Limit: ${feature.dailyLimit}`}
              {feature.totalLimit && ` - Total Limit: ${feature.totalLimit}`}
              {feature.resetInterval && ` - Reset: ${feature.resetInterval}`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
