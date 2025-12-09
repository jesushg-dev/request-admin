import { notFound, redirect } from 'next/navigation';
import { createLinkAccessSession, validateLinkAccess } from '@/actions/link-access';

import { LinkAccessGuard } from '@/components/public/link-access-guard';

interface PublicLinkPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicLinkPage({ params }: PublicLinkPageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const validation = await validateLinkAccess(slug);

  if (!validation.success || !validation.link) {
    notFound();
  }

  // If no validations are required, redirect to Route Handler to create session
  // Route Handlers can modify cookies, so this is the correct approach
  if (validation.initialStep === 'complete') {
    redirect(`/api/link-access/${slug}`);
  }

  // Render validation forms if validations are required
  return (
    <div className="min-h-screen bg-background">
      <LinkAccessGuard slug={slug} initialStep={validation.initialStep || 'password'} link={validation.link} />
    </div>
  );
}
