import { NextRequest, NextResponse } from 'next/server';
import { validateLinkAccess } from '@/actions/link-access';
import { db } from '@/server/db-client';

import { generateUuid } from '@/lib/id';
import { createLinkSession } from '@/lib/link-session';

/**
 * Route Handler to create link access session when no validations are required
 * Route Handlers can modify cookies, so this is the correct approach
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    // STEP 1: Validate link exists and is accessible
    const linkValidation = await validateLinkAccess(slug);
    if (!linkValidation.success || !linkValidation.link) {
      return NextResponse.json({ error: linkValidation.error || 'Link not found' }, { status: 404 });
    }

    // STEP 2: Verify that no validations are required
    if (linkValidation.initialStep !== 'complete') {
      return NextResponse.json({ error: 'Validations are required for this link' }, { status: 400 });
    }

    const link = linkValidation.link;

    // STEP 3: Create DocumentView directly (no validations needed)
    const viewId = generateUuid();
    await db.documentView.create({
      data: {
        id: viewId,
        linkId: link.id,
        documentId: link.documentId,
        dataroomId: link.dataroomId,
        viewerEmail: undefined,
        viewerName: undefined,
        verified: false,
        viewType: link.linkType === 'DATAROOM_LINK' ? 'DATAROOM_VIEW' : 'DOCUMENT_VIEW',
        tenantId: link.tenantId,
      },
    });

    // STEP 4: Create session token for secure access
    // Route Handlers can modify cookies, so this works correctly
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;
    await createLinkSession(viewId, link.id, ipAddress, userAgent);

    // Redirect to view page with viewId as query param to avoid cookie timing issues
    // The view page will use the query param if cookie is not yet available
    const redirectUrl = new URL(`/l/${slug}/view?viewId=${viewId}`, request.url);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error in link access route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
