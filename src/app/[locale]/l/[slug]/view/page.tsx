import { notFound, redirect } from 'next/navigation';
import { validateDocumentView } from '@/actions/link-access';
import { getFeedbackQuestion, type FeedbackQuestionData } from '@/actions/document-feedback';

import { validateLinkSession } from '@/lib/link-session';
import { PublicDocumentViewer } from '@/components/public/public-document-viewer';

interface DocumentViewPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function DocumentViewPage({ params, searchParams }: DocumentViewPageProps & { searchParams: Promise<{ viewId?: string }> }) {
  const { slug } = await params;
  const { viewId: queryViewId } = await searchParams;

  // STEP 1: Validate session from cookie or query param
  let session = await validateLinkSession();

  // If no session from cookie but we have viewId from query param, get linkId from DocumentView
  if (!session && queryViewId) {
    // Get the DocumentView to extract linkId
    const { db } = await import('@/server/db-client');
    const documentView = await db.documentView.findUnique({
      where: { id: queryViewId },
      select: { linkId: true },
    });

    if (documentView) {
      // Create temporary session data from query param
      // The cookie should be set by now, but if not, we use the query param
      session = { viewId: queryViewId, linkId: documentView.linkId };
    }
  }

  if (!session) {
    // No valid session, redirect back to validation page
    redirect(`/l/${slug}`);
  }

  // STEP 2: Validate viewId and get document data
  const viewData = await validateDocumentView(session.viewId, session.linkId);
  if (!viewData.success || !viewData.document || !viewData.link) {
    // Invalid viewId or document not found, redirect back to validation page
    redirect(`/l/${slug}`);
  }

  // STEP 3: Get feedback question if enabled
  let feedbackData: FeedbackQuestionData | undefined;
  if (viewData.link.enableFeedback) {
    const feedbackResult = await getFeedbackQuestion(session.linkId, viewData.tenantId!);
    if (feedbackResult.success && feedbackResult.feedback) {
      feedbackData = feedbackResult.feedback;
    }
  }

  // STEP 4: Render document viewer
  return (
    <div className="min-h-screen bg-background">
      <PublicDocumentViewer
        viewId={session.viewId}
        documentId={viewData.document.id}
        tenantId={viewData.tenantId!}
        contentType={viewData.document.contentType}
        title={viewData.document.name}
        allowDownload={viewData.link.allowDownload ?? false}
        enableScreenshotProtection={viewData.link.enableScreenshotProtection ?? false}
        enableWatermark={viewData.link.enableWatermark ?? false}
        linkId={session.linkId}
        enableFeedback={viewData.link.enableFeedback ?? false}
        enableQuestion={viewData.link.enableQuestion ?? false}
        enableConversation={viewData.link.enableConversation ?? false}
        viewerEmail={viewData.viewer?.email}
        viewerName={viewData.viewer?.name}
        feedbackData={feedbackData}
      />
    </div>
  );
}
