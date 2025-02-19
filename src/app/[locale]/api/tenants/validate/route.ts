import { NextResponse } from 'next/server';
import { db } from '@/server/db-client';

export async function POST(request: Request) {
  const { tenantId } = (await request.json()) as { tenantId: string };

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
}
