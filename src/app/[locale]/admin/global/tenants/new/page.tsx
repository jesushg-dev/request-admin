import { TenantCreationForm } from '@/components/common/tenant/tenant-creation-form';
import { Module, Plan } from '@/components/common/tenant/tenant-creation-form/types';

// Mock data for modules and plans
const mockModules: Module[] = [
  { id: '1', name: 'Orders', description: 'Manage orders and track their status', isActive: false },
  { id: '2', name: 'Settings', description: 'Configure system settings and preferences', isActive: false },
  { id: '3', name: 'Analytics', description: 'View and analyze business metrics', isActive: false },
  { id: '4', name: 'User Management', description: 'Manage user accounts and permissions', isActive: false },
];

const mockPlans: Plan[] = [
  { id: '1', name: 'Basic', description: 'Essential features for small businesses', price: 0 },
  { id: '2', name: 'Pro', description: 'Advanced features for growing businesses', price: 99.99, durationInDays: 30 },
  { id: '3', name: 'Enterprise', description: 'Full suite of features for large organizations', price: 299.99, durationInDays: 30 },
];

export default function CreateTenantPage() {
  return <TenantCreationForm modules={mockModules} plans={mockPlans} />;
}
