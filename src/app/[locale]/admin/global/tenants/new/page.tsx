import { redirect } from 'next/navigation';
import { getAllPlans } from '@/actions/plan';
import { currentSession } from '@/server/auth-server';

import { TenantCreationForm } from '@/components/common/tenant/tenant-creation-form';

export default async function CreateTenantPage() {
  const session = await currentSession();
  if (!session?.user) {
    redirect('/auth/login?error=UNAUTHORIZED');
  }

  const plans = await getAllPlans();

  return <TenantCreationForm plans={plans} isGlobalAdmin={session.user.isGlobalAdmin ?? false} />;
}
