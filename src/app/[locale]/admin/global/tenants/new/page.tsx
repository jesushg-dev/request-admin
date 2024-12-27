'use client';

import { useState } from 'react';

import { TenantCreationForm } from '@/components/common/tenant/tenant-creation-form';
import { Module, Plan, TenantFormData } from '@/components/common/tenant/types';

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
  const [creationStatus, setCreationStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (data: TenantFormData) => {
    console.log('Form data:', data);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Process payment if price > 0
    const selectedPlan = mockPlans.find((plan) => plan.id === data.planId);
    if (selectedPlan && selectedPlan.price > 0) {
      console.log('Processing payment for plan:', selectedPlan.name);
      // Implement payment processing logic here
    }

    // Simulate successful creation
    setCreationStatus('success');
  };

  return (
    <div className="container mx-auto px-4 py-10">
      {creationStatus === 'success' ? (
        <div className="relative rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> Tenant created successfully.</span>
        </div>
      ) : (
        <TenantCreationForm modules={mockModules} plans={mockPlans} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
