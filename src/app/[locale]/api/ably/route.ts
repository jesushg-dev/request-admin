import { NextResponse } from 'next/server';
import { currentSession } from '@/server/auth-server';
import { db } from '@/server/db-server';
import * as Ably from 'ably';

export async function POST(req: Request) {
  // 1. Validate Ably API Key existence
  if (!process.env.ABLY_API_KEY) {
    return NextResponse.json({ error: 'ABLY_API_KEY environment variable is missing. Check your configuration.' }, { status: 500, headers: { 'content-type': 'application/json' } });
  }

  // 2. Authenticate user session
  const session = await currentSession();
  if (!session) {
    return NextResponse.json({ error: 'Authentication required. Please log in.' }, { status: 401 });
  }

  // 3. Extract and validate clientId
  const formData = await req.formData();
  const submittedClientId = formData.get('clientId')?.toString() || '';

  if (!submittedClientId) {
    return NextResponse.json({ error: 'clientId is required in form data' }, { status: 400 });
  }

  // 4. Verify user-tenant relationship
  const userTenant = await db.userTenant.findUnique({
    where: {
      id: submittedClientId,
      userId: session.user.id,
    },
    select: { id: true },
  });

  if (!userTenant) {
    return NextResponse.json({ error: 'Invalid clientId: UserTenant association not found' }, { status: 403 });
  }

  // 5. Define role-based capabilities
  const isModerator = session.user.isGlobalAdmin;
  const capabilities: NonNullable<Ably.TokenParams['capability']> = isModerator
    ? { '*': ['*'] } // Full permissions for moderators
    : {
        'chat:general': ['publish', 'subscribe', 'presence'],
        'chat:announcements': ['subscribe'],
        notifications: ['subscribe'],
      };

  try {
    // 6. Generate Ably token
    const client = new Ably.Rest(process.env.ABLY_API_KEY);
    const tokenRequestData = await client.auth.createTokenRequest({
      clientId: submittedClientId,
      capability: capabilities,
      ttl: 3600000, // 1 hour expiration
    });

    console.log(`Generated token for userTenant: ${submittedClientId}`);
    return NextResponse.json(tokenRequestData);
  } catch (error) {
    console.error('Ably token generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate Ably token. Please try again later.' }, { status: 500 });
  }
}
