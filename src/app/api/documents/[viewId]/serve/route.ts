import { NextRequest, NextResponse } from 'next/server';
import { validateDocumentServeAccess } from '@/actions/link-access';

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: Date }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = new Date();
  const record = rateLimitMap.get(ip);

  if (!record || record.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: new Date(now.getTime() + RATE_LIMIT_WINDOW) });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ viewId: string }> }) {
  try {
    const { viewId } = await params;
    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get('download') === 'true';

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Validate access using Server Action
    const validation = await validateDocumentServeAccess(viewId);
    if (!validation.success) {
      // Determine appropriate status code
      let statusCode = 403; // Default to Forbidden
      const errorMessage = validation.error || 'Access denied';

      if (errorMessage === 'Unauthorized') {
        statusCode = 401;
      } else if (errorMessage === 'View not found' || errorMessage === 'Document not found') {
        statusCode = 404;
      } else {
        // All other errors (email validation, agreement, custom fields, etc.) are Forbidden
        statusCode = 403;
      }

      return NextResponse.json(
        {
          error: statusCode === 403 ? 'Forbidden' : errorMessage,
          message: statusCode === 403 ? 'You do not have permission to access this document' : errorMessage,
        },
        { status: statusCode }
      );
    }

    // Check download permission
    if (isDownload && !validation.allowDownload) {
      return NextResponse.json({ error: 'Download is not allowed' }, { status: 403 });
    }

    if (!validation.fileUrl) {
      return NextResponse.json({ error: 'Document file not available' }, { status: 404 });
    }

    // Proxy the file from UploadThing
    try {
      const fileResponse = await fetch(validation.fileUrl);
      if (!fileResponse.ok) {
        return NextResponse.json({ error: 'Failed to fetch document' }, { status: 502 });
      }

      const fileBuffer = await fileResponse.arrayBuffer();
      const contentType = validation.contentType || fileResponse.headers.get('content-type') || 'application/octet-stream';

      // Set appropriate headers
      const headers = new Headers();
      headers.set('Content-Type', contentType);
      headers.set('Content-Length', fileBuffer.byteLength.toString());

      if (isDownload) {
        headers.set('Content-Disposition', `attachment; filename="${validation.documentName || 'document'}"`);
      } else {
        headers.set('Content-Disposition', `inline; filename="${validation.documentName || 'document'}"`);
      }

      // Security headers
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('X-Frame-Options', 'DENY');

      // Add viewer info for watermarking (if enabled)
      if (validation.enableWatermark && validation.viewerEmail) {
        headers.set('X-Viewer-Email', validation.viewerEmail);
      }
      if (validation.viewerName) {
        headers.set('X-Viewer-Name', validation.viewerName);
      }

      return new NextResponse(fileBuffer, {
        status: 200,
        headers,
      });
    } catch (error) {
      console.error('Error fetching document:', error);
      return NextResponse.json({ error: 'Failed to serve document' }, { status: 502 });
    }
  } catch (error) {
    console.error('Error in document serve endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
