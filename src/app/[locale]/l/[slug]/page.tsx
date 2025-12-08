import { notFound } from 'next/navigation';
import { validateLinkAccess } from '@/actions/link-access';
import { LinkAccessGuard } from '@/components/public/link-access-guard';

interface PublicLinkPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function PublicLinkPage({ params }: PublicLinkPageProps) {
  const { slug } = await params;

  const validation = await validateLinkAccess(slug);
  console.log("validation", validation);

  if (!validation.success || !validation.link) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <LinkAccessGuard slug={slug} link={validation.link} document={validation.document} />
    </div>
  );
}

