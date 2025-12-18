import { getAllFeaturesForPlans } from '@/actions/plan';
import { currentSession } from '@/server/auth-server';
import PlanCreationForm from '@/components/common/plan/plan-form-stepper';
import { redirect } from 'next/navigation';

export default async function CreatePlanPage() {
  const session = await currentSession();
  if (!session?.user.isGlobalAdmin) {
    redirect('/auth/login?error=UNAUTHORIZED');
  }

  const features = await getAllFeaturesForPlans();

  return <PlanCreationForm features={features} />;
}
