import { TenantCreationForm } from '@/components/common/tenant/tenant-creation-form';
import { Plan } from '@/components/common/tenant/tenant-creation-form/plan-selection-step';

const mockPlans: Plan[] = [
  { id: '1', name: 'Basic', description: 'Essential features for small businesses', price: 0 },
  { id: '2', name: 'Pro', description: 'Advanced features for growing businesses', price: 99.99, durationInDays: 30 },
  { id: '3', name: 'Enterprise', description: 'Full suite of features for large organizations', price: 299.99, durationInDays: 30 },
];

export default function CreateTenantPage() {
  return <TenantCreationForm plans={mockPlans} />;
}
