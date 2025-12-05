import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db-client';

import { authenticateWithApiKeyOrJWT } from '@/lib/api-key-auth';

export async function GET(request: NextRequest) {
  // Authenticate with API key or JWT token
  const authResult = await authenticateWithApiKeyOrJWT(request);
  if (authResult.error) {
    return authResult.error;
  }

  const { user, tenantId: apiKeyTenantId } = authResult;

  try {
    // If using API key, return only the tenant associated with the key
    if (apiKeyTenantId) {
      const tenant = await db.tenant.findUnique({
        where: {
          id: apiKeyTenantId,
        },
        select: {
          id: true,
          name: true,
          description: true,
          logo: true,
        },
      });

      if (!tenant) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
      }

      return NextResponse.json({ data: [tenant] });
    }

    // For JWT, get all tenants the user has access to
    const tenants = await db.tenant.findMany({
      where: {
        userTenants: {
          some: {
            userId: user.id,
            isActive: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        logo: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ data: tenants });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
