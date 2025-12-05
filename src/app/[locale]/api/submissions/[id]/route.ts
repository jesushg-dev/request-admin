import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/server/db-client';

import { authenticateWithApiKeyOrJWT, validateTenantAccess } from '@/lib/api-key-auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Authenticate with API key or JWT token
  const authResult = await authenticateWithApiKeyOrJWT(request);
  if (authResult.error) {
    return authResult.error;
  }

  const { user, tenantId: apiKeyTenantId } = authResult;
  const { id } = await params;

  // Get tenantId from API key (if using API key) or from query params (if using JWT)
  const { searchParams } = new URL(request.url);
  const queryTenantId = searchParams.get('tenantId');
  const tenantId = apiKeyTenantId || queryTenantId;

  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId is required. For API keys, it is automatically included. For JWT, provide it as a query parameter.' }, { status: 400 });
  }

  // Validate tenant access (only for JWT, API keys are already scoped to tenant)
  if (!apiKeyTenantId) {
    const hasAccess = await validateTenantAccess(user.id, tenantId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied to this tenant' }, { status: 403 });
    }
  }

  try {
    // Get database client with user context
    const db = await getDb(user);

    // Query submission by id and tenant
    const submission = await db.formSubmission.findUnique({
      where: {
        id,
        tenantId,
      },
      select: {
        id: true,
        formId: true,
        content: true,
        requestId: true,
        createdAt: true,
        updatedAt: true,
        form: {
          select: {
            id: true,
            name: true,
            shareURL: true,
          },
        },
        keys: {
          select: {
            id: true,
            key: true,
            value: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ data: submission });
  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
