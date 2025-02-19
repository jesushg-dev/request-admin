import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db-client';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const POST = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.redirect('/auth/login');
  }

  const { tenantId } = await req.json();

  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
  }

  try {
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    const isValid = !!tenant;
    return NextResponse.json({ isValid }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
