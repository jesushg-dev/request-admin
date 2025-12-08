import { notFound } from 'next/navigation';
import { validateLinkAccess } from '@/actions/link-access';
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
    console.error('Link validation failed:', { slug, validation });
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <LinkAccessGuard slug={slug} link={validation.link} document={validation.document} />
    </div>
  );
}

